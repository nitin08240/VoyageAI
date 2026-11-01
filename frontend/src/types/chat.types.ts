export interface IStructuredCard {
  type: 'place' | 'weather' | 'route' | 'suggestion' | 'itinerary_action';
  data: any;
}

export interface IChatMessage {
  _id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt?: string | Date;
  provider?: 'gemini' | 'groq' | 'system';
  model?: string;
  structuredCards?: IStructuredCard[];
}

export interface IConversationSummary {
  conversationId: string;
  title: string;
  trip?: {
    _id: string;
    destination: { name: string; country: string };
    dates?: { start: string; end: string };
    duration?: number;
  };
  messageCount: number;
  lastMessage: string;
  lastMessageRole?: string;
  updatedAt: string;
}

export interface IConversation {
  _id: string;
  userId: string;
  tripId?: string | null;
  title: string;
  messages: IChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface SendMessageResponse {
  success: boolean;
  conversationId: string;
  title: string;
  tripId?: string | null;
  message: IChatMessage;
  sources: string[];
  places: any[];
}

