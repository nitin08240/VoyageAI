import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Home, ArrowLeft, MapPin, Sparkles } from 'lucide-react';
import PageWrapper from '@/components/layout/PageWrapper';
import { Button } from '@/components/ui/Button';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <PageWrapper>
      <div className="min-h-[75vh] flex items-center justify-center px-4 sm:px-6 py-16 text-center">
        <div className="max-w-lg mx-auto space-y-8">
          {/* Travel / Navigation Theme Visual */}
          <div className="relative inline-block">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-accent-500/20 via-accent-500/10 to-transparent border border-accent-500/30 text-accent-400 flex items-center justify-center mx-auto shadow-2xl shadow-accent-500/20 backdrop-blur-xl">
              <Compass className="w-12 h-12 text-accent-400 animate-spin-slow" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-navy-800 border border-white/10 flex items-center justify-center text-amber-400 shadow-lg">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="absolute -bottom-1 -left-1 w-6 h-6 rounded-full bg-navy-800 border border-white/10 flex items-center justify-center text-accent-400 shadow-lg">
              <Sparkles className="w-3 h-3" />
            </div>
          </div>

          <div>
            <div className="text-7xl sm:text-8xl font-serif font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-accent-400 via-amber-300 to-orange-400 tracking-tight leading-none mb-4">
              404
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
              Lost in Uncharted Territory
            </h1>
            <p className="text-slate-400 text-sm sm:text-base mt-3 max-w-md mx-auto leading-relaxed font-light">
              The page you're looking for could not be found. Let's get you back on track.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/')}
              className="w-full sm:w-auto px-6 py-3 text-xs sm:text-sm font-semibold shadow-xl shadow-accent-500/25 flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" /> Return to Home
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={() => navigate(-1)}
              className="w-full sm:w-auto px-6 py-3 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 border-white/15 hover:bg-white/5"
            >
              <ArrowLeft className="w-4 h-4" /> Previous Page
            </Button>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default NotFound;

