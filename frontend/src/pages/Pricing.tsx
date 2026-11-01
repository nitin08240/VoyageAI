import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Check,
  ShieldCheck,
  HelpCircle,
  ArrowRight,
  Heart,
} from 'lucide-react';
import PageWrapper from '@/components/layout/PageWrapper';
import { Button } from '@/components/ui/Button';

export const Pricing: React.FC = () => {
  const navigate = useNavigate();

  const includedFeatures = [
    'Unlimited trip generations and version regenerations',
    'Full day-by-day AI itinerary synthesizer',
    '70 km radius regional attraction discovery',
    'Interactive Leaflet maps with OSRM driving routes',
    'Real-time OpenWeather atmospheric forecasts',
    'High-resolution offline PDF export with budget breakdowns',
    'Autonomous multilingual travel assistant (English, Hindi, Hinglish)',
    'Curated accommodation suggestions in your chosen currency',
    'Balanced 6-category budget calculation',
    'Persistent saved trips and secure cloud storage',
  ];

  const faqs = [
    {
      q: 'Is VoyageAI really 100% free to use?',
      a: 'Yes! VoyageAI is currently free for all individual travelers. You can generate unlimited itineraries, customize activities, view interactive maps, export PDFs, and chat with our assistant without entering a credit card.',
    },
    {
      q: 'Are there hidden booking fees or in-app purchases?',
      a: 'No. VoyageAI does not charge booking surcharges or hidden service fees. All numeric accommodation and transit estimates in your plan are indicative guidance for your budgeting.',
    },
    {
      q: 'Will you introduce paid tiers in the future?',
      a: 'In the future, we may introduce advanced enterprise solutions or collaborative group travel features for travel agencies. However, the core individual travel planner will always offer a robust free tier.',
    },
    {
      q: 'Can I export high-resolution PDFs without paying?',
      a: 'Absolutely. All users have full access to high-resolution, print-ready PDF downloads for offline navigation on planes, trains, and mountain roads.',
    },
  ];

  return (
    <PageWrapper>
      {/* ─── Hero Section ────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 text-center max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium tracking-wide">
          <Heart className="w-3.5 h-3.5 text-emerald-400" />
          <span>Transparent & Community-Driven</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold text-white tracking-tight leading-tight">
          Simple, Transparent{' '}
          <span className="font-serif italic text-transparent bg-clip-text bg-gradient-to-r from-accent-400 via-amber-300 to-orange-400">
            Zero-Cost Access
          </span>
        </h1>

        <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed font-light">
          We believe great travel planning should be accessible to everyone. Experience full access to all VoyageAI capabilities for free.
        </p>
      </section>

      {/* ─── Pricing Card ────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="relative p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-navy-900/90 via-navy-850 to-slate-900 border-2 border-accent-500/40 shadow-2xl shadow-accent-500/10 overflow-hidden">
          <div className="absolute top-0 right-0 px-6 py-2 bg-gradient-to-l from-accent-500 to-accent-600 text-white font-mono text-xs uppercase tracking-widest font-semibold rounded-bl-2xl shadow-lg">
            Community Edition
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-mono text-accent-400 uppercase tracking-widest block font-semibold">
                Complete Travel Suite
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl sm:text-6xl font-serif font-bold text-white">
                  $0
                </span>
                <span className="text-slate-400 text-sm font-light">/ free forever</span>
              </div>
              <p className="text-slate-400 text-xs sm:text-sm font-light max-w-lg leading-relaxed pt-1">
                Full access to our AI generation engine, interactive Leaflet routes, atmospheric weather forecasts, and offline PDF exports. No credit card required.
              </p>
            </div>

            <div className="border-t border-slate-800/80 pt-6">
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-4 font-mono">
                Everything Included In Your Free Account:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {includedFeatures.map((feat, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300">
                    <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3 stroke-[2.5]" />
                    </div>
                    <span className="font-light">{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center gap-4 justify-between">
              <div className="text-xs text-slate-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Instant sign-up • No credit card required • Unlimited trips</span>
              </div>
              <Button
                size="lg"
                variant="primary"
                onClick={() => navigate('/trips/create')}
                className="w-full sm:w-auto shadow-xl shadow-accent-500/25 px-8 font-semibold text-sm"
              >
                Start Free Trip Planning <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FAQ Section ─────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 font-light">
            Everything you need to know about VoyageAI access and billing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-navy-900/60 border border-slate-800 space-y-2.5"
            >
              <h3 className="text-sm font-semibold text-white flex items-start gap-2">
                <HelpCircle className="w-4 h-4 text-accent-400 shrink-0 mt-0.5" />
                <span>{faq.q}</span>
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-light pl-6">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>
    </PageWrapper>
  );
};

export default Pricing;
