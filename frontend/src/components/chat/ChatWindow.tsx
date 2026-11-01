import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  Sparkles,
  RotateCcw,
  History,
  Trash2,
  ChevronLeft,
  Bot,
  User,
  ArrowRight,
  Compass,
} from 'lucide-react';
import { chatService } from '@/services/chatService';
import { IChatMessage, IConversationSummary } from '@/types/chat.types';
import {
  PlaceCard,
  WeatherCard,
  RouteCard,
  ItineraryActionCard,
} from './StructuredCards';

interface ChatWindowProps {
  onClose: () => void;
  activeTripId?: string | null;
  activeTripDestination?: string | null;
}

const SUGGESTED_PROMPTS = [
  'What are the best places near Rishikesh?',
  'Check Manali weather forecast',
  'Road travel from Haridwar to Rishikesh',
  'Plan a weekend trip under ₹5,000',
  'Suggest local Himachali food in Manali',
  'What should I pack for Uttarakhand in winter?',
];

export const ChatWindow: React.FC<ChatWindowProps> = ({
  onClose,
  activeTripId,
  activeTripDestination,
}) => {
  const [messages, setMessages] = useState<IChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [historyList, setHistoryList] = useState<IConversationSummary[]>([]);
  const [activeProvider, setActiveProvider] = useState<string>('gemini');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Load history list when history drawer opens
  const fetchHistory = async () => {
    try {
      const list = await chatService.getHistory();
      setHistoryList(list);
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  };

  const handleSelectConversation = async (id: string) => {
    setIsLoading(true);
    try {
      const conv = await chatService.getConversation(id);
      setConversationId(conv._id);
      setMessages(conv.messages);
      setShowHistory(false);
    } catch (err) {
      console.error('Failed to open conversation:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConversation = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm('Delete this conversation?')) return;
    try {
      await chatService.deleteConversation(id);
      setHistoryList((prev) => prev.filter((item) => item.conversationId !== id));
      if (conversationId === id) {
        handleNewChat();
      }
    } catch (err) {
      console.error('Failed to delete conversation:', err);
    }
  };

  const handleNewChat = () => {
    setConversationId(null);
    setMessages([]);
    setShowHistory(false);
    setInputText('');
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    const userMessage: IChatMessage = {
      role: 'user',
      content: text,
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const res = await chatService.sendMessage({
        conversationId,
        tripId: activeTripId || null,
        message: text,
      });

      if (!conversationId && res.conversationId) {
        setConversationId(res.conversationId);
      }

      if (res.message.provider) {
        setActiveProvider(res.message.provider);
      }

      setMessages((prev) => [...prev, res.message]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMessage: IChatMessage = {
        role: 'assistant',
        content:
          err?.response?.data?.message ||
          'I encountered a brief connection issue. Please check your question or retry in a moment.',
        provider: 'system',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-navy-950/95 backdrop-blur-2xl text-slate-100 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden font-sans">
      {/* ─── Header ────────────────────────────────────────────── */}
      <div className="px-4 py-3 bg-navy-900/90 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-accent-600 to-accent-400 flex items-center justify-center text-white shadow-md shadow-accent-500/20">
              <Bot className="w-4 h-4" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-navy-950 rounded-full" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm text-white leading-tight">VoyageAI Assistant</h3>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono uppercase bg-slate-800 text-slate-300 border border-slate-700/60">
                {activeProvider}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Personal Travel Expert • Multilingual</p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-slate-400">
          <button
            onClick={() => {
              if (!showHistory) fetchHistory();
              setShowHistory(!showHistory);
            }}
            className={`p-1.5 rounded-lg hover:text-white hover:bg-slate-800 transition-colors ${
              showHistory ? 'text-accent-400 bg-slate-800' : ''
            }`}
            title="Chat History"
          >
            <History className="w-4 h-4" />
          </button>
          <button
            onClick={handleNewChat}
            className="p-1.5 rounded-lg hover:text-white hover:bg-slate-800 transition-colors"
            title="New Conversation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:text-white hover:bg-slate-800 transition-colors"
            title="Close Assistant"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ─── Active Trip Context Banner ─────────────────────────── */}
      {activeTripId && (
        <div className="bg-accent-500/10 border-b border-accent-500/20 px-3.5 py-1.5 flex items-center justify-between text-[11px] text-accent-300 shrink-0">
          <div className="flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-accent-400" />
            <span>Consulting for active trip{activeTripDestination ? `: ${activeTripDestination}` : ''}</span>
          </div>
          <span className="text-[10px] text-accent-400 font-mono">Trip Mode Active</span>
        </div>
      )}

      {/* ─── Main Content Area (Messages or History) ───────────── */}
      {showHistory ? (
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs font-semibold text-slate-300">
            <button
              onClick={() => setShowHistory(false)}
              className="flex items-center gap-1 text-accent-400 hover:text-accent-300"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to chat
            </button>
            <span>Saved Conversations</span>
          </div>

          {historyList.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No saved conversations yet. Start asking questions!
            </div>
          ) : (
            historyList.map((item) => (
              <div
                key={item.conversationId}
                onClick={() => handleSelectConversation(item.conversationId)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 text-xs ${
                  conversationId === item.conversationId
                    ? 'bg-accent-500/15 border-accent-500/40 text-white'
                    : 'bg-navy-900/60 border-slate-800/80 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <h4 className="font-medium text-slate-200 truncate">{item.title}</h4>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    {item.lastMessage || 'No messages'}
                  </p>
                </div>
                <button
                  onClick={(e) => handleDeleteConversation(e, item.conversationId)}
                  className="text-slate-500 hover:text-red-400 p-1 rounded transition-colors"
                  title="Delete conversation"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Welcome Intro when no messages */}
          {messages.length === 0 && (
            <div className="space-y-4 py-4">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-accent-500/10 border border-accent-500/20 text-accent-400 flex items-center justify-center mx-auto shadow-inner">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h4 className="font-serif font-bold text-lg text-white">
                  Welcome to VoyageAI Assistant
                </h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                  I can discover authentic attractions within 70 km, forecast weather, calculate road routes, find local dining, or help refine your saved trips.
                </p>
                <p className="text-[11px] text-slate-500 italic">
                  Available in English, Hindi (हिंदी), and Hinglish.
                </p>
              </div>

              {/* Prompt Suggestions */}
              <div className="space-y-1.5 pt-2">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-1">
                  Try asking:
                </p>
                <div className="grid grid-cols-1 gap-1.5">
                  {SUGGESTED_PROMPTS.map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(prompt)}
                      className="text-left text-xs bg-navy-900/60 hover:bg-slate-800 border border-slate-800 hover:border-accent-500/30 rounded-xl px-3 py-2 text-slate-300 hover:text-white transition-all flex items-center justify-between group"
                    >
                      <span className="truncate">{prompt}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-accent-400 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Message List */}
          {messages.map((msg, idx) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={idx}
                className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-accent-600 to-accent-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed space-y-2.5 ${
                    isUser
                      ? 'bg-gradient-to-r from-accent-500 to-accent-600 text-white rounded-br-none shadow-md shadow-accent-500/15'
                      : 'bg-navy-900/90 border border-slate-800 text-slate-200 rounded-bl-none shadow-sm'
                  }`}
                >
                  {/* Text Content */}
                  <div className="whitespace-pre-wrap select-text font-normal">
                    {msg.content}
                  </div>

                  {/* Render Structured Response Cards if present */}
                  {msg.structuredCards && msg.structuredCards.length > 0 && (
                    <div className="space-y-2 pt-1 border-t border-slate-800/60">
                      {msg.structuredCards.map((card, cIdx) => {
                        if (card.type === 'place') {
                          return <PlaceCard key={cIdx} data={card.data} />;
                        }
                        if (card.type === 'weather') {
                          return <WeatherCard key={cIdx} data={card.data} />;
                        }
                        if (card.type === 'route') {
                          return <RouteCard key={cIdx} data={card.data} />;
                        }
                        if (card.type === 'itinerary_action') {
                          return <ItineraryActionCard key={cIdx} data={card.data} />;
                        }
                        return null;
                      })}
                    </div>
                  )}

                  {/* Provider tag for assistant */}
                  {!isUser && msg.provider && msg.provider !== 'system' && (
                    <div className="text-[10px] text-slate-500 flex items-center justify-end gap-1 pt-1">
                      <span>Powered by {msg.provider === 'gemini' ? 'Gemini 3.7' : 'Groq Fallback'}</span>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Thinking / Tool Calling Animation */}
          {isLoading && (
            <div className="flex gap-2.5 justify-start">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-accent-600 to-accent-500 text-white flex items-center justify-center shrink-0 mt-0.5 animate-pulse">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <div className="bg-navy-900/90 border border-slate-800 rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-2 text-xs text-slate-400">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-accent-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 bg-accent-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 bg-accent-400 rounded-full animate-bounce" />
                </div>
                <span className="text-[11px] text-slate-400">Analyzing travel context & tools...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      )}

      {/* ─── Input Area ────────────────────────────────────────── */}
      <div className="p-3 bg-navy-900/90 border-t border-slate-800 shrink-0">
        <div className="relative flex items-center bg-navy-950 border border-slate-800 rounded-xl focus-within:border-accent-500/50 transition-colors">
          <textarea
            ref={textareaRef}
            rows={1}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              activeTripDestination
                ? `Ask anything about ${activeTripDestination} or your trip...`
                : 'Ask anything about destinations, weather, routes...'
            }
            className="w-full bg-transparent px-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none resize-none max-h-28"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || isLoading}
            className="m-1.5 p-2 rounded-lg bg-accent-500 hover:bg-accent-600 disabled:opacity-40 disabled:hover:bg-accent-500 text-white transition-all shrink-0 active:scale-95"
            title="Send Message"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
        <p className="text-[10px] text-slate-500 text-center mt-1.5">
          Press Enter to send • Shift+Enter for new line
        </p>
      </div>
    </div>
  );
};

