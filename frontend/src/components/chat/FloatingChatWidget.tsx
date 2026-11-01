import React, { useState, useEffect } from 'react';
import { useLocation, matchPath, useNavigate } from 'react-router-dom';
import { Bot, Sparkles, X } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { ChatWindow } from './ChatWindow';
import { apiGet } from '@/services/api';

export const FloatingChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [tripDestination, setTripDestination] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  // Detect if user is currently viewing a trip
  const tripMatch =
    matchPath('/trips/:id', location.pathname) ||
    matchPath('/trips/:id/itinerary', location.pathname) ||
    matchPath('/trips/:id/generate', location.pathname);

  const activeTripId = tripMatch?.params.id || null;

  // Fetch trip destination name when activeTripId changes
  useEffect(() => {
    if (!activeTripId || !isAuthenticated) {
      setTripDestination(null);
      return;
    }

    let cancelled = false;
    apiGet<any>(`/trips/${activeTripId}`)
      .then((res) => {
        if (!cancelled) {
          const dest = res.data?.data?.destination?.name || res.data?.destination?.name;
          setTripDestination(dest || null);
        }
      })
      .catch(() => {
        if (!cancelled) setTripDestination(null);
      });

    return () => { cancelled = true; };
  }, [activeTripId, isAuthenticated]);

  const handleToggle = () => {
    if (!isAuthenticated) {
      if (window.confirm('Please sign in to chat with VoyageAI Travel Assistant. Go to login?')) {
        navigate('/login');
      }
      return;
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* ─── Expandable Chat Window ────────────────────────────── */}
      {isOpen && (
        <div className="mb-4 w-[calc(100vw-2rem)] h-[calc(100vh-6rem)] sm:w-[420px] sm:h-[620px] max-w-[calc(100vw-2rem)] max-h-[85vh] shadow-2xl rounded-2xl animate-in fade-in slide-in-from-bottom-5 duration-200">
          <ChatWindow
            onClose={() => setIsOpen(false)}
            activeTripId={activeTripId}
            activeTripDestination={tripDestination}
          />
        </div>
      )}

      {/* ─── Floating Launcher Button ──────────────────────────── */}
      <div className="flex justify-end">
        <button
          onClick={handleToggle}
          className="relative group p-3.5 rounded-full bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white shadow-xl shadow-accent-500/30 hover:shadow-accent-500/50 transition-all duration-300 transform active:scale-95 flex items-center justify-center border border-accent-400/30"
          title={isOpen ? 'Close VoyageAI Assistant' : 'Ask VoyageAI Assistant'}
          aria-label="Ask VoyageAI Travel Assistant"
        >
          {isOpen ? (
            <X className="w-6 h-6 transition-transform group-hover:rotate-90 duration-200" />
          ) : (
            <>
              <Bot className="w-6 h-6 transition-transform group-hover:scale-110 duration-200" />
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-navy-950" />
              </span>
            </>
          )}

          {/* Floating Pill Tooltip when closed */}
          {!isOpen && (
            <span className="hidden md:flex absolute right-16 px-3 py-1.5 rounded-xl bg-navy-900/95 border border-slate-700/80 text-xs text-slate-100 whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none items-center gap-1.5 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-accent-400" />
              <span>Ask VoyageAI Assistant</span>
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

export default FloatingChatWidget;

