import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Compass, Shield, ArrowRight, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import GlobeScene from '@/components/globe/GlobeScene';
import DestinationCard from '@/components/DestinationCard';
import PageWrapper from '@/components/layout/PageWrapper';

const FEATURE_CARDS = [
  {
    icon: Sparkles,
    title: 'Autonomous Gemini AI Engine',
    desc: 'Powered by Gemini 2.0 Flash to synthesize hyper-personalized day-by-day routes in seconds.',
  },
  {
    icon: Compass,
    title: 'Geographic Route Precision',
    desc: 'Eliminate backtracking. Morning, afternoon, and evening activities clustered by transit logic.',
  },
  {
    icon: Shield,
    title: 'Rigorous Budget Accounting',
    desc: 'Mathematical budget validation ensuring your hotel, food, and tour costs never exceed your threshold.',
  },
];

const CURATED_DESTINATIONS = [
  {
    id: 'kyoto',
    name: 'Kyoto',
    country: 'Japan',
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=800&auto=format&fit=crop',
    tagline: 'Centuries-old Zen temples, secluded bamboo groves, and traditional tea ceremonies.',
    rating: 4.9,
    startingPrice: '$1,800',
    category: 'Cultural Haven',
  },
  {
    id: 'amalfi',
    name: 'Amalfi Coast',
    country: 'Italy',
    image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=800&auto=format&fit=crop',
    tagline: 'Pastel-hued cliffside villages perched above sparkling cobalt Mediterranean waters.',
    rating: 4.8,
    startingPrice: '$2,400',
    category: 'Coastal Romance',
  },
  {
    id: 'zermatt',
    name: 'Zermatt & Matterhorn',
    country: 'Switzerland',
    image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?q=80&w=800&auto=format&fit=crop',
    tagline: 'Pristine alpine grandeur, world-class cogwheel rail excursions, and fondues.',
    rating: 5.0,
    startingPrice: '$2,900',
    category: 'Alpine Wonder',
  },
  {
    id: 'capetown',
    name: 'Cape Town',
    country: 'South Africa',
    image: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?q=80&w=800&auto=format&fit=crop',
    tagline: 'Table Mountain vistas, dramatic peninsular coastlines, and historic Stellenbosch vineyards.',
    rating: 4.9,
    startingPrice: '$1,650',
    category: 'Adventure',
  },
  {
    id: 'bali',
    name: 'Ubud & Uluwatu',
    country: 'Indonesia',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=800&auto=format&fit=crop',
    tagline: 'Lush terraced rice paddies, cliffside sunset temples, and rejuvenating holistic spas.',
    rating: 4.7,
    startingPrice: '$1,100',
    category: 'Wellness',
  },
  {
    id: 'reykjavik',
    name: 'Reykjavik & South Coast',
    country: 'Iceland',
    image: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?q=80&w=800&auto=format&fit=crop',
    tagline: 'Northern lights cascades, geothermal mineral lagoons, and thunderous waterfalls.',
    rating: 4.9,
    startingPrice: '$2,100',
    category: 'Glacial Epic',
  },
];

export const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <PageWrapper>
      {/* ─── Hero Section with 3D Globe ─────────────────────────── */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden pt-12 pb-20">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[650px] h-[650px] bg-accent-500/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text Column */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-7 space-y-6 text-center lg:text-left z-10"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-accent-400 tracking-wide backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-accent-400" />
              <span>Next-Generation Autonomous Travel Intelligence</span>
            </div>

            <h1 className="text-4xl sm:text-6xl xl:text-7xl font-serif font-extrabold text-white tracking-tight leading-[1.08]">
              Your Journey.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-400 via-amber-300 to-orange-500">
                Your Budget.
              </span>{' '}
              Your Perfect Plan.
            </h1>

            <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto lg:mx-0 font-light leading-relaxed">
              VoyageAI orchestrates complete, day-wise travel itineraries backed by Google Gemini. From boutique accommodations and curated dining to transit logistics and budget compliance.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
              <Button
                size="lg"
                variant="primary"
                onClick={() => navigate('/trips/create')}
                className="w-full sm:w-auto shadow-xl shadow-accent-500/25 text-base py-4 px-8"
              >
                Plan My Journey <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/explore')}
                className="w-full sm:w-auto text-base py-4 px-8 border-white/20 hover:border-white/40"
              >
                Explore Destinations <Compass className="w-5 h-5 ml-2 text-slate-400" />
              </Button>
            </div>

            {/* Social Proof metrics */}
            <div className="pt-8 border-t border-white/10 grid grid-cols-3 gap-6 max-w-lg mx-auto lg:mx-0">
              <div>
                <div className="text-2xl sm:text-3xl font-bold font-serif text-white">100%</div>
                <div className="text-xs text-slate-400 mt-0.5">Budget Respected</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold font-serif text-white">Gemini 2.0</div>
                <div className="text-xs text-slate-400 mt-0.5">AI Engine Core</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold font-serif text-white">0</div>
                <div className="text-xs text-slate-400 mt-0.5">Guesswork</div>
              </div>
            </div>
          </motion.div>

          {/* Right 3D Globe Column */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="lg:col-span-5 relative"
          >
            <div className="w-full h-[450px] sm:h-[550px]">
              <GlobeScene className="w-full h-full" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Architectural Pillars ───────────────────────────────── */}
      <section className="py-24 border-t border-white/5 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-semibold uppercase tracking-widest text-accent-400 block mb-2">
              Engineered Precision
            </span>
            <h2 className="text-3xl sm:text-5xl font-serif font-bold text-white">
              Why Discerning Travelers Trust VoyageAI
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {FEATURE_CARDS.map((feat, i) => {
              const Icon = feat.icon;
              return (
                <div
                  key={i}
                  className="p-8 rounded-3xl glass-card border border-white/10 hover:border-accent-500/40 transition-all duration-300 relative group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-accent-500/10 border border-accent-500/20 text-accent-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-serif font-bold text-white mb-2">{feat.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Curated Destinations Showcase ───────────────────────── */}
      <section className="py-24 border-t border-white/5 bg-navy-950/40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-accent-400 block mb-2">
                Inspiration Gallery
              </span>
              <h2 className="text-3xl sm:text-5xl font-serif font-bold text-white">
                Popular Destinations
              </h2>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate('/explore')}
              className="text-xs font-semibold self-start md:self-auto"
            >
              Browse All Escapes <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {CURATED_DESTINATIONS.map((dest) => (
              <DestinationCard
                key={dest.id}
                {...dest}
                onSelect={() => navigate(`/trips/create?destination=${encodeURIComponent(dest.name)}`)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ─── Bottom Call-To-Action Banner ────────────────────────── */}
      <section className="py-28 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <div className="p-12 sm:p-16 rounded-3xl glass-card border border-accent-500/30 shadow-2xl relative overflow-hidden">
            <div className="absolute -top-32 -right-32 w-80 h-80 bg-accent-500/20 rounded-full blur-3xl pointer-events-none" />
            
            <h2 className="text-3xl sm:text-5xl font-serif font-bold text-white mb-4">
              Begin Your Bespoke Journey Today
            </h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto mb-8 leading-relaxed">
              Input your destination, preferred pacing, and financial constraints. Let VoyageAI forge your itinerary in seconds.
            </p>
            <Button
              size="lg"
              variant="primary"
              onClick={() => navigate('/trips/create')}
              className="shadow-2xl shadow-accent-500/30 text-base py-4 px-10"
            >
              Start Free Trip Planning &rarr;
            </Button>
          </div>
        </div>
      </section>
    </PageWrapper>
  );
};

export default Home;
