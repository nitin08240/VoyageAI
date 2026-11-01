export interface IToolParameterProperty {
  type: string;
  description: string;
  enum?: string[];
  items?: {
    type: string;
  };
}

export interface IToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, IToolParameterProperty>;
    required?: string[];
  };
}

export interface IToolCall {
  id: string;
  name: string;
  args: Record<string, any>;
}

export interface IChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  name?: string;
  toolCallId?: string;
  toolCalls?: IToolCall[];
  rawParts?: any[];
}

export interface IAIProviderResponse {
  content: string;
  provider: 'gemini' | 'groq';
  model: string;
  toolCalls?: IToolCall[];
  rawParts?: any[];
}

export interface IAIProvider {
  readonly providerName: 'gemini' | 'groq';
  generateChatResponse(
    messages: IChatMessage[],
    tools?: IToolDefinition[],
    systemInstruction?: string
  ): Promise<IAIProviderResponse>;
}

