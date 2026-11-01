import { env } from '../../config/env';
import {
  IAIProvider,
  IChatMessage,
  IToolDefinition,
  IToolCall,
  IAIProviderResponse,
} from './ai.provider.interface';
import { classifyAIError, AIErrorKind, AIProviderError } from './ai.error.handler';

export class GroqProvider implements IAIProvider {
  public readonly providerName = 'groq' as const;
  private apiKey?: string;
  private modelName: string;
  private apiEndpoint = 'https://api.groq.com/openai/v1/chat/completions';

  constructor() {
    this.apiKey = env.GROQ_API_KEY;
    this.modelName = env.GROQ_MODEL || 'llama-3.3-70b-versatile';
  }

  public async generateChatResponse(
    messages: IChatMessage[],
    tools?: IToolDefinition[],
    systemInstruction?: string
  ): Promise<IAIProviderResponse> {
    if (!this.apiKey) {
      throw new AIProviderError(
        'Groq API key is not configured in backend environment variables.',
        AIErrorKind.AUTH_ERROR,
        'groq',
        401,
        false
      );
    }

    try {
      const groqMessages: any[] = [];

      if (systemInstruction) {
        groqMessages.push({
          role: 'system',
          content: systemInstruction,
        });
      }

      for (const m of messages) {
        if (m.role === 'tool') {
          groqMessages.push({
            role: 'tool',
            tool_call_id: m.toolCallId || `call_${m.name || 'tool'}`,
            name: m.name,
            content: typeof m.content === 'string' ? m.content : JSON.stringify(m.content),
          });
        } else if (m.role === 'assistant') {
          const assistantMsg: any = {
            role: 'assistant',
            content: m.content || '',
          };
          if (m.toolCalls && m.toolCalls.length > 0) {
            assistantMsg.tool_calls = m.toolCalls.map((tc) => ({
              id: tc.id || `call_${Math.random().toString(36).substring(2, 9)}`,
              type: 'function',
              function: {
                name: tc.name,
                arguments: JSON.stringify(tc.args || {}),
              },
            }));
          }
          groqMessages.push(assistantMsg);
        } else {
          groqMessages.push({
            role: 'user',
            content: m.content,
          });
        }
      }

      const body: any = {
        model: this.modelName,
        messages: groqMessages,
        temperature: 0.3,
      };

      if (tools && tools.length > 0) {
        body.tools = tools.map((t) => ({
          type: 'function',
          function: {
            name: t.name,
            description: t.description,
            parameters: t.parameters,
          },
        }));
        body.tool_choice = 'auto';
      }

      let data: any = null;
      let lastErr: any = null;

      for (let attempt = 1; attempt <= 3; attempt++) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 45000);

        try {
          const response = await fetch(this.apiEndpoint, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
            signal: controller.signal,
          });

          clearTimeout(timeoutId);
          data = await response.json();

          if (response.status === 429 && attempt < 3) {
            console.warn(`[GroqProvider] Rate limit (429) on attempt ${attempt}. Waiting 3.5s to retry...`);
            await new Promise((r) => setTimeout(r, 3500));
            continue;
          }

          if (!response.ok) {
            throw {
              status: response.status,
              message: data?.error?.message || response.statusText,
              code: data?.error?.code,
            };
          }

          lastErr = null;
          break;
        } catch (fetchErr: any) {
          clearTimeout(timeoutId);
          lastErr = fetchErr;
          if (attempt < 3) {
            await new Promise((r) => setTimeout(r, 3500));
            continue;
          }
          throw fetchErr;
        }
      }

      if (lastErr) throw lastErr;

      const choice = data.choices?.[0];
      const message = choice?.message;
      const toolCalls: IToolCall[] = [];

      if (message?.tool_calls && Array.isArray(message.tool_calls)) {
        for (const tc of message.tool_calls) {
          let parsedArgs = {};
          try {
            parsedArgs = JSON.parse(tc.function?.arguments || '{}');
          } catch {
            parsedArgs = {};
          }
          toolCalls.push({
            id: tc.id || `call_${Math.random().toString(36).substring(2, 9)}`,
            name: tc.function?.name,
            args: parsedArgs,
          });
        }
      }

      return {
        content: message?.content || '',
        provider: 'groq',
        model: this.modelName,
        toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
      };
    } catch (err: any) {
      throw classifyAIError(err, 'groq');
    }
  }
}

