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

  const size = isSelected ? 38 : 28;
  const pulseStyle = isSelected
    ? 'box-shadow: 0 0 0 4px #f97316, 0 0 20px rgba(249, 115, 22, 0.85);'
    : 'box-shadow: 0 4px 14px rgba(0,0,0,0.6);';

  return L.divIcon({
    className: `voyage-custom-pin ${isSelected ? 'voyage-pin-selected' : ''}`,
    html: `
      <div style="background-color: ${bgColor}; width: ${size}px; height: ${size}px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; ${pulseStyle} border: 2.5px solid white; transition: all 0.3s ease;">
        <span style="transform: rotate(45deg); color: white; font-size: ${isSelected ? '12px' : '10px'}; font-weight: 800; font-family: sans-serif;">${label}</span>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
};

// Haversine distance calculator to filter out invalid / distant coordinates
const calculateDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Map controller for auto-fitting bounds and smooth flyTo on selected location
function MapViewController({
  locations,
  selectedLocation,
  triggerFit,
  markerRefs,
}: {
  locations: MapLocation[];
  selectedLocation?: MapLocation | null;
  triggerFit: number;
  markerRefs: React.MutableRefObject<Map<string, L.Marker>>;
}) {
  const map = useMap();
  const hasFittedRef = React.useRef(false);

  // Fit bounds when markers change or "Fit All" is clicked
  useEffect(() => {
    if (!triggerFit && hasFittedRef.current) return;
    hasFittedRef.current = true;

    const validCoords = locations
      .filter((loc) => loc.coordinates && Number.isFinite(loc.coordinates.lat) && Number.isFinite(loc.coordinates.lng))
      .map((loc) => [loc.coordinates!.lat, loc.coordinates!.lng] as [number, number]);

    if (validCoords.length > 0) {
      const bounds = L.latLngBounds(validCoords);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [locations, triggerFit, map]);

  // Smooth flyTo and auto-open popup on selected location
  useEffect(() => {
    if (selectedLocation?.coordinates) {
      const { lat, lng } = selectedLocation.coordinates;
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        map.flyTo([lat, lng], 16, { duration: 1.5 });

        // Auto-open marker popup
        const marker = markerRefs.current.get(selectedLocation.locationId);
        if (marker) {
          setTimeout(() => {
            marker.openPopup();
          }, 400);
        }
      }
    }
  }, [selectedLocation, map, markerRefs]);

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

  // Destination center anchor for sanity-checking coordinates
  const destCenter = useMemo(() => {
    if (itinerary?.destinationCoordinates?.lat && itinerary?.destinationCoordinates?.lng) {
      return itinerary.destinationCoordinates;
    }
    if (itinerary?.destination?.coordinates?.lat && itinerary?.destination?.coordinates?.lng) {
      return itinerary.destination.coordinates;
    }
    return null;
  }, [itinerary]);

  // Marker references for programmatic flyTo and openPopup
  const markerRefs = React.useRef<Map<string, L.Marker>>(new Map());

  // Filter locations with valid coordinates and distance check against destination center
  const locationsWithCoords = useMemo(() => {
    return filteredLocations.filter((loc) => {
      if (!loc.coordinates || !Number.isFinite(loc.coordinates.lat) || !Number.isFinite(loc.coordinates.lng)) {
        return false;
      }
      // If we have an authoritative destination anchor, reject any coordinates > 150km away (e.g. stale Kyoto hallucinations)
      if (destCenter && Number.isFinite(destCenter.lat) && Number.isFinite(destCenter.lng)) {
        const dist = calculateDistanceKm(
          destCenter.lat,
          destCenter.lng,
          loc.coordinates.lat,
          loc.coordinates.lng
        );
        if (dist > 150) {
          return false;
        }
      }
      return true;
    });
  }, [filteredLocations, destCenter]);

  // Robust selected location matching by id or name
  const selectedLocation = useMemo(() => {
    if (!selectedLocationId) return null;
    const target = selectedLocationId.trim().toLowerCase();
    return (
      allLocations.find(
        (loc) =>
          loc.locationId.toLowerCase() === target ||
          loc.name.toLowerCase() === target ||
          loc.name.toLowerCase().includes(target) ||
          target.includes(loc.name.toLowerCase())
      ) || null
    );
  }, [allLocations, selectedLocationId]);

  // Auto-synchronize Day filter when a day-specific activity or attraction is selected
  useEffect(() => {
    if (selectedLocation?.dayNumber && selectedDay !== selectedLocation.dayNumber) {
      setSelectedDay(selectedLocation.dayNumber);
    }
  }, [selectedLocation, selectedDay]);

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
  if (locationsWithCoords.length === 0 && !destCenter) {
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

  const defaultCenter: [number, number] = selectedLocation?.coordinates
    ? [selectedLocation.coordinates.lat, selectedLocation.coordinates.lng]
    : locationsWithCoords.length > 0
    ? [locationsWithCoords[0].coordinates!.lat, locationsWithCoords[0].coordinates!.lng]
    : destCenter
    ? [destCenter.lat, destCenter.lng]
    : [32.24546, 77.18729]; // Safe neutral fallback

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

          {/* Bounds, FlyTo & Center Controller */}
          <MapViewController
            locations={locationsWithCoords}
            selectedLocation={selectedLocation}
            triggerFit={fitTrigger}
            markerRefs={markerRefs}
          />

          {/* OSRM Daily Road Route Polyline Layer */}
          <DayRoute
            locations={allLocations}
            selectedDay={selectedDay}
            enabled={showRoutes && selectedDay !== null}
          />

          {/* Render Location Markers */}
          {locationsWithCoords.map((item) => {
            const isSelected =
              selectedLocation?.locationId === item.locationId ||
              selectedLocation?.name.toLowerCase() === item.name.toLowerCase();

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
                ref={(node) => {
                  if (node) {
                    markerRefs.current.set(item.locationId, node);
                    if (item.name) {
                      markerRefs.current.set(item.name.toLowerCase(), node);
                    }
                  } else {
                    markerRefs.current.delete(item.locationId);
                    if (item.name) {
                      markerRefs.current.delete(item.name.toLowerCase());
                    }
                  }
                }}
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
