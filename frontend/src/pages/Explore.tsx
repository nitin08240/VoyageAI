import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Compass } from 'lucide-react';
import PageWrapper from '@/components/layout/PageWrapper';
import DestinationCard from '@/components/DestinationCard';

const ALL_DESTINATIONS = [
  {
    id: 'tokyo',
    name: 'Tokyo',
    country: 'Japan',
    category: 'Megacity & Food',
    region: 'Asia',
    image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=800&auto=format&fit=crop',
    tagline: 'Neon-lit skyscrapers, Michelin street stalls, historic Asakusa, and quiet shrines.',
    rating: 4.9,
    startingPrice: '$1,950',
  },
  {
    id: 'paris',
    name: 'Paris',
    country: 'France',
    category: 'Art & Heritage',
    region: 'Europe',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=800&auto=format&fit=crop',
    tagline: 'Haute couture, the Louvre, evening Seine strolls, and world-class bistros.',
    rating: 4.8,
    startingPrice: '$2,200',
  },
  {
    id: 'newyork',
    name: 'New York City',
    country: 'United States',
    category: 'Urban Culture',
    region: 'Americas',
    image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=800&auto=format&fit=crop',
    tagline: 'Broadway shows, Central Park greenery, architectural landmarks, and boundless energy.',
    rating: 4.7,
    startingPrice: '$2,100',
  },
  {
    id: 'kyoto',
    name: 'Kyoto',
    country: 'Japan',
    category: 'Culture & Zen',
    region: 'Asia',
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=800&auto=format&fit=crop',
    tagline: 'Centuries-old Zen temples, secluded bamboo groves, and traditional tea ceremonies.',
    rating: 4.9,
    startingPrice: '$1,800',
  },
  {
    id: 'amalfi',
    name: 'Amalfi Coast',
    country: 'Italy',
    category: 'Coastal Romance',
    region: 'Europe',
    image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=800&auto=format&fit=crop',
    tagline: 'Pastel-hued cliffside villages perched above sparkling cobalt Mediterranean waters.',
    rating: 4.8,
    startingPrice: '$2,400',
  },
  {
    id: 'zermatt',
    name: 'Zermatt',
    country: 'Switzerland',
    category: 'Alpine Wonder',
    region: 'Europe',
    image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?q=80&w=800&auto=format&fit=crop',
    tagline: 'Pristine alpine grandeur, world-class cogwheel rail excursions, and fondues.',
    rating: 5.0,
    startingPrice: '$2,900',
  },
  {
    id: 'capetown',
    name: 'Cape Town',
    country: 'South Africa',
    category: 'Coastal Wildlife',
    region: 'Africa',
    image: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?q=80&w=800&auto=format&fit=crop',
    tagline: 'Table Mountain vistas, dramatic peninsular coastlines, and historic Stellenbosch vineyards.',
    rating: 4.9,
    startingPrice: '$1,650',
  },
  {
    id: 'bali',
    name: 'Bali & Ubud',
    country: 'Indonesia',
    category: 'Island Wellness',
    region: 'Asia',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=800&auto=format&fit=crop',
    tagline: 'Lush terraced rice paddies, cliffside sunset temples, and holistic wellness retreats.',
    rating: 4.7,
    startingPrice: '$1,100',
  },
  {
    id: 'reykjavik',
    name: 'Reykjavik',
    country: 'Iceland',
    category: 'Glacial Epic',
    region: 'Europe',
    image: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?q=80&w=800&auto=format&fit=crop',
    tagline: 'Northern lights cascades, geothermal mineral lagoons, and thunderous waterfalls.',
    rating: 4.9,
    startingPrice: '$2,100',
  },
];

const REGIONS = ['All', 'Europe', 'Asia', 'Americas', 'Africa'];

export const Explore: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All');

  const filtered = ALL_DESTINATIONS.filter((dest) => {
    const matchesSearch =
      dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dest.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dest.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRegion = selectedRegion === 'All' || dest.region === selectedRegion;
    return matchesSearch && matchesRegion;
  });

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="w-12 h-12 rounded-2xl bg-accent-500/10 border border-accent-500/20 text-accent-400 flex items-center justify-center mx-auto mb-3">
            <Compass className="w-6 h-6" />
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white mb-3">
            Explore Destinations
          </h1>
          <p className="text-slate-400 text-sm sm:text-base">
            Discover curated world wonders. Select any location to seed your personalized itinerary.
          </p>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="mb-12 flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl glass-card border border-white/10">
          <div className="w-full md:w-96 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search cities, countries, or styles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-navy-900 border border-white/10 text-white placeholder-slate-500 text-xs focus:border-accent-400 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            <Filter className="w-4 h-4 text-slate-400 shrink-0 mr-1" />
            {REGIONS.map((region) => (
              <button
                key={region}
                type="button"
                onClick={() => setSelectedRegion(region)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedRegion === region
                    ? 'bg-accent-500 text-white shadow-md shadow-accent-500/20'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                {region}
              </button>
            ))}
          </div>
        </div>

        {/* Destination Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((dest) => (
              <DestinationCard
                key={dest.id}
                {...dest}
                onSelect={() => navigate(`/trips/create?destination=${encodeURIComponent(dest.name)}`)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 glass-card rounded-3xl border border-white/10 max-w-md mx-auto p-8">
            <p className="text-slate-400 text-sm mb-4">No destinations matched "{searchQuery}".</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedRegion('All');
              }}
              className="text-accent-400 text-xs font-semibold hover:underline"
            >
              Reset Search & Filters
            </button>
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

export default Explore;
