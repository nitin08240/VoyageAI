import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass,
  ArrowRight,
  ChevronRight,
  MapPin,
  Calendar,
  CheckCircle2,
  Sliders,
  Star,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import GlobeScene from '@/components/globe/GlobeScene';
import PageWrapper from '@/components/layout/PageWrapper';

// Curated Escapes with High-End Photography
const CURATED_DESTINATIONS = [
  {
    id: 'kyoto',
    name: 'Kyoto',
    country: 'Japan',
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1200&auto=format&fit=crop',
    tagline: 'Centuries-old Zen temples, secluded bamboo groves, and authentic Kaiseki traditions.',
    rating: 4.95,
    idealDuration: '7 Days',
    budgetEstimate: '$1,800',
    category: 'Cultural Sanctuary',
  },
  {
    id: 'amalfi',
    name: 'Amalfi Coast',
    country: 'Italy',
    image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=1200&auto=format&fit=crop',
    tagline: 'Cliffside pastel villas overlooking the Tyrrhenian Sea and fragrant lemon orchards.',
    rating: 4.88,
    idealDuration: '5 Days',
    budgetEstimate: '$2,400',
    category: 'Coastal Splendor',
  },
  {
    id: 'zermatt',
    name: 'Zermatt & Matterhorn',
    country: 'Switzerland',
    image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?q=80&w=1200&auto=format&fit=crop',
    tagline: 'Alpine grandeur, scenic Gornergrat cogwheel railways, and fondue under starry peaks.',
    rating: 4.98,
    idealDuration: '4 Days',
    budgetEstimate: '$2,900',
    category: 'Alpine Wonder',
  },
  {
    id: 'reykjavik',
    name: 'South Coast & Glaciers',
    country: 'Iceland',
    image: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?q=80&w=1200&auto=format&fit=crop',
    tagline: 'Cascading basalt waterfalls, black sand beaches, and night skies dancing with auroras.',
    rating: 4.92,
    idealDuration: '6 Days',
    budgetEstimate: '$2,150',
    category: 'Glacial Expedition',
  },
  {
    id: 'cape-town',
    name: 'Cape Town & Winelands',
    country: 'South Africa',
    image: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?q=80&w=1200&auto=format&fit=crop',
    tagline: 'Table Mountain cable ascents, coastal penguin sanctuaries, and historic Stellenbosch estates.',
    rating: 4.91,
    idealDuration: '7 Days',
    budgetEstimate: '$1,750',
    category: 'Epic Discovery',
  },
  {
    id: 'bali',
    name: 'Ubud & Uluwatu',
    country: 'Indonesia',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=1200&auto=format&fit=crop',
    tagline: 'Terraced emerald rice paddies, cliff-top sunset amphitheatres, and restorative wellness.',
    rating: 4.85,
    idealDuration: '6 Days',
    budgetEstimate: '$1,200',
    category: 'Tropical Retreat',
  },
];

// Interactive Architectural Features (Linear Style)
const HOW_IT_WORKS_STEPS = [
  {
    step: '01',
    title: 'Intelligent Preference Synthesis',
    subtitle: 'Dynamic Travel Constraints',
    description:
      'Input your party dynamics, dietary nuances, daily pacing, and hard budget cap. Our Gemini AI engine synthesizes these variables into a unified logistical framework rather than generic recommendations.',
    bulletPoints: [
      'Tailored for solo wanderers, couples, families, or executive retreats',
      'Dietary alignment including Halal, vegan, kosher, and allergen awareness',
      'Budget allocation across 6 distinct categories with mathematical balance',
    ],
    badge: 'Step 1: Input & Intent',
  },
  {
    step: '02',
    title: 'Geographical Transit Clustering',
    subtitle: 'Zero Backtracking Logistics',
    description:
      'Never lose hours commuting across town. VoyageAI clusters morning, afternoon, and evening sights in logical geographic proximity, recommending authentic transit options and walking legs.',
    bulletPoints: [
      'Morning, afternoon, and evening blocks ordered by geographic flow',
      'Accurate commute estimates via metro, rail, walking, or private car',
      'Direct integration with interactive Leaflet coordinates for every stop',
    ],
    badge: 'Step 2: Autonomous Routing',
  },
  {
    step: '03',
    title: 'The Living Travel Dossier',
    subtitle: 'Interactive Visual Dossier',
    description:
      'Your itinerary is a complete commercial dossier. Review day-by-day itineraries, examine hotel rates and dining tips, inspect financial charts, and download print-ready PDF records.',
    bulletPoints: [
      'Interactive Leaflet maps with custom categorized markers',
      'Recharts financial visualizer comparing spend against user limit',
      'One-click PDF export & cryptographic public sharing token',
    ],
    badge: 'Step 3: Executive Output',
  },
];

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [activeStepIdx, setActiveStepIdx] = useState(0);

  const quickPrompts = [
    { label: '🌸 Kyoto in Autumn', dest: 'Kyoto, Japan' },
    { label: '🍋 Amalfi Coast Romantic', dest: 'Amalfi Coast, Italy' },
    { label: '🏔️ Swiss Alps Scenic Rail', dest: 'Zermatt, Switzerland' },
    { label: '🌋 Iceland Aurora Chase', dest: 'Reykjavik, Iceland' },
  ];

  return (
    <PageWrapper>
      {/* ─── Hero Section with 3D Globe ─────────────────────────── */}
      <section className="relative min-h-[94vh] flex items-center justify-center overflow-hidden pt-8 pb-16 lg:pt-12 lg:pb-24">
        {/* Cinematic Ambient Lighting (Subtle, non-distracting) */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[750px] h-[750px] bg-accent-500/[0.08] rounded-full blur-[160px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/6 w-[450px] h-[450px] bg-blue-600/[0.08] rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Editorial Typography */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 space-y-6 text-center lg:text-left z-10"
          >
            {/* High-End Pill Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.09] text-xs font-medium text-slate-300 tracking-wide backdrop-blur-xl">
              <span className="w-2 h-2 rounded-full bg-accent-400 animate-pulse" />
              <span className="text-white font-semibold">Gemini 3.8 Intelligence</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400">Autonomous Travel Concierge</span>
            </div>

            {/* Cinematic Headline */}
            <h1 className="text-4xl sm:text-6xl xl:text-7xl font-serif font-bold text-white tracking-tight leading-[1.06]">
              Your Journey.{' '}
              <span className="font-serif italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-accent-300 to-orange-400">
                Your Budget.
              </span>{' '}
              Your Perfect Plan.
            </h1>

            {/* Refined Copywriting */}
            <p className="text-slate-300/90 text-base sm:text-lg max-w-2xl mx-auto lg:mx-0 font-light leading-relaxed">
              VoyageAI orchestrates hyper-personalized day-by-day travel dossiers in seconds. From boutique hotels and Michelin-accredited street food to transit logic, interactive maps, and strict financial accounting.
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Button
                size="lg"
                variant="primary"
                onClick={() => navigate('/trips/create')}
                className="w-full sm:w-auto shadow-2xl shadow-accent-500/20 text-base py-4 px-8 group font-semibold"
              >
                Plan My Journey
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/explore')}
                className="w-full sm:w-auto text-base py-4 px-8 border-white/15 hover:border-white/30 hover:bg-white/[0.04] text-slate-200"
              >
                Explore Escapes
                <Compass className="w-5 h-5 ml-2 text-slate-400" />
              </Button>
            </div>

            {/* Quick Inspiration Pills */}
            <div className="pt-2">
              <div className="text-xs uppercase tracking-wider text-slate-400 font-medium mb-2.5">
                Popular Quick Starts
              </div>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
                {quickPrompts.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => navigate(`/trips/create?destination=${encodeURIComponent(p.dest)}`)}
                    className="px-3.5 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.09] border border-white/[0.08] hover:border-accent-500/40 text-xs text-slate-300 hover:text-white transition-all duration-200"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Trust Metrics Ribbon */}
            <div className="pt-6 border-t border-white/[0.08] grid grid-cols-3 gap-6 max-w-lg mx-auto lg:mx-0">
              <div>
                <div className="text-2xl sm:text-3xl font-serif font-bold text-white">100%</div>
                <div className="text-xs text-slate-400 mt-0.5">Budget Balance</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-serif font-bold text-white">0 km</div>
                <div className="text-xs text-slate-400 mt-0.5">Wasted Backtracking</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-serif font-bold text-white">140+</div>
                <div className="text-xs text-slate-400 mt-0.5">Destinations Mapped</div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Interactive 3D Earth Globe */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 relative flex items-center justify-center"
          >
            <div className="w-full max-w-[500px] h-[480px] sm:h-[560px] relative">
              <GlobeScene className="w-full h-full" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Architectural Pillars Section ───────────────────────── */}
      <section className="py-24 border-t border-white/[0.06] relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-semibold uppercase tracking-widest text-accent-400 block mb-3">
              Engineered Travel Intelligence
            </span>
            <h2 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight">
              Bespoke Precision at Every Coordinate
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-4 leading-relaxed font-light">
              Unlike generic SaaS trip builders, VoyageAI enforces strict logistical discipline, realistic transit timing, and mathematical budget parity.
            </p>
          </div>

          {/* Linear-Style Interactive Architecture Tabs */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center rounded-3xl glass-card border border-white/[0.08] p-6 sm:p-10">
            {/* Step Selector Column */}
            <div className="lg:col-span-5 space-y-3">
              {HOW_IT_WORKS_STEPS.map((step, idx) => {
                const isActive = activeStepIdx === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => setActiveStepIdx(idx)}
                    className={`w-full text-left p-5 rounded-2xl transition-all duration-300 border ${
                      isActive
                        ? 'bg-white/[0.07] border-accent-500/40 shadow-lg shadow-black/40'
                        : 'bg-transparent border-transparent hover:bg-white/[0.03] text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-1">
                      <span className={`text-xs font-mono font-bold ${isActive ? 'text-accent-400' : 'text-slate-500'}`}>
                        {step.step}
                      </span>
                      <span className={`text-base font-serif font-bold ${isActive ? 'text-white' : 'text-slate-300'}`}>
                        {step.title}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-1 ml-7">{step.subtitle}</p>
                  </button>
                );
              })}
            </div>

            {/* Step Detail Card */}
            <div className="lg:col-span-7 bg-navy-900/60 rounded-2xl border border-white/[0.06] p-6 sm:p-8 min-h-[340px] flex flex-col justify-between">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStepIdx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-5"
                >
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-500/10 border border-accent-500/20 text-xs font-semibold text-accent-400">
                    <Sliders className="w-3.5 h-3.5" />
                    <span>{HOW_IT_WORKS_STEPS[activeStepIdx].badge}</span>
                  </div>

                  <h3 className="text-2xl font-serif font-bold text-white">
                    {HOW_IT_WORKS_STEPS[activeStepIdx].title}
                  </h3>

                  <p className="text-slate-300 text-sm leading-relaxed font-light">
                    {HOW_IT_WORKS_STEPS[activeStepIdx].description}
                  </p>

                  <ul className="space-y-2.5 pt-2">
                    {HOW_IT_WORKS_STEPS[activeStepIdx].bulletPoints.map((pt, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </AnimatePresence>

              <div className="pt-6 border-t border-white/[0.06] flex items-center justify-between">
                <span className="text-xs text-slate-500">Autonomous Concierge Engine</span>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => navigate('/trips/create')}
                  className="text-xs px-4 py-2"
                >
                  Try This Step &rarr;
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Curated Escapes Showcase ────────────────────────────── */}
      <section className="py-24 border-t border-white/[0.06] bg-navy-950/40 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-accent-400 block mb-2">
                Curated Dossiers
              </span>
              <h2 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight">
                Handcrafted Seasonal Escapes
              </h2>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate('/explore')}
              className="text-xs font-semibold self-start md:self-auto border-white/15 hover:border-white/30 text-slate-200"
            >
              View All Destinations <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {CURATED_DESTINATIONS.map((dest) => (
              <div
                key={dest.id}
                onClick={() => navigate(`/trips/create?destination=${encodeURIComponent(dest.name)}`)}
                className="group cursor-pointer rounded-3xl overflow-hidden glass-card border border-white/[0.08] hover:border-accent-500/40 transition-all duration-500 hover:-translate-y-1.5 shadow-xl hover:shadow-2xl hover:shadow-accent-500/10 flex flex-col"
              >
                {/* Hero Image Container */}
                <div className="relative h-64 w-full overflow-hidden">
                  <img
                    src={dest.image}
                    alt={dest.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-navy-900/40 to-transparent" />
                  
                  {/* Category Pill */}
                  <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-navy-950/70 border border-white/15 text-[11px] font-semibold text-accent-300 backdrop-blur-md">
                    {dest.category}
                  </div>

                  {/* Rating */}
                  <div className="absolute top-4 right-4 flex items-center gap-1 px-2.5 py-1 rounded-full bg-navy-950/70 border border-white/15 text-xs text-white backdrop-blur-md font-medium">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{dest.rating}</span>
                  </div>

                  {/* Bottom Image Overlay Info */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                    <div>
                      <div className="text-xs text-slate-300 flex items-center gap-1 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-accent-400" />
                        <span>{dest.country}</span>
                      </div>
                      <h3 className="text-2xl font-serif font-bold text-white mt-0.5">{dest.name}</h3>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] uppercase text-slate-400 font-semibold">Typical Budget</div>
                      <div className="text-base font-serif font-bold text-accent-400">{dest.budgetEstimate}</div>
                    </div>
                  </div>
                </div>

                {/* Card Content Body */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-light">
                    {dest.tagline}
                  </p>

                  <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-400 font-medium">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>{dest.idealDuration} recommended</span>
                    </div>
                    <span className="text-accent-400 group-hover:translate-x-1 transition-transform flex items-center gap-1 font-semibold">
                      Forge Plan &rarr;
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Editorial Testimonial Strip ─────────────────────────── */}
      <section className="py-24 border-t border-white/[0.06] relative">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-semibold uppercase tracking-widest text-accent-400 block mb-2">
              The Discerning Standard
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white">
              Endorsed by Deliberate Explorers
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl glass-card border border-white/[0.08] space-y-4">
              <div className="flex gap-1 text-amber-400 text-xs">
                ★★★★★
              </div>
              <p className="text-slate-300 text-sm leading-relaxed font-light italic">
                &ldquo;VoyageAI did in 30 seconds what usually takes me two weeks of Cross-referencing Google Maps and train timetables in Japan. Zero wasted transit.&rdquo;
              </p>
              <div className="pt-4 border-t border-white/[0.06] flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-accent-500/20 text-accent-300 font-bold flex items-center justify-center text-xs">
                  EL
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Elena Lindqvist</div>
                  <div className="text-[11px] text-slate-400">Architect & Solo Traveler</div>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-3xl glass-card border border-white/[0.08] space-y-4">
              <div className="flex gap-1 text-amber-400 text-xs">
                ★★★★★
              </div>
              <p className="text-slate-300 text-sm leading-relaxed font-light italic">
                &ldquo;The financial accounting is remarkably accurate. Our 5-day Amalfi trip hit within $30 of the AI budget estimate. The PDF dossier was pristine.&rdquo;
              </p>
              <div className="pt-4 border-t border-white/[0.06] flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-accent-500/20 text-accent-300 font-bold flex items-center justify-center text-xs">
                  MR
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Marcus Romero</div>
                  <div className="text-[11px] text-slate-400">Culinary Photojournalist</div>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-3xl glass-card border border-white/[0.08] space-y-4">
              <div className="flex gap-1 text-amber-400 text-xs">
                ★★★★★
              </div>
              <p className="text-slate-300 text-sm leading-relaxed font-light italic">
                &ldquo;No cheesy AI hallucinations or fake tourist traps. Every hotel in Zermatt and Kyoto was authentic, well-reviewed, and perfectly placed.&rdquo;
              </p>
              <div className="pt-4 border-t border-white/[0.06] flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-accent-500/20 text-accent-300 font-bold flex items-center justify-center text-xs">
                  SC
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Sophia Chen</div>
                  <div className="text-[11px] text-slate-400">Design Director</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Bottom Call-To-Action Banner ────────────────────────── */}
      <section className="py-24 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <div className="p-12 sm:p-16 rounded-3xl glass-card border border-accent-500/30 shadow-2xl relative overflow-hidden">
            <div className="absolute -top-32 -right-32 w-80 h-80 bg-accent-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

            <span className="text-xs font-semibold uppercase tracking-widest text-accent-400 block mb-3">
              Your Next Journey Awaits
            </span>
            <h2 className="text-3xl sm:text-5xl font-serif font-bold text-white mb-4 tracking-tight">
              Craft Your Masterpiece Itinerary
            </h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto mb-8 leading-relaxed font-light">
              Enter your destination, select your travel companion dynamics, and let VoyageAI orchestrate every day, hotel, and transit leg with Gemini 3.8.
            </p>
            <Button
              size="lg"
              variant="primary"
              onClick={() => navigate('/trips/create')}
              className="shadow-2xl shadow-accent-500/30 text-base py-4 px-10 font-semibold"
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
