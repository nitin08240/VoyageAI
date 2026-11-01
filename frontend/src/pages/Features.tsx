import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  MapPin,
  CloudSun,
  DollarSign,
  FileDown,
  Bot,
  Compass,
  ArrowRight,
  Zap,
  Layers,
} from 'lucide-react';
import PageWrapper from '@/components/layout/PageWrapper';
import { Button } from '@/components/ui/Button';

export const Features: React.FC = () => {
  const navigate = useNavigate();

  const featureList = [
    {
      icon: Sparkles,
      title: 'AI Itinerary Generation',
      badge: 'Core Engine',
      description:
        'Generate structured, day-wise itineraries in seconds. Morning, afternoon, and evening activities are harmoniously sequenced to match your personal pacing—from relaxed escapes to intensive exploration.',
    },
    {
      icon: Compass,
      title: '70 km Regional Discovery',
      badge: 'Geospatial Intelligence',
      description:
        'VoyageAI does not just recommend typical city centers. Our discovery engine analyzes authentic landmarks, scenic viewpoints, nature retreats, and heritage spots within a 50–70 km radius of your destination.',
    },
    {
      icon: MapPin,
      title: 'Interactive Maps & Transit Routing',
      badge: 'OpenStreetMap + OSRM',
      description:
        'Visualize your journey on interactive Leaflet maps with Nominatim geocoding and OSRM routing. View realistic driving distances, mountain transit slowdowns, and turn-by-turn road connections.',
    },
    {
      icon: CloudSun,
      title: 'Live Weather Integration',
      badge: 'OpenWeather API',
      description:
        'Stay prepared with real multi-day atmospheric forecasts. Each itinerary day incorporates actual weather conditions, temperature ranges, humidity, and destination-specific packing advice.',
    },
    {
      icon: DollarSign,
      title: 'Mathematical Budget Discipline',
      badge: 'Balanced Allocator',
      description:
        'Set your hard budget cap in your preferred currency (₹ INR, $ USD, € EUR, £ GBP). VoyageAI distributes funds across accommodation, dining, transit, activities, and emergency buffers without symbolic dollar tiers.',
    },
    {
      icon: FileDown,
      title: 'Editorial PDF Export',
      badge: 'Offline Travel Dossier',
      description:
        'Download your entire trip as a print-ready, high-resolution PDF dossier. Perfect for remote travels, flight check-ins, offline road navigation, and sharing with companions.',
    },
    {
      icon: Bot,
      title: 'Autonomous Travel Assistant',
      badge: 'Multilingual Chatbot',
      description:
        'Consult our conversational travel concierge anywhere in the app. Speaks fluent English, Hindi (हिंदी), and Hinglish with live tool calling for nearby spots, routes, images, and dining suggestions.',
    },
    {
      icon: Layers,
      title: 'Curated Hotel Selection',
      badge: 'Smart Accommodation',
      description:
        'Explore verified accommodations tailored to your travel style—from social hostels and boutique inns to 5-star heritage resorts, with transparent numeric estimates in your selected currency.',
    },
  ];

  return (
    <PageWrapper>
      {/* ─── Hero Section ────────────────────────────────────────── */}
      <section className="relative py-16 sm:py-24 px-4 sm:px-6 lg:px-8 text-center max-w-5xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent-500/10 border border-accent-500/20 text-accent-400 text-xs font-medium tracking-wide">
          <Zap className="w-3.5 h-3.5" />
          <span>VoyageAI Capabilities</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold text-white tracking-tight leading-tight">
          Everything You Need to Orchestrate the{' '}
          <span className="font-serif italic text-transparent bg-clip-text bg-gradient-to-r from-accent-400 via-amber-300 to-orange-400">
            Perfect Journey
          </span>
        </h1>

        <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed font-light">
          Say goodbye to dozens of conflicting travel tabs and rigid tourist templates. VoyageAI unites geographical accuracy, atmospheric forecasts, and financial discipline into a single intuitive planner.
        </p>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            size="lg"
            variant="primary"
            onClick={() => navigate('/trips/create')}
            className="shadow-xl shadow-accent-500/25 text-sm px-8 font-semibold"
          >
            Create Your Free Trip <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate('/how-it-works')}
            className="text-sm px-6 border-white/15 hover:bg-white/5"
          >
            How It Works
          </Button>
        </div>
      </section>

      {/* ─── Feature Grid ────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {featureList.map((feature, i) => (
            <div
              key={i}
              className="p-6 sm:p-7 rounded-2xl bg-navy-900/80 border border-slate-800/80 hover:border-accent-500/40 hover:bg-navy-900 transition-all duration-300 group shadow-lg flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-accent-500/10 border border-accent-500/20 text-accent-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700/60">
                    {feature.badge}
                  </span>
                </div>
                <h3 className="text-lg font-serif font-bold text-white group-hover:text-accent-300 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-light">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Bottom CTA Banner ───────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-navy-900 via-navy-850 to-slate-900 border border-accent-500/30 text-center space-y-5 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent-500/10 rounded-full blur-3xl pointer-events-none" />
          <h2 className="text-2xl sm:text-4xl font-serif font-bold text-white">
            Ready to Experience Effortless Planning?
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm max-w-xl mx-auto font-light leading-relaxed">
            Join thousands of travelers who plan smarter with VoyageAI. Free to use with zero hidden subscriptions.
          </p>
          <Button
            size="md"
            variant="primary"
            onClick={() => navigate('/trips/create')}
            className="shadow-xl shadow-accent-500/25 px-8 font-semibold text-xs sm:text-sm"
          >
            Start Planning Now &rarr;
          </Button>
        </div>
      </section>
    </PageWrapper>
  );
};

export default Features;
