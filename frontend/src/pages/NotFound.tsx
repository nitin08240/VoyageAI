import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Home, ArrowLeft } from 'lucide-react';
import PageWrapper from '@/components/layout/PageWrapper';
import { Button } from '@/components/ui/Button';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <PageWrapper>
      <div className="min-h-[80vh] flex items-center justify-center px-6 py-16 text-center">
        <div className="max-w-md mx-auto space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-accent-500/10 border border-accent-500/20 text-accent-400 flex items-center justify-center mx-auto shadow-xl shadow-accent-500/10">
            <Compass className="w-10 h-10 animate-spin-slow" />
          </div>

          <div>
            <div className="text-6xl sm:text-7xl font-serif font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-accent-400 to-amber-300">
              404
            </div>
            <h1 className="text-2xl font-serif font-bold text-white mt-2">
              Lost in Uncharted Territory
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-2 leading-relaxed">
              The coordinate you requested does not exist on our navigation chart. Let's recalculate your route.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/')}
              className="w-full sm:w-auto text-xs font-semibold shadow-lg shadow-accent-500/20"
            >
              <Home className="w-4 h-4 mr-1.5" /> Return to Base
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={() => navigate(-1)}
              className="w-full sm:w-auto text-xs font-semibold"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Previous Page
            </Button>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default NotFound;

