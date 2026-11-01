import { GoogleGenAI } from '@google/genai';
import { env } from '../../config/env';
import {
  IAIProvider,
  IChatMessage,
  IToolDefinition,
  IToolCall,
  IAIProviderResponse,
} from './ai.provider.interface';
import { classifyAIError } from './ai.error.handler';

export class GeminiProvider implements IAIProvider {
  public readonly providerName = 'gemini' as const;
  private client: GoogleGenAI;
  private modelName: string;

  constructor() {
    this.client = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
    this.modelName = env.GEMINI_MODEL || 'gemini-3.7-flash';
  }

  public async generateChatResponse(
    messages: IChatMessage[],
    tools?: IToolDefinition[],
    systemInstruction?: string
  ): Promise<IAIProviderResponse> {
    try {
      // 1. Format contents for Gemini
      const contents = messages.map((m) => {
        if (m.role === 'tool') {
          return {
            role: 'user',
            parts: [
              {
                functionResponse: {
                  name: m.name || 'tool',
                  response: { result: m.content },
                },
              },
            ],
          };
        }

        if (m.role === 'assistant' && m.rawParts && m.rawParts.length > 0) {
          return {
            role: 'model',
            parts: m.rawParts,
          };
        }

        if (m.role === 'assistant' && m.toolCalls && m.toolCalls.length > 0) {
          const parts: any[] = [];
          if (m.content) {
            parts.push({ text: m.content });
          }
          for (const tc of m.toolCalls) {
            parts.push({
              functionCall: {
                name: tc.name,
                args: tc.args || {},
              },
            });
          }
          return {
            role: 'model',
            parts,
          };
        }

        return {
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content || '' }],
        };
      });

      // 2. Format tool declarations if provided
      const config: any = {
        temperature: 0.4,
      };

      if (systemInstruction) {
        config.systemInstruction = {
          parts: [{ text: systemInstruction }],
        };
      }

      if (tools && tools.length > 0) {
        config.tools = [
          {
            functionDeclarations: tools.map((t) => ({
              name: t.name,
              description: t.description,
              parameters: t.parameters as any,
            })),
          },
        ];
      }

      // 3. Call Gemini
      const response = await this.client.models.generateContent({
        model: this.modelName,
        contents,
        config,
      });

      // 4. Extract function calls or text
      const toolCalls: IToolCall[] = [];
      const rawFunctionCalls = response.functionCalls;

      if (rawFunctionCalls && Array.isArray(rawFunctionCalls)) {
        for (const fc of rawFunctionCalls) {
          toolCalls.push({
            id: `call_${Math.random().toString(36).substring(2, 10)}`,
            name: fc.name || 'unnamed_tool',
            args: fc.args || {},
          });
        }
      }

      const content = typeof response.text === 'string' ? response.text : '';

      return {
        content,
        provider: 'gemini',
        model: this.modelName,
        toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
        rawParts: response.candidates?.[0]?.content?.parts,
      };
    } catch (err: any) {
      throw classifyAIError(err, 'gemini');
    }
  }
}
