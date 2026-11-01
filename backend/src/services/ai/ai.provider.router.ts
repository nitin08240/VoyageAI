import {
  IAIProvider,
  IChatMessage,
  IToolDefinition,
  IAIProviderResponse,
} from './ai.provider.interface';
import { GeminiProvider } from './gemini.provider';
import { GroqProvider } from './groq.provider';
import { AIProviderError, AIErrorKind } from './ai.error.handler';
import { env } from '../../config/env';

export class AIProviderRouter {
  private geminiProvider: GeminiProvider;
  private groqProvider: GroqProvider;
  private primaryType: 'gemini' | 'groq';
  private fallbackType: 'gemini' | 'groq';
  private forceSimulatePrimaryFailure = false;

  constructor() {
    this.geminiProvider = new GeminiProvider();
    this.groqProvider = new GroqProvider();
    this.primaryType = (env.AI_PRIMARY_PROVIDER as 'gemini' | 'groq') || 'gemini';
    this.fallbackType = (env.AI_FALLBACK_PROVIDER as 'gemini' | 'groq') || 'groq';
  }

  public setSimulatePrimaryFailure(simulate: boolean): void {
    this.forceSimulatePrimaryFailure = simulate;
  }

  private getProvider(type: 'gemini' | 'groq'): IAIProvider {
    return type === 'gemini' ? this.geminiProvider : this.groqProvider;
  }

  public async generateChatResponse(
    messages: IChatMessage[],
    tools?: IToolDefinition[],
    systemInstruction?: string
  ): Promise<IAIProviderResponse> {
    const primary = this.getProvider(this.primaryType);
    const fallback = this.getProvider(this.fallbackType);

    // 1. Try Primary Provider
    try {
      if (this.forceSimulatePrimaryFailure) {
        throw new AIProviderError(
          'Simulated Gemini quota exhaustion for fallback verification.',
          AIErrorKind.QUOTA_EXHAUSTED,
          'gemini',
          429,
          true
        );
      }

      const response = await primary.generateChatResponse(messages, tools, systemInstruction);
      return response;
    } catch (primaryErr: any) {
      const isEligible = primaryErr instanceof AIProviderError && primaryErr.isFallbackEligible;

      console.warn(
        `[AIProviderRouter] Primary provider (${this.primaryType.toUpperCase()}) notice: ${primaryErr.message}`
      );

      // If error is not eligible for fallback (e.g. invalid credentials or configuration), do not mask it
      if (!isEligible) {
        throw primaryErr;
      }

      console.log(
        `[AIProviderRouter] 🔄 Activating fallback provider (${this.fallbackType.toUpperCase()})...`
      );

      // 2. Try Fallback Provider
      try {
        const fallbackResponse = await fallback.generateChatResponse(
          messages,
          tools,
          systemInstruction
        );
        return fallbackResponse;
      } catch (fallbackErr: any) {
        console.error(
          `[AIProviderRouter] ❌ Fallback provider (${this.fallbackType.toUpperCase()}) failed:`,
          fallbackErr.message
        );

        throw new AIProviderError(
          `Both AI providers (${this.primaryType} and ${this.fallbackType}) are currently unavailable. Please try again shortly.`,
          AIErrorKind.TRANSIENT_SERVICE_ERROR,
          'router',
          503,
          false
        );
      }
    }
  }
}

export const aiProviderRouter = new AIProviderRouter();

