import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  Target,
  Heart,
  ShieldCheck,
  ArrowRight,
  Globe,
} from 'lucide-react';
import PageWrapper from '@/components/layout/PageWrapper';
import { Button } from '@/components/ui/Button';

export const About: React.FC = () => {
  const navigate = useNavigate();

  const values = [
    {
      icon: Target,
      title: 'Geographical Accuracy First',
      description:
        'We never fabricate attractions or impossible transit connections. If Manali has no active railway station, we do not recommend express trains. We verify locations through real OpenStreetMap data.',
    },
    {
      icon: Heart,
      title: 'Personalized, Not Generic',
      description:
        'A couple celebrating an anniversary travels differently than a family with toddlers or a solo backpacker. Our itineraries adapt dynamically to pacing, dietary nuances, and party dynamics.',
    },
    {
      icon: Compass,
      title: '70 km Regional Discovery',
      description:
        'True travel memories live beyond tourist traps. We explore the broader 50–70 km radius around each destination to highlight authentic mountain temples, quiet riverbanks, and hidden heritage trails.',
    },
    {
      icon: ShieldCheck,
      title: 'Transparent Budgeting',
      description:
        'We believe in honest numeric accounting. No arbitrary dollar-sign tier badges ($ vs $$$$). We display real cost projections in your local currency so you stay in total control of your finances.',
    },
  ];

  return (
    <PageWrapper>
      {/* ─── Hero Section ────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 text-center max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent-500/10 border border-accent-500/20 text-accent-400 text-xs font-medium tracking-wide">
          <Globe className="w-3.5 h-3.5" />
          <span>About VoyageAI</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold text-white tracking-tight leading-tight">
          Reimagining How the World{' '}
          <span className="font-serif italic text-transparent bg-clip-text bg-gradient-to-r from-accent-400 via-amber-300 to-orange-400">
            Explores & Plans
          </span>
        </h1>

        <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed font-light">
          VoyageAI was created out of frustration with static top-10 listicles, scattered browser tabs, and unrealistic itineraries. We built an intelligent travel platform that respects your time, budget, and individuality.
        </p>
      </section>

      {/* ─── The Story ───────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="p-8 sm:p-12 rounded-3xl bg-navy-900/80 border border-slate-800/80 shadow-xl space-y-6">
          <span className="text-xs font-mono text-accent-400 uppercase tracking-widest block font-semibold">
            Our Story & Vision
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white leading-snug">
            Why We Built VoyageAI
          </h2>
          <div className="space-y-4 text-slate-300 text-xs sm:text-sm font-light leading-relaxed">
            <p>
              Planning a trip should feel exhilarating—not exhausting. Yet for decades, travelers have had to juggle dozens of disjointed blogs, map pins, weather sites, and spreadsheet calculators. Most automated tools merely regurgitated generic tourist hotspots without understanding actual transit viability or budget limits.
            </p>
            <p>
              We founded VoyageAI to bridge the gap between high-level inspiration and tactical logistics. By combining state-of-the-art AI synthesis with geospatial intelligence from OpenStreetMap, real-time atmospheric forecasts from OpenWeather, and authentic photography from Unsplash, VoyageAI produces actionable, day-wise itineraries that actually work in the real world.
            </p>
            <p>
              Today, VoyageAI empowers travelers across the globe to discover breathtaking regional destinations within 70 km, balance their finances down to the rupee or dollar, and travel with an autonomous AI companion at their fingertips.
            </p>
          </div>
        </div>
      </section>

      {/* ─── Core Values ─────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
            What Sets VoyageAI Apart
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 font-light max-w-md mx-auto">
            Our core architectural principles guide every itinerary we generate.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {values.map((val, i) => (
            <div
              key={i}
              className="p-6 sm:p-8 rounded-2xl bg-navy-900/60 border border-slate-800 hover:border-accent-500/30 transition-all space-y-3.5 shadow-md"
            >
              <div className="w-10 h-10 rounded-xl bg-accent-500/10 border border-accent-500/20 text-accent-400 flex items-center justify-center">
                <val.icon className="w-5 h-5" />
              </div>
              <h3 className="text-base sm:text-lg font-serif font-bold text-white">
                {val.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-light">
                {val.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Bottom CTA ─────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 text-center space-y-6">
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
          Begin Your Voyage Today
        </h2>
        <p className="text-slate-400 text-xs sm:text-sm max-w-md mx-auto font-light">
          Create your personalized travel dossier in seconds—completely free.
        </p>
        <Button
          size="lg"
          variant="primary"
          onClick={() => navigate('/trips/create')}
          className="shadow-xl shadow-accent-500/25 px-8 font-semibold text-sm"
        >
          Plan a Trip Now <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </section>
    </PageWrapper>
  );
};

export default About;
