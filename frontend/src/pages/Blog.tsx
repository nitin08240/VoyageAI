import React, { useState } from 'react';
import {
  BookOpen,
  Clock,
  ArrowRight,
  X,
} from 'lucide-react';
import PageWrapper from '@/components/layout/PageWrapper';
import { Button } from '@/components/ui/Button';

interface Article {
  id: string;
  title: string;
  category: 'Guides' | 'Destinations' | 'Budgeting' | 'Technology';
  readTime: string;
  summary: string;
  image: string;
  content: string[];
}

const ARTICLES: Article[] = [
  {
    id: 'manali-himalayas-guide',
    title: 'Mastering the Himalayas: A Comprehensive 5-Day Manali & Solang Roadmap',
    category: 'Destinations',
    readTime: '6 min read',
    summary:
      'How to sequence high-altitude mountain drives, historic cedar forests in Old Manali, and active adventures without suffering travel burnout.',
    image:
      'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=1200&auto=format&fit=crop',
    content: [
      'Traveling through Himachal Pradesh demands respect for mountain topography. Unlike plains travel, a 40 km drive across hill passes can easily require 2.5 to 3 hours depending on seasonal road conditions and weather advisories.',
      'When planning a 5-day stay in Manali, avoid packing every day with distant excursions. Start with low-altitude acclimation in Old Manali, exploring the 450-year-old wooden architecture of Hadimba Temple and the fragrant deodar forests of Dhungri.',
      'Dedicate Day 2 to Solang Valley for adventure activities such as paragliding and zorbing, but ensure you depart early in the morning to beat the valley transit choke points.',
      'On Day 3 and 4, explore the broader 70 km radius: venture into Naggar to visit Naggar Castle and the Nicholas Roerich Art Gallery, tasting authentic local Siddu and trout prepared in mustard oil.',
      'Always reserve your final day for relaxation in Vashisht village, soaking in natural sulfur springs and picking up handwoven Kullu shawls directly from local artisan cooperatives.',
    ],
  },
  {
    id: '70km-radius-discovery',
    title: '70 km Radius Discovery: Why Lesser-Known Landmarks Transform Your Journey',
    category: 'Guides',
    readTime: '5 min read',
    summary:
      'Why staying strictly inside the main tourist core limits your trip, and how cluster-based exploration uncovers peaceful temples and scenic viewpoints.',
    image:
      'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1200&auto=format&fit=crop',
    content: [
      'Most online guidebooks repeat the same congested city attractions. In Rishikesh, for example, travelers flock exclusively to Triveni Ghat and Laxman Jhula, often overlooking the tranquil beauty just 30 to 50 km away.',
      'By broadening your exploration radius to 50–70 km, you unlock historic places like Kunjapuri Temple perched at 1,665 meters offering panoramic Himalayan sunrise views, or the secluded Neer Garh waterfalls.',
      'VoyageAI uses geospatial clustering to ensure that every distant excursion is grouped with nearby landmarks, preventing back-and-forth transit crisscrossing.',
      'This regional approach also supports rural livelihoods and mountain communities outside hyper-commercialized tourist epicenters.',
    ],
  },
  {
    id: 'art-of-travel-pacing',
    title: 'The Art of Travel Pacing: Why Realistic Transit Times Make or Break a Trip',
    category: 'Guides',
    readTime: '4 min read',
    summary:
      'The biggest mistake travelers make is underestimating transit fatigue. Here is how sequencing morning, afternoon, and evening slots preserves energy.',
    image:
      'https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=1200&auto=format&fit=crop',
    content: [
      'Travel fatigue rarely stems from walking; it stems from unpredictable transitions. Packing four distant monuments into a single morning creates friction, stress, and missed meals.',
      'The VoyageAI pacing framework divides every day into three distinct chapters: an energetic morning slot for top priority sights, a relaxed afternoon slot for leisurely dining and cultural walks, and a sunset/evening slot for scenic views or dining.',
      'We also factor in mountain and metropolitan slowdown multipliers. A 20 km transit in Tokyo via metro operates differently than a 20 km taxi crawl on a winding single-lane Himalayan road.',
      'Respecting transit reality turns an exhausting vacation into a restorative expedition.',
    ],
  },
  {
    id: 'currency-and-budget-discipline',
    title: 'Financial Travel Discipline: Allocating Capital Without Arbitrary Dollar Tiers',
    category: 'Budgeting',
    readTime: '5 min read',
    summary:
      'Why symbolic price tiers like $ vs $$$$ fail travelers, and how explicit mathematical breakdowns keep you completely in control of your spend.',
    image:
      'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=1200&auto=format&fit=crop',
    content: [
      'Traditional travel sites categorize hotels with arbitrary symbolic tiers: $, $$, or $$$$. But what does "$$" actually mean when converting across currencies and regional cost-of-living differences?',
      'VoyageAI uses explicit numeric accounting formatted directly in your selected currency (₹, $, €, or £). Your total budget cap is categorized into 6 balanced pillars: Accommodation, Dining, Local Transit, Activities, Shopping, and an Emergency Buffer.',
      'By maintaining a mandatory 8–10% contingency cushion, unexpected taxi fares, entry permit surcharges, or spur-of-the-moment boat rides never break your financial peace of mind.',
    ],
  },
  {
    id: 'high-altitude-packing',
    title: 'High-Altitude Packing Essentials: What Every Mountain Explorer Needs',
    category: 'Guides',
    readTime: '4 min read',
    summary:
      'From layered thermal strategies to UV protection and hydration formulas: a sensible guide to Himalayan and alpine travel packing.',
    image:
      'https://images.unsplash.com/photo-1510312305653-8ed496efae75?q=80&w=1200&auto=format&fit=crop',
    content: [
      'Weather at 2,000 meters and above shifts rapidly. A sunny 18°C afternoon in Manali can plummet to 2°C within an hour of sunset.',
      'The golden rule is 3-tier layering: a moisture-wicking base layer (merino wool or synthetic thermal), an insulating middle layer (fleece or down jacket), and a windproof/waterproof outer shell.',
      'UV radiation increases by roughly 10% for every 1,000 meters of elevation. Quality sunglasses with UV400 protection and a broad-spectrum sunscreen are non-negotiable.',
      'Carry refillable thermal flasks to stay hydrated with warm water throughout the day, mitigating altitude discomfort.',
    ],
  },
  {
    id: 'ai-travel-intelligence-shift',
    title: 'How AI Travel Synthesis Differs from Static Guidebooks and Listicles',
    category: 'Technology',
    readTime: '5 min read',
    summary:
      'Understanding how contextual variables—party size, dietary needs, pacing, and regional data—create a unified travel plan in seconds.',
    image:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop',
    content: [
      'Static guidebooks write for an imaginary average reader. But no traveler is average. A vegan traveler heading to Northern India requires entirely different meal checkpoints than someone interested exclusively in street barbecue.',
      'VoyageAI treats itinerary creation as a multi-variable constraint optimization challenge. We take your exact dates, party composition, dietary preferences, and budget cap, then synthesize a bespoke travel plan.',
      'Combined with OpenStreetMap geocoding and live OpenWeather data, the result is not a generic summary, but an actionable, day-by-day playbook.',
    ],
  },
];

export const Blog: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeArticle, setActiveArticle] = useState<Article | null>(null);

  const categories = ['All', 'Destinations', 'Guides', 'Budgeting', 'Technology'];

  const filteredArticles =
    selectedCategory === 'All'
      ? ARTICLES
      : ARTICLES.filter((a) => a.category === selectedCategory);

  return (
    <PageWrapper>
      {/* ─── Hero Section ────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 text-center max-w-4xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent-500/10 border border-accent-500/20 text-accent-400 text-xs font-medium tracking-wide">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Travel Journal & Engineering Insights</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold text-white tracking-tight leading-tight">
          VoyageAI{' '}
          <span className="font-serif italic text-transparent bg-clip-text bg-gradient-to-r from-accent-400 via-amber-300 to-orange-400">
            Travel Intelligence
          </span>
        </h1>

        <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed font-light">
          In-depth guides, regional discovery frameworks, pacing principles, and modern travel engineering.
        </p>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-accent-500 text-white shadow-lg shadow-accent-500/25'
                  : 'bg-navy-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* ─── Articles Grid ───────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredArticles.map((article) => (
            <article
              key={article.id}
              onClick={() => setActiveArticle(article)}
              className="rounded-2xl bg-navy-900/80 border border-slate-800/80 hover:border-accent-500/40 hover:bg-navy-900 transition-all duration-300 overflow-hidden flex flex-col justify-between cursor-pointer group shadow-xl"
            >
              <div>
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-transparent to-transparent opacity-80" />
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[10px] font-mono uppercase tracking-wider bg-navy-900/90 text-accent-400 border border-slate-700/60 backdrop-blur-md">
                    {article.category}
                  </span>
                </div>

                <div className="p-6 space-y-3">
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{article.readTime}</span>
                  </div>
                  <h2 className="text-base sm:text-lg font-serif font-bold text-white group-hover:text-accent-300 transition-colors line-clamp-2">
                    {article.title}
                  </h2>
                  <p className="text-xs text-slate-400 leading-relaxed font-light line-clamp-3">
                    {article.summary}
                  </p>
                </div>
              </div>

              <div className="px-6 pb-6 pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs text-accent-400 group-hover:text-accent-300 font-medium">
                <span>Read Full Guide</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ─── Reading Modal ───────────────────────────────────────── */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-navy-900 border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="relative h-56 shrink-0 overflow-hidden">
              <img
                src={activeArticle.image}
                alt={activeArticle.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-navy-900/40 to-transparent" />
              <button
                onClick={() => setActiveArticle(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-navy-950/80 text-white hover:bg-navy-900 transition-colors border border-white/10"
                aria-label="Close article"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-4 left-6 right-6">
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono uppercase tracking-wider bg-accent-500 text-white shadow-md">
                  {activeArticle.category}
                </span>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-white mt-2 leading-tight">
                  {activeArticle.title}
                </h3>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-300 font-light leading-relaxed">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-800 text-xs text-slate-400 font-mono">
                <span>VoyageAI Editorial Guide</span>
                <span>•</span>
                <span>{activeArticle.readTime}</span>
              </div>
              {activeArticle.content.map((p, idx) => (
                <p key={idx} className="leading-relaxed">
                  {p}
                </p>
              ))}
            </div>

            {/* Footer */}
            <div className="p-4 bg-navy-950 border-t border-slate-800 flex items-center justify-between shrink-0">
              <span className="text-xs text-slate-500 font-light">
                Published by VoyageAI Travel Research
              </span>
              <Button
                size="sm"
                variant="primary"
                onClick={() => setActiveArticle(null)}
                className="text-xs font-semibold px-4"
              >
                Done Reading
              </Button>
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
};

export default Blog;
