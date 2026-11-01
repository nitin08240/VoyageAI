import { apiGet, apiPost, apiDelete } from './api';
import {
  SendMessageResponse,
  IConversationSummary,
  IConversation,
} from '@/types/chat.types';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export const chatService = {
  sendMessage: async (payload: {
    conversationId?: string | null;
    tripId?: string | null;
    message: string;
  }): Promise<SendMessageResponse> => {
    // Chat tool-calling can take 30-90s; use a longer timeout than the default 30s
    const res = await apiPost<ApiResponse<SendMessageResponse>>('/chat/message', payload, {
      timeout: 90000,
    });
    return res.data.data;
  },

  getHistory: async (): Promise<IConversationSummary[]> => {
    const res = await apiGet<ApiResponse<IConversationSummary[]>>('/chat/history');
    return res.data.data;
  },

  getConversation: async (conversationId: string): Promise<IConversation> => {
    const res = await apiGet<ApiResponse<IConversation>>(`/chat/${conversationId}`);
    return res.data.data;
  },

  deleteConversation: async (conversationId: string): Promise<{ message: string }> => {
    const res = await apiDelete<ApiResponse<{ message: string }>>(`/chat/${conversationId}`);
    return res.data.data;
  },

  applyItinerarySuggestion: async (payload: {
    tripId: string;
    dayNumber: number;
    slot: 'morning' | 'afternoon' | 'evening';
    newActivity: {
      name: string;
      description?: string;
      duration?: string;
      cost?: string | number;
    };
  }): Promise<any> => {
    const res = await apiPost<ApiResponse<any>>('/chat/apply-suggestion', payload);
    return res.data.data;
  },
};

