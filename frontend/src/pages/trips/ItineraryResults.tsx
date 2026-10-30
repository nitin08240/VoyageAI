import React, { useEffect, useState, useRef } from 'react';
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
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
  const [isExporting, setIsExporting] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [copied, setCopied] = useState(false);

  const printableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!tripId) return;
    setIsLoading(true);

    Promise.all([
      itineraryService.getItinerary(tripId),
      tripService.getTripById(tripId),
    ])
      .then(([itinData, tripData]) => {
        setItinerary(itinData);
        setTrip(tripData);
      })
      .catch((err) => {
        console.error('Failed to load itinerary:', err);
      })
      .finally(() => setIsLoading(false));
  }, [tripId]);

  // PDF Export using jsPDF & printable DOM
  const handleExportPDF = async () => {
    if (!printableRef.current || !trip) return;
    setIsExporting(true);

    try {
      const element = printableRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#0a0f1e',
      });
      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const destName = trip.destination?.city || (trip.destination as any)?.name || 'Voyage';
      pdf.save(`VoyageAI-Itinerary-${destName}.pdf`);
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
    if (window.confirm('Regenerate this itinerary with Gemini? A new version will be created.')) {
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
          <div className="w-16 h-16 rounded-full bg-accent-500/10 border border-accent-500/20 text-accent-400 flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-white mb-2">No Itinerary Found</h2>
          <p className="text-slate-400 text-xs sm:text-sm max-w-md mb-6">
            We couldn't retrieve an itinerary for this trip. Generate one now with Gemini.
          </p>
          <Button
            variant="primary"
            onClick={() => navigate(`/trips/${tripId}/generate`)}
            className="text-xs font-semibold"
          >
            Generate Itinerary Now
          </Button>
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
                  {trip.dates.departureDate} &rarr; {trip.dates.returnDate} ({itinerary.days?.length || trip.dates.duration || 1} Days)
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-sky-400" />
                <span className="capitalize">{trip.travellers.type} ({trip.travellers.adults} Adults)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Wallet className="w-4 h-4 text-emerald-400" />
                <span>
                  {trip.budget.currency} {trip.budget.amount.toLocaleString()} Budget
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
              <ItineraryTimeline days={itinerary.days || []} />
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
                  <HotelCard key={idx} hotel={hotel} />
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
                  <RestaurantCard key={idx} restaurant={restaurant} />
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
                  <div key={idx} className="p-5 rounded-2xl glass-card border border-white/10 flex items-start gap-3">
                    <Compass className="w-5 h-5 text-accent-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-white text-sm">{act.name}</h4>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">{act.description}</p>
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
                    total: trip.budget.amount,
                    currency: trip.budget.currency,
                    accommodation: Math.round(trip.budget.amount * 0.4),
                    food: Math.round(trip.budget.amount * 0.25),
                    transport: Math.round(trip.budget.amount * 0.15),
                    activities: Math.round(trip.budget.amount * 0.15),
                    miscellaneous: Math.round(trip.budget.amount * 0.05),
                    breakdown: [],
                  }
                }
                targetBudget={trip.budget.amount}
                travelerCount={trip.travellers.adults + (trip.travellers.children || 0)}
              />
            </div>
          )}

          {/* TAB 7: MAP */}
          {activeTab === 'map' && (
            <div>
              <TravelMap
                destination={`${destCity}, ${destCountry}`}
                hotels={itinerary.hotels || []}
                restaurants={itinerary.restaurants || []}
                activities={itinerary.days?.flatMap((d) => d.activities) || []}
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
                {(Array.isArray(itinerary.packingChecklist?.categories)
                  ? itinerary.packingChecklist.categories
                  : Object.entries((itinerary.packingChecklist as any) || {}).map(([name, items]) => ({
                      name,
                      items: Array.isArray(items) ? items.map((it) => ({ item: it, essential: true })) : [],
                    }))
                ).map((cat: any, idx: number) => (
                  <div key={idx} className="p-5 rounded-2xl bg-navy-950/60 border border-white/5 space-y-3">
                    <h4 className="text-sm font-bold text-accent-400 capitalize flex items-center gap-2">
                      <CheckSquare className="w-4 h-4" /> {cat.name}
                    </h4>
                    <ul className="space-y-2">
                      {cat.items?.map((item: any, i: number) => {
                        const itemName = typeof item === 'string' ? item : item.item;
                        return (
                          <li key={i} className="flex items-center gap-2 text-xs text-slate-300">
                            <input
                              type="checkbox"
                              className="rounded border-white/20 text-accent-500 focus:ring-accent-500 bg-navy-900 w-4 h-4 cursor-pointer"
                            />
                            <span>{itemName}</span>
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
