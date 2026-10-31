import React, { useState, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation, RefreshCw } from 'lucide-react';
import { MapLocation, MapCategoryFilter, TravelMapProps } from '@/types/map.types';
import { MapControls } from './MapControls';
import { MapLegend } from './MapLegend';
import { MarkerPopup } from './MarkerPopup';
import { DayRoute } from './DayRoute';
import { apiPost } from '@/services/api';

// Create custom colored markers with Leaflet divIcon
const createCustomMarkerIcon = (
  category: MapLocation['category'],
  label: string,
  isSelected: boolean = false
) => {
  let bgColor = '#3b82f6'; // blue for hotels
  if (category === 'restaurant') bgColor = '#f43f5e'; // rose
  if (category === 'attraction') bgColor = '#f59e0b'; // amber
  if (category === 'activity') bgColor = '#10b981'; // emerald
  if (category === 'destination') bgColor = '#6366f1'; // indigo

  const size = isSelected ? 36 : 28;
  const pulseClass = isSelected ? 'ring-4 ring-accent-400 ring-offset-2 ring-offset-navy-950 scale-110' : '';

  return L.divIcon({
    className: 'voyage-custom-pin',
    html: `
      <div style="background-color: ${bgColor}; width: ${size}px; height: ${size}px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(0,0,0,0.6); border: 2.5px solid white;" class="transition-transform duration-200 ${pulseClass}">
        <span style="transform: rotate(45deg); color: white; font-size: ${isSelected ? '12px' : '10px'}; font-weight: 800; font-family: sans-serif;">${label}</span>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
};

// Map controller for auto-fitting bounds and panning to selected location
function MapBoundsController({
  locations,
  selectedLocation,
  triggerFit,
}: {
  locations: MapLocation[];
  selectedLocation?: MapLocation | null;
  triggerFit: number;
}) {
  const map = useMap();

  // Fit bounds when markers change or "Fit All" is clicked
  useEffect(() => {
    const validCoords = locations
      .filter((loc) => loc.coordinates)
      .map((loc) => [loc.coordinates!.lat, loc.coordinates!.lng] as [number, number]);

    if (validCoords.length > 0) {
      const bounds = L.latLngBounds(validCoords);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [locations, triggerFit, map]);

  // Center on selected location if available
  useEffect(() => {
    if (selectedLocation?.coordinates) {
      map.setView([selectedLocation.coordinates.lat, selectedLocation.coordinates.lng], 15, {
        animate: true,
      });
    }
  }, [selectedLocation, map]);

  return null;
}

export const TravelMap: React.FC<TravelMapProps> = ({
  itinerary,
  destination,
  destinationName,
  hotels: propHotels,
  restaurants: propRestaurants,
  activities: propActivities,
  selectedDay: propSelectedDay = null,
  selectedLocationId = null,
  onLocationSelect,
  height = '560px',
}) => {
  const [selectedCategory, setSelectedCategory] = useState<MapCategoryFilter>('all');
  const [selectedDay, setSelectedDay] = useState<number | null>(propSelectedDay);
  const [showRoutes, setShowRoutes] = useState<boolean>(true);
  const [fitTrigger, setFitTrigger] = useState<number>(0);
  const [isGeocoding, setIsGeocoding] = useState<boolean>(false);

  // Sync prop changes
  useEffect(() => {
    if (propSelectedDay !== undefined) {
      setSelectedDay(propSelectedDay);
    }
  }, [propSelectedDay]);

  // Extract and normalize all locations from the itinerary data structure
  const allLocations: MapLocation[] = useMemo(() => {
    const list: MapLocation[] = [];

    // Fallback or explicit hotels
    const hotelsList = itinerary?.hotels || propHotels || [];
    hotelsList.forEach((hotel: any, index: number) => {
      const coords = hotel.coordinates?.lat && hotel.coordinates?.lng ? hotel.coordinates : undefined;
      list.push({
        locationId: `hotel-${index}`,
        name: hotel.name,
        category: 'hotel',
        description: hotel.whyRecommended || hotel.category,
        coordinates: coords,
        address: hotel.location,
        estimatedDuration: 'Stay',
        estimatedCost: hotel.priceRange,
        verificationStatus: hotel.verified ? 'verified' : coords ? 'geocoded' : 'unverified',
        externalUrl: hotel.bookingLink,
        imageUrl: hotel.imageUrl,
        thumbUrl: hotel.thumbUrl,
      });
    });

    // Fallback or explicit restaurants
    const restList = itinerary?.restaurants || propRestaurants || [];
    restList.forEach((restaurant: any, index: number) => {
      const coords = restaurant.coordinates?.lat && restaurant.coordinates?.lng ? restaurant.coordinates : undefined;
      list.push({
        locationId: `restaurant-${index}`,
        name: restaurant.name,
        category: 'restaurant',
        description: restaurant.cuisine ? `${restaurant.cuisine} cuisine` : '',
        coordinates: coords,
        address: restaurant.location,
        estimatedDuration: '1-2 hrs',
        estimatedCost: restaurant.estimatedCost || restaurant.costEstimate,
        verificationStatus: restaurant.verified ? 'verified' : coords ? 'geocoded' : 'unverified',
        imageUrl: restaurant.imageUrl,
        thumbUrl: restaurant.thumbUrl,
      });
    });

    // Daily Sightseeing & Activities from itinerary
    if (Array.isArray(itinerary?.days)) {
      itinerary.days.forEach((day: any) => {
        const slots = ['morning', 'afternoon', 'evening'] as const;

        slots.forEach((key) => {
          if (Array.isArray(day[key])) {
            day[key].forEach((act: any, actIdx: number) => {
              const coords = act.coordinates?.lat && act.coordinates?.lng ? act.coordinates : undefined;
              list.push({
                locationId: `day-${day.dayNumber}-${key}-${actIdx}`,
                name: act.name,
                category: 'attraction',
                description: act.description,
                coordinates: coords,
                dayNumber: day.dayNumber,
                timeSlot: key,
                estimatedDuration: act.duration,
                estimatedCost: act.cost,
                verificationStatus: coords ? 'geocoded' : 'unverified',
                externalUrl: act.mapLink,
                imageUrl: act.imageUrl,
                thumbUrl: act.thumbUrl,
              });
            });
          }
        });
      });
    }

    // Standalone Activities
    const actList = itinerary?.activities || propActivities || [];
    actList.forEach((act: any, actIdx: number) => {
      const coords = act.coordinates?.lat && act.coordinates?.lng ? act.coordinates : undefined;
      list.push({
        locationId: `act-${actIdx}`,
        name: typeof act === 'string' ? act : act.name,
        category: 'activity',
        description: typeof act === 'string' ? act : act.description,
        coordinates: coords,
        estimatedDuration: act.duration || '2 hrs',
        verificationStatus: coords ? 'geocoded' : 'unverified',
        imageUrl: act.imageUrl,
        thumbUrl: act.thumbUrl,
      });
    });

    return list;
  }, [itinerary, propHotels, propRestaurants, propActivities]);

  // Filter locations by Category & Selected Day
  const filteredLocations = useMemo(() => {
    return allLocations.filter((loc) => {
      // Category filter
      if (selectedCategory !== 'all' && loc.category !== selectedCategory) {
        return false;
      }
      // Day filter (only applies to activities with dayNumber; keep hotels/restaurants visible unless filtered)
      if (selectedDay !== null && loc.dayNumber !== undefined) {
        if (loc.dayNumber !== selectedDay) return false;
      }
      return true;
    });
  }, [allLocations, selectedCategory, selectedDay]);

  const locationsWithCoords = useMemo(() => {
    return filteredLocations.filter((loc) => loc.coordinates);
  }, [filteredLocations]);

  const selectedLocation = useMemo(() => {
    if (!selectedLocationId) return null;
    return allLocations.find((loc) => loc.locationId === selectedLocationId || loc.name === selectedLocationId);
  }, [allLocations, selectedLocationId]);

  const totalDays = itinerary?.days?.length || 0;
  const destTitle = destinationName || destination || itinerary?.overview?.destination || itinerary?.destination || 'Your Destination';

  // Request backend to batch geocode missing locations if needed
  const handleBatchGeocode = async () => {
    const tripId = itinerary?.tripId || itinerary?._id;
    if (!tripId) return;

    setIsGeocoding(true);
    try {
      await apiPost(`/itineraries/${tripId}/geocode`);
      // Reload window or notify to refresh state
      window.location.reload();
    } catch (err) {
      console.error('Geocoding request failed:', err);
    } finally {
      setIsGeocoding(false);
    }
  };

  // If absolutely no locations have coordinates yet
  if (locationsWithCoords.length === 0) {
    return (
      <div className="w-full h-96 rounded-3xl glass-card border border-white/10 p-8 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-full bg-accent-500/10 border border-accent-500/20 text-accent-400 flex items-center justify-center mb-4">
          <MapPin className="w-8 h-8" />
        </div>
        <h4 className="text-xl font-serif font-bold text-white mb-2">Interactive Map for {destTitle}</h4>
        <p className="text-xs text-slate-400 max-w-md mb-6 leading-relaxed">
          Coordinates are currently being mapped via OpenStreetMap Nominatim. You can trigger an instant geocoding pass or open the destination directly.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleBatchGeocode}
            disabled={isGeocoding}
            className="px-5 py-2.5 rounded-xl bg-accent-500 hover:bg-accent-600 text-white font-semibold text-xs transition-colors flex items-center gap-2 shadow-lg shadow-accent-500/20 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isGeocoding ? 'animate-spin' : ''}`} />
            {isGeocoding ? 'Resolving Coordinates...' : 'Resolve Geocodes Now'}
          </button>
          <a
            href={`https://www.openstreetmap.org/search?query=${encodeURIComponent(destTitle)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs transition-colors flex items-center gap-2 border border-white/10"
          >
            <Navigation className="w-4 h-4" /> Open in OSM
          </a>
        </div>
      </div>
    );
  }

  const defaultCenter: [number, number] = [
    locationsWithCoords[0].coordinates!.lat,
    locationsWithCoords[0].coordinates!.lng,
  ];

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Map Control Toolbar */}
      <MapControls
        totalDays={totalDays}
        selectedDay={selectedDay}
        onSelectDay={(day) => setSelectedDay(day)}
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => setSelectedCategory(cat)}
        showRoutes={showRoutes}
        onToggleRoutes={() => setShowRoutes(!showRoutes)}
        onFitBounds={() => setFitTrigger((prev) => prev + 1)}
      />

      {/* Main Interactive Map Frame */}
      <div
        className="w-full rounded-3xl overflow-hidden glass-card border border-white/10 shadow-2xl relative"
        style={{ height }}
      >
        <MapContainer
          center={defaultCenter}
          zoom={13}
          scrollWheelZoom={false}
          className="w-full h-full"
        >
          {/* OpenStreetMap Standard Tile Layer */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />

          {/* Bounds & Center Controller */}
          <MapBoundsController
            locations={locationsWithCoords}
            selectedLocation={selectedLocation}
            triggerFit={fitTrigger}
          />

          {/* OSRM Daily Road Route Polyline Layer */}
          <DayRoute
            locations={allLocations}
            selectedDay={selectedDay}
            enabled={showRoutes && selectedDay !== null}
          />

          {/* Render Location Markers */}
          {locationsWithCoords.map((item) => {
            const isSelected = selectedLocation?.locationId === item.locationId;
            let label = 'A';
            if (item.category === 'hotel') label = 'H';
            if (item.category === 'restaurant') label = 'R';
            if (item.category === 'destination') label = '★';

            const icon = createCustomMarkerIcon(item.category, label, isSelected);

            return (
              <Marker
                key={item.locationId}
                position={[item.coordinates!.lat, item.coordinates!.lng]}
                icon={icon}
                eventHandlers={{
                  click: () => {
                    onLocationSelect?.(item.locationId);
                  },
                }}
              >
                <Popup className="voyage-leaflet-popup">
                  <MarkerPopup location={item} />
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* Floating Category Legend */}
        <div className="absolute bottom-4 left-4 z-[1000] pointer-events-auto">
          <MapLegend />
        </div>
      </div>
    </div>
  );
};

export default TravelMap;
