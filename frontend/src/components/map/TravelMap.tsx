import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation } from 'lucide-react';
import { ICoordinates, IHotel, IRestaurant, IActivity } from '@/types/itinerary.types';

// Custom Map Marker Icons using Leaflet divIcon to ensure no broken asset URLs
const createPinIcon = (color: string, label: string) => {
  return L.divIcon({
    className: 'custom-map-pin',
    html: `
      <div style="background-color: ${color}; width: 28px; height: 28px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.5); border: 2px solid white;">
        <span style="transform: rotate(45deg); color: white; font-size: 11px; font-weight: bold;">${label}</span>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  });
};

const hotelIcon = createPinIcon('#3b82f6', 'H'); // Blue
const restaurantIcon = createPinIcon('#ef4444', 'R'); // Red
const activityIcon = createPinIcon('#f97316', 'A'); // Orange

interface MapItem {
  id: string;
  type: 'hotel' | 'restaurant' | 'activity';
  title: string;
  subtitle: string;
  coordinates: ICoordinates;
}

interface TravelMapProps {
  destination?: string;
  hotels?: IHotel[];
  restaurants?: IRestaurant[];
  activities?: IActivity[];
  defaultCenter?: [number, number];
}

// Auto-bounds fitter component
function AutoFitBounds({ markers }: { markers: MapItem[] }) {
  const map = useMap();

  useEffect(() => {
    if (markers.length === 0) return;
    const bounds = L.latLngBounds(markers.map((m) => [m.coordinates.lat, m.coordinates.lng]));
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
  }, [markers, map]);

  return null;
}

export const TravelMap: React.FC<TravelMapProps> = ({
  destination = 'Destination',
  hotels = [],
  restaurants = [],
  activities = [],
  defaultCenter = [35.0116, 135.7681], // Kyoto default
}) => {
  // Extract all points with coordinates
  const markers: MapItem[] = [];

  hotels.forEach((h, i) => {
    if (h.coordinates) {
      markers.push({
        id: `h-${i}`,
        type: 'hotel',
        title: h.name,
        subtitle: `${h.category} Hotel • ${h.priceRange}`,
        coordinates: h.coordinates,
      });
    }
  });

  restaurants.forEach((r, i) => {
    if (r.coordinates) {
      markers.push({
        id: `r-${i}`,
        type: 'restaurant',
        title: r.name,
        subtitle: `${r.cuisine} • ${(r as any).estimatedCost || (r as any).costEstimate || '$20'}`,
        coordinates: r.coordinates,
      });
    }
  });

  activities.forEach((a, i) => {
    if (a.coordinates) {
      markers.push({
        id: `a-${i}`,
        type: 'activity',
        title: a.name,
        subtitle: a.duration,
        coordinates: a.coordinates,
      });
    }
  });

  // If no markers have exact lat/lng, show fallback message with search links
  if (markers.length === 0) {
    return (
      <div className="w-full h-96 rounded-3xl glass-card border border-white/10 p-8 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-full bg-accent-500/10 border border-accent-500/20 text-accent-400 flex items-center justify-center mb-4">
          <MapPin className="w-8 h-8" />
        </div>
        <h4 className="text-xl font-serif font-bold text-white mb-2">
          Interactive Map for {destination}
        </h4>
        <p className="text-xs text-slate-400 max-w-md mb-6 leading-relaxed">
          Geo-coordinates are dynamically mapped from verified venues. You can explore all recommended attractions and hotspots directly on OpenStreetMap or Google Maps below.
        </p>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-3 rounded-xl bg-accent-500 hover:bg-accent-600 text-white font-semibold text-xs transition-colors flex items-center gap-2 shadow-lg shadow-accent-500/20"
        >
          <Navigation className="w-4 h-4" /> Open {destination} in Maps
        </a>
      </div>
    );
  }

  const centerPos = markers[0]?.coordinates
    ? [markers[0].coordinates.lat, markers[0].coordinates.lng]
    : defaultCenter;

  return (
    <div className="w-full h-[520px] rounded-3xl overflow-hidden glass-card border border-white/10 shadow-2xl relative">
      <MapContainer
        center={centerPos as [number, number]}
        zoom={12}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <AutoFitBounds markers={markers} />

        {markers.map((item) => {
          const icon =
            item.type === 'hotel'
              ? hotelIcon
              : item.type === 'restaurant'
              ? restaurantIcon
              : activityIcon;

          return (
            <Marker
              key={item.id}
              position={[item.coordinates.lat, item.coordinates.lng]}
              icon={icon}
            >
              <Popup className="custom-leaflet-popup">
                <div className="p-1">
                  <div className="text-[10px] uppercase tracking-wider text-accent-600 font-bold mb-0.5">
                    {item.type}
                  </div>
                  <div className="text-xs font-bold text-slate-900">{item.title}</div>
                  <div className="text-[11px] text-slate-600 mt-0.5">{item.subtitle}</div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Floating Legend */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-navy-950/90 backdrop-blur-md p-3 rounded-2xl border border-white/10 shadow-2xl flex items-center gap-4 text-xs font-medium text-white">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" /> Hotels
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-500 inline-block" /> Restaurants
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-orange-500 inline-block" /> Attractions
        </div>
      </div>
    </div>
  );
};

export default TravelMap;

