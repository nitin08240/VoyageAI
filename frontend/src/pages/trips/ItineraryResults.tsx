import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Users,
  Wallet,
  Download,
  Share2,
  RotateCcw,
  MapPin,
  Sparkles,
  BedDouble,
  Utensils,
  Map as MapIcon,
  ShieldAlert,
  CheckSquare,
  Compass,
  Check,
  Copy,
  Info,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { formatCurrency } from '@/lib/currency';
import { generateItineraryPDF } from '@/lib/pdfExporter';

import PageWrapper from '@/components/layout/PageWrapper';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import ItineraryTimeline from '@/components/itinerary/ItineraryTimeline';
import HotelCard from '@/components/itinerary/HotelCard';
import RestaurantCard from '@/components/itinerary/RestaurantCard';
import BudgetSummary from '@/components/budget/BudgetSummary';
import TravelMap from '@/components/map/TravelMap';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';

import { itineraryService } from '@/services/itineraryService';
import { tripService } from '@/services/tripService';
import type { IItinerary } from '@/types/itinerary.types';
import type { ITrip } from '@/types/trip.types';

const TABS = [
  { id: 'overview', label: 'Overview', icon: Info },
  { id: 'daily', label: 'Daily Plan', icon: Calendar },
  { id: 'hotels', label: 'Hotels', icon: BedDouble },
  { id: 'restaurants', label: 'Dining', icon: Utensils },
  { id: 'activities', label: 'Activities', icon: Compass },
  { id: 'budget', label: 'Budget', icon: Wallet },
  { id: 'map', label: 'Map', icon: MapIcon },
  { id: 'safety', label: 'Safety & Tips', icon: ShieldAlert },
  { id: 'packing', label: 'Packing Checklist', icon: CheckSquare },
] as const;

type TabId = typeof TABS[number]['id'];

export const ItineraryResults: React.FC = () => {
  const { id: tripId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [itinerary, setItinerary] = useState<IItinerary | null>(null);
  const [trip, setTrip] = useState<ITrip | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const printableRef = useRef<HTMLDivElement>(null);

  const fetchTripData = useCallback(async () => {
    if (!tripId) return;
    setIsLoading(true);
    setLoadError(null);

    try {
      const [itinData, tripData] = await Promise.all([
        itineraryService.getItinerary(tripId),
        tripService.getTripById(tripId),
      ]);
      setItinerary(itinData);
      setTrip(tripData);
    } catch (err: any) {
      console.error('Failed to load itinerary:', err);
      const errMsg =
        err?.response?.data?.message ||
        err?.message ||
        'Could not load itinerary. The server may be busy or reconnecting.';
      setLoadError(errMsg);
    } finally {
      setIsLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    fetchTripData();
  }, [fetchTripData]);

  // Professional multi-page PDF Export
  const handleExportPDF = async () => {
    if (!trip || !itinerary) return;
    setIsExporting(true);

    try {
      await generateItineraryPDF(trip, itinerary);
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // Share link handler
  const handleShare = async () => {
    if (!tripId) return;
    try {
      const res = await tripService.shareTrip(tripId);
      const url = `${window.location.origin}/shared/${res.shareToken}`;
      setShareLink(url);
      setIsShareModalOpen(true);
    } catch (err) {
      console.error('Failed to share trip:', err);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Regenerate handler
  const handleRegenerate = async () => {
    if (!tripId) return;
    if (window.confirm('Regenerate this itinerary? A new version will be created.')) {
      navigate(`/trips/${tripId}/generate`);
    }
  };

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="max-w-7xl mx-auto px-6 py-12 space-y-6">
          <LoadingSkeleton variant="card" className="h-64" />
          <LoadingSkeleton variant="card" className="h-96" />
        </div>
      </PageWrapper>
    );
  }

  if (!itinerary || !trip) {
    return (
      <PageWrapper>
        <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6">
          {loadError ? (
            <>
              <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-serif font-bold text-white mb-2">Connection Hiccup</h2>
              <p className="text-slate-400 text-xs sm:text-sm max-w-md mb-6">
                {loadError}
              </p>
              <div className="flex items-center gap-3">
                <Button
                  variant="primary"
                  onClick={fetchTripData}
                  className="text-xs font-semibold flex items-center gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Retry Loading
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => navigate(`/trips/${tripId}/generate`)}
                  className="text-xs font-semibold"
                >
                  Regenerate Trip
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-accent-500/10 border border-accent-500/20 text-accent-400 flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-serif font-bold text-white mb-2">No Itinerary Found</h2>
              <p className="text-slate-400 text-xs sm:text-sm max-w-md mb-6">
                We couldn't retrieve an itinerary for this trip. Generate one now with VoyageAI.
              </p>
              <Button
                variant="primary"
                onClick={() => navigate(`/trips/${tripId}/generate`)}
                className="text-xs font-semibold"
              >
                Generate Itinerary Now
              </Button>
            </>
          )}
        </div>
      </PageWrapper>
    );
  }

  const destCity = trip.destination?.city || (trip.destination as any)?.name || 'Custom Destination';
  const destCountry = trip.destination?.country || '';

  // Extract raw overview text if stored as JSON string
  let parsedOverview: any = null;
  try {
    if (itinerary.overview && typeof itinerary.overview === 'string' && itinerary.overview.startsWith('{')) {
      parsedOverview = JSON.parse(itinerary.overview);
    }
  } catch {
    // leave as plain string
  }

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-8" ref={printableRef}>
        {/* ─── Hero Header ────────────────────────────────────────── */}
        <div className="p-8 sm:p-10 rounded-3xl glass-card border border-white/10 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-accent-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-accent-500/10 border border-accent-500/20 text-accent-400 text-xs font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> AI Curated Blueprint
              </span>
              <Badge variant="success">Version {itinerary.version || 1}</Badge>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-accent-400">
              <MapPin className="w-4 h-4" />
              <span>{destCountry}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-serif font-extrabold text-white">
              {destCity}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-accent-400" />
                <span>
                  {trip.dates?.departureDate || (trip.dates?.start ? new Date(trip.dates.start).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Upcoming')}
                  {' → '}
                  {trip.dates?.returnDate || (trip.dates?.end ? new Date(trip.dates.end).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '')}
                  {' '}({itinerary.days?.length || trip.dates?.duration || 1} Days)
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-sky-400" />
                <span className="capitalize">
                  {trip.travellers?.type ? `${trip.travellers.type} • ` : ''}
                  {trip.travellers?.adults || 1} Adults{trip.travellers?.children ? `, ${trip.travellers.children} Children` : ''}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Wallet className="w-4 h-4 text-emerald-400" />
                <span>
                  {formatCurrency(
                    trip.budget?.amount ?? trip.budget?.total ?? itinerary.budgetBreakdown?.total ?? 0,
                    trip.budget?.currency || 'USD'
                  )}{' '}
                  Budget
                </span>
              </div>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5 relative z-10 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="text-xs font-semibold"
            >
              <Share2 className="w-4 h-4 mr-1.5" /> Share
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRegenerate}
              className="text-xs font-semibold"
            >
              <RotateCcw className="w-4 h-4 mr-1.5" /> Regenerate
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={isExporting}
              onClick={handleExportPDF}
              className="text-xs font-semibold shadow-lg shadow-accent-500/25"
            >
              <Download className="w-4 h-4 mr-1.5" /> Export PDF
            </Button>
          </div>
        </div>

        {/* ─── Tabs Navigation ─────────────────────────────────────── */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/10 no-scrollbar">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-accent-500 text-white shadow-lg shadow-accent-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ─── Tab Content ─────────────────────────────────────────── */}
        <div>
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Destination Hero Banner with Unsplash Photo */}
              <div className="relative w-full h-80 sm:h-96 rounded-3xl overflow-hidden glass-card border border-white/10 shadow-2xl group">
                <img
                  src={
                    itinerary.destinationMedia?.heroUrl ||
                    'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=1600&auto=format&fit=crop'
                  }
                  alt={`${destCity}, ${destCountry}`}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=1600&auto=format&fit=crop';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/40 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-navy-950/80 via-transparent to-transparent" />

                {/* Hero Bottom Content */}
                <div className="absolute bottom-6 left-6 right-6 flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-accent-500 text-white shadow-lg shadow-accent-500/30">
                        Featured Destination
                      </span>
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-black/40 backdrop-blur-md text-slate-300 border border-white/10">
                        {itinerary.days?.length || (trip as any).duration || 3} Days Itinerary
                      </span>
                    </div>
                    <h2 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight drop-shadow-md">
                      {destCity}
                    </h2>
                    <p className="text-sm sm:text-base text-slate-200 mt-1 drop-shadow">
                      {destCountry} &bull; Handcrafted AI travel blueprint
                    </p>
                  </div>

                  {/* Unsplash Attribution */}
                  {itinerary.destinationMedia?.photographer && (
                    <div className="text-[11px] text-white/80 bg-black/50 px-3 py-1.5 rounded-xl backdrop-blur-md border border-white/10">
                      Photo by{' '}
                      <a
                        href={itinerary.destinationMedia.photographerUrl || 'https://unsplash.com?utm_source=voyageai&utm_medium=referral'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold underline hover:text-white"
                      >
                        {itinerary.destinationMedia.photographer}
                      </a>{' '}
                      on Unsplash
                    </div>
                  )}
                </div>
              </div>

              {/* Destination Photo Highlights Gallery */}
              {itinerary.destinationMedia?.gallery && itinerary.destinationMedia.gallery.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-accent-400" /> Destination Highlights Gallery
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                    {itinerary.destinationMedia.gallery.map((photo, i) => (
                      <div
                        key={i}
                        className="h-28 rounded-2xl overflow-hidden glass-card border border-white/10 relative group"
                      >
                        <img
                          src={photo.thumbUrl || photo.url}
                          alt={photo.alt || `${destCity} highlight`}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                          <span className="text-[9px] text-white/90 truncate">
                            Photo by {photo.photographer}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-8 rounded-3xl glass-card border border-white/10">
                <h3 className="text-xl font-serif font-bold text-white mb-3">
                  Destination Briefing & Essence
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                  {parsedOverview?.destinationIntroduction ||
                    (typeof itinerary.overview === 'string' ? itinerary.overview : 'Personalized AI travel blueprint.')}
                </p>

                {parsedOverview?.recommendedTravelSeason && (
                  <div className="mt-6 p-4 rounded-2xl bg-accent-500/10 border border-accent-500/20 flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-accent-400 shrink-0" />
                    <div className="text-xs text-slate-300">
                      <span className="font-semibold text-accent-400">Best Travel Window: </span>
                      {parsedOverview.recommendedTravelSeason}
                    </div>
                  </div>
                )}
              </div>

              {/* Quick glance metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-6 rounded-2xl glass-card border border-white/10">
                  <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">
                    Scheduled Stops
                  </div>
                  <div className="text-2xl font-bold font-serif text-white">
                    {itinerary.days?.reduce((acc, d) => acc + (d.activities?.length || 0), 0) || 0} Activities
                  </div>
                  <div className="text-xs text-slate-400 mt-1">Spanning {itinerary.days?.length || 0} total days</div>
                </div>

                <div className="p-6 rounded-2xl glass-card border border-white/10">
                  <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">
                    Curated Stays
                  </div>
                  <div className="text-2xl font-bold font-serif text-white">
                    {itinerary.hotels?.length || 0} Verified Hotels
                  </div>
                  <div className="text-xs text-slate-400 mt-1">Matched to accommodation tier</div>
                </div>

                <div className="p-6 rounded-2xl glass-card border border-white/10">
                  <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">
                    Dining Spots
                  </div>
                  <div className="text-2xl font-bold font-serif text-white">
                    {itinerary.restaurants?.length || 0} Recommended
                  </div>
                  <div className="text-xs text-slate-400 mt-1">Filtered by dietary style</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DAILY ITINERARY */}
          {activeTab === 'daily' && (
            <div>
              <ItineraryTimeline
                days={itinerary.days || []}
                destinationCity={destCity}
                selectedLocationId={selectedLocationId}
                onLocationSelect={(id, dayNum) => {
                  setSelectedLocationId(id);
                  if (dayNum) setSelectedDay(dayNum);
                  setActiveTab('map');
                }}
              />
            </div>
          )}

          {/* TAB 3: HOTELS */}
          {activeTab === 'hotels' && (
            <div>
              <div className="mb-6">
                <h3 className="text-2xl font-serif font-bold text-white">Handpicked Accommodations</h3>
                <p className="text-slate-400 text-xs">Vetted for location safety, transit proximity, and aesthetics.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {itinerary.hotels?.map((hotel, idx) => (
                  <HotelCard
                    key={idx}
                    hotel={hotel}
                    onViewOnMap={(name) => {
                      setSelectedLocationId(name);
                      setActiveTab('map');
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: RESTAURANTS */}
          {activeTab === 'restaurants' && (
            <div>
              <div className="mb-6">
                <h3 className="text-2xl font-serif font-bold text-white">Culinary Recommendations</h3>
                <p className="text-slate-400 text-xs">From revered street stalls to award-winning local bistros.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {itinerary.restaurants?.map((restaurant, idx) => (
                  <RestaurantCard
                    key={idx}
                    restaurant={restaurant}
                    onViewOnMap={(name) => {
                      setSelectedLocationId(name);
                      setActiveTab('map');
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: ACTIVITIES */}
          {activeTab === 'activities' && (
            <div className="space-y-6">
              <div className="mb-6">
                <h3 className="text-2xl font-serif font-bold text-white">Signature Experiences</h3>
                <p className="text-slate-400 text-xs">Key activities curated for this itinerary.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {itinerary.activities?.map((act, idx) => (
                  <div key={idx} className="p-5 rounded-2xl glass-card border border-white/10 flex flex-col justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <Compass className="w-5 h-5 text-accent-400 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-white text-sm">{act.name}</h4>
                        <p className="text-xs text-slate-300 mt-1 leading-relaxed">{act.description}</p>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-white/5 flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedLocationId(act.name);
                          setActiveTab('map');
                        }}
                        className="text-xs text-accent-400 hover:text-accent-300 font-semibold flex items-center gap-1 transition-colors px-2.5 py-1 rounded-lg bg-accent-500/10 hover:bg-accent-500/20 border border-accent-500/20"
                      >
                        <Compass className="w-3.5 h-3.5" /> View on Map
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: BUDGET */}
          {activeTab === 'budget' && (
            <div>
              <BudgetSummary
                budget={
                  itinerary.budgetBreakdown || {
                    total: trip.budget?.amount ?? trip.budget?.total ?? 2500,
                    currency: trip.budget?.currency || 'USD',
                    accommodation: Math.round((trip.budget?.amount ?? trip.budget?.total ?? 2500) * 0.4),
                    food: Math.round((trip.budget?.amount ?? trip.budget?.total ?? 2500) * 0.25),
                    transport: Math.round((trip.budget?.amount ?? trip.budget?.total ?? 2500) * 0.15),
                    activities: Math.round((trip.budget?.amount ?? trip.budget?.total ?? 2500) * 0.15),
                    miscellaneous: Math.round((trip.budget?.amount ?? trip.budget?.total ?? 2500) * 0.05),
                    breakdown: [],
                  }
                }
                targetBudget={trip.budget?.amount ?? trip.budget?.total ?? 2500}
                travelerCount={(trip.travellers?.adults || 1) + (trip.travellers?.children || 0)}
              />
            </div>
          )}

          {/* TAB 7: MAP */}
          {activeTab === 'map' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-2xl font-serif font-bold text-white">Interactive Journey Map</h3>
                  <p className="text-slate-400 text-xs">
                    Explore daily routes, verified accommodations, culinary hotspots, and attractions across {destCity}.
                  </p>
                </div>
              </div>

              <TravelMap
                itinerary={itinerary}
                destinationName={`${destCity}, ${destCountry}`}
                selectedDay={selectedDay}
                selectedLocationId={selectedLocationId}
                onLocationSelect={(id) => setSelectedLocationId(id)}
                height="620px"
              />
            </div>
          )}

          {/* TAB 8: SAFETY & TIPS */}
          {activeTab === 'safety' && (
            <div className="space-y-6">
              <div className="p-6 rounded-3xl glass-card border border-white/10">
                <h3 className="text-lg font-serif font-bold text-white mb-4 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-amber-400" /> Essential Safety Precautions
                </h3>
                <ul className="space-y-3">
                  {(itinerary.safetyTips || [
                    'Keep copies of passports and emergency contact numbers in cloud storage.',
                    'Use registered metered taxis or rideshare apps rather than unsolicited transport.',
                    'Check current weather forecasts for seasonal flash rains or temperature dips.',
                  ]).map((tip, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5" />
                      <span>{typeof tip === 'string' ? tip : (tip as any).category || 'Safety tip'}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {itinerary.thingsToAvoid && itinerary.thingsToAvoid.length > 0 && (
                <div className="p-6 rounded-3xl glass-card border border-red-500/20 bg-red-950/10">
                  <h3 className="text-lg font-serif font-bold text-red-300 mb-4 flex items-center gap-2">
                    Common Tourist Mistakes & Scams to Avoid
                  </h3>
                  <ul className="space-y-2.5">
                    {itinerary.thingsToAvoid.map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs text-red-200/90 leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0 mt-1.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* TAB 9: PACKING CHECKLIST */}
          {activeTab === 'packing' && (
            <div className="p-8 rounded-3xl glass-card border border-white/10 space-y-6">
              <div>
                <h3 className="text-xl font-serif font-bold text-white">Curated Packing Checklist</h3>
                <p className="text-slate-400 text-xs">
                  Specific to {destCity}'s weather profile and scheduled activities.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(Array.isArray(itinerary.packingChecklist)
                  ? (itinerary.packingChecklist as any[]).map((c: any) => ({
                      name: c.category || c.name || 'Essentials',
                      items: Array.isArray(c.items) ? c.items.map((it: any) => (typeof it === 'string' ? { item: it, essential: true } : it)) : [],
                    }))
                  : Array.isArray((itinerary.packingChecklist as any)?.categories)
                  ? (itinerary.packingChecklist as any).categories
                  : Object.entries((itinerary.packingChecklist as any) || {}).map(([name, items]) => ({
                      name,
                      items: Array.isArray(items) ? (items as any[]).map((it) => (typeof it === 'string' ? { item: it, essential: true } : it)) : [],
                    }))
                ).map((cat: any, idx: number) => (
                  <div key={idx} className="p-5 rounded-2xl bg-navy-950/60 border border-white/5 space-y-3">
                    <h4 className="text-sm font-bold text-accent-400 capitalize flex items-center gap-2">
                      <CheckSquare className="w-4 h-4" /> {cat.name}
                    </h4>
                    <ul className="space-y-2">
                      {cat.items?.map((item: any, i: number) => {
                        const itemName = typeof item === 'string' ? item : item.item;
                        const packingId = `packing-${cat.name?.toLowerCase().replace(/\s+/g, '-')}-${i}`;
                        return (
                          <li key={i} className="flex items-center gap-2 text-xs text-slate-300">
                            <input
                              id={packingId}
                              name={packingId}
                              aria-label={itemName}
                              type="checkbox"
                              className="rounded border-white/20 text-accent-500 focus:ring-accent-500 bg-navy-900 w-4 h-4 cursor-pointer"
                            />
                            <label htmlFor={packingId} className="cursor-pointer select-none">{itemName}</label>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Share Modal */}
        {isShareModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-md p-6 rounded-3xl glass-card border border-white/20 shadow-2xl space-y-4">
              <h3 className="text-lg font-bold text-white">Share Your Trip Itinerary</h3>
              <p className="text-xs text-slate-300">
                Anyone with this link can view this curated itinerary in read-only mode without needing an account.
              </p>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-navy-950 border border-white/10">
                <input
                  id="share-link-input"
                  name="shareLink"
                  aria-label="Shareable itinerary link"
                  type="text"
                  readOnly
                  value={shareLink}
                  className="w-full bg-transparent text-xs text-slate-300 px-2 focus:outline-none"
                />
                <Button
                  size="sm"
                  variant="primary"
                  onClick={copyToClipboard}
                  className="text-xs shrink-0"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              <div className="flex justify-end pt-2">
                <Button variant="outline" size="sm" onClick={() => setIsShareModalOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

export default ItineraryResults;
