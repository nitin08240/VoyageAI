import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  Users,
  Wallet,
  Sparkles,
  MapPin,
  FileDown,
  ArrowRight,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import PageWrapper from '@/components/layout/PageWrapper';
import { Button } from '@/components/ui/Button';

export const HowItWorks: React.FC = () => {
  const navigate = useNavigate();

  const steps = [
    {
      number: '01',
      title: 'Specify Destination & Dates',
      subtitle: 'Where & When',
      icon: Compass,
      description:
        'Choose any global city or regional hub. Enter your travel dates to let VoyageAI calculate duration, seasonality, and local climate patterns.',
      bullets: [
        'Global geocoding for cities, hill stations, and coastal retreats',
        'Automatic season awareness and daylight availability logic',
        'Flexible 1 to 30 day trip timelines',
      ],
    },
    {
      number: '02',
      title: 'Define Party Dynamics & Travel Pace',
      subtitle: 'Who & How',
      icon: Users,
      description:
        'Whether traveling solo, as a romantic couple, with active kids, or in a large friend group, specify your pacing from slow and relaxed to high-energy exploration.',
      bullets: [
        'Accommodates solo explorers, couples, families, and executive groups',
        'Pacing sliders: Relaxed, Balanced, or High-Energy',
        'Custom dietary alignment (Halal, Vegetarian, Vegan, Kosher, Allergies)',
      ],
    },
    {
      number: '03',
      title: 'Set Budget Cap & Currency',
      subtitle: 'Financial Accounting',
      icon: Wallet,
      description:
        'Input your total budget in your preferred currency (₹ INR, $ USD, € EUR, £ GBP). VoyageAI distributes funds with mathematical precision across 6 categories without symbolic dollar badges.',
      bullets: [
        'Balanced distribution across stay, dining, transport, and activities',
        'Includes realistic emergency buffer recommendations',
        'Consistent currency formatting across all cards and PDF export',
      ],
    },
    {
      number: '04',
      title: 'AI Synthesis & 70 km Radius Discovery',
      subtitle: 'The Magic Happens',
      icon: Sparkles,
      description:
        'Our engine queries Overpass OpenStreetMap data to cluster authentic landmarks, scenic viewpoints, and heritage sanctuaries within a 50–70 km radius, eliminating repetitive activities.',
      bullets: [
        'Discovers hidden regional gems outside congested city tourist traps',
        'Deduplicates sights across multi-day itineraries',
        'Fact-checks transport methods (e.g. no metros in mountain towns)',
      ],
    },
    {
      number: '05',
      title: 'Explore, Customise & Review Maps',
      subtitle: 'Interactive Dashboard',
      icon: MapPin,
      description:
        'Inspect your day-wise plan on responsive Leaflet maps with OSRM driving routes. Review verified Unsplash photos, weather advisories, and hotel suggestions with transparent pricing.',
      bullets: [
        'Interactive map pins with sequenced morning, afternoon, and evening slots',
        'Real-time OpenWeather forecasts and day-wise weather tips',
        'One-click slot swaps and activity adjustments',
      ],
    },
    {
      number: '06',
      title: 'Export PDF & Travel With Concierge',
      subtitle: 'On the Go',
      icon: FileDown,
      description:
        'Download your comprehensive itinerary as a print-ready offline PDF. During your trip, open the VoyageAI Assistant to ask real-time questions in English, Hindi, or Hinglish.',
      bullets: [
        'High-resolution PDF export with budget summaries and map routes',
        'Multilingual AI Assistant available 24/7 on desktop and mobile',
        'Works completely offline once PDF is saved to your phone or tablet',
      ],
    },
  ];

  return (
    <PageWrapper>
      {/* ─── Hero Section ────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 text-center max-w-5xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent-500/10 border border-accent-500/20 text-accent-400 text-xs font-medium tracking-wide">
          <Clock className="w-3.5 h-3.5" />
          <span>Step-by-Step Blueprint</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold text-white tracking-tight leading-tight">
          How VoyageAI Crafts Your{' '}
          <span className="font-serif italic text-transparent bg-clip-text bg-gradient-to-r from-accent-400 via-amber-300 to-orange-400">
            Perfect Itinerary
          </span>
        </h1>

        <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed font-light">
          From the moment you pick a destination to your final evening stroll, here is how our intelligent travel architecture plans every detail.
        </p>
      </section>

      {/* ─── Steps Section ───────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 space-y-12">
        {steps.map((step) => (
          <div
            key={step.number}
            className="p-6 sm:p-10 rounded-3xl bg-navy-900/80 border border-slate-800/80 hover:border-accent-500/30 transition-all duration-300 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
          >
            {/* Step Number & Icon */}
            <div className="lg:col-span-4 space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-4xl sm:text-5xl font-mono font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-accent-400 to-amber-300">
                  {step.number}
                </span>
                <div className="w-12 h-12 rounded-2xl bg-accent-500/10 border border-accent-500/20 text-accent-400 flex items-center justify-center">
                  <step.icon className="w-6 h-6" />
                </div>
              </div>
              <div>
                <span className="text-[11px] font-mono text-accent-400 uppercase tracking-wider block">
                  {step.subtitle}
                </span>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-white mt-1">
                  {step.title}
                </h3>
              </div>
            </div>

            {/* Step Content */}
            <div className="lg:col-span-8 space-y-4 border-t lg:border-t-0 lg:border-l border-slate-800 lg:pl-8 pt-6 lg:pt-0">
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-light">
                {step.description}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                {step.bullets.map((b, bIdx) => (
                  <div key={bIdx} className="flex items-start gap-2 text-xs text-slate-400">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{b}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* ─── Bottom CTA ─────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 text-center space-y-6">
        <h2 className="text-2xl sm:text-4xl font-serif font-bold text-white">
          Ready to See It in Action?
        </h2>
        <p className="text-slate-400 text-xs sm:text-sm max-w-lg mx-auto font-light">
          It takes less than 60 seconds to configure your constraints and generate an end-to-end trip plan.
        </p>
        <Button
          size="lg"
          variant="primary"
          onClick={() => navigate('/trips/create')}
          className="shadow-xl shadow-accent-500/25 px-8 font-semibold text-sm"
        >
          Plan a Trip in 60 Seconds <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </section>
    </PageWrapper>
  );
};

export default HowItWorks;
