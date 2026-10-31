import React, { useEffect, useState } from 'react';
import { Polyline } from 'react-leaflet';
import { MapLocation, RouteData } from '@/types/map.types';
import { fetchDayRoute } from '@/services/routing.service';
import { Route, Clock } from 'lucide-react';

interface DayRouteProps {
  locations: MapLocation[];
  selectedDay: number | null;
  enabled: boolean;
}

export const DayRoute: React.FC<DayRouteProps> = ({ locations, selectedDay, enabled }) => {
  const [routeData, setRouteData] = useState<RouteData | null>(null);

  useEffect(() => {
    if (!enabled || selectedDay === null) {
      setRouteData(null);
      return;
    }

    // Filter locations belonging to the selected day that have valid coordinates
    const dayWaypoints = locations
      .filter((loc) => loc.dayNumber === selectedDay && loc.coordinates)
      .map((loc) => ({
        lat: loc.coordinates!.lat,
        lng: loc.coordinates!.lng,
        name: loc.name,
      }));

    if (dayWaypoints.length < 2) {
      setRouteData(null);
      return;
    }

    let isMounted = true;

    fetchDayRoute(dayWaypoints)
      .then((data) => {
        if (isMounted) {
          setRouteData(data);
        }
      })
      .catch((err) => {
        console.warn('Day route fetch error:', err);
        if (isMounted) setRouteData(null);
      });

    return () => {
      isMounted = false;
    };
  }, [locations, selectedDay, enabled]);

  if (!enabled || !routeData || routeData.geometry.length < 2) {
    return null;
  }

  return (
    <>
      {/* Route Glow Line */}
      <Polyline
        positions={routeData.geometry}
        pathOptions={{
          color: '#f97316',
          weight: 7,
          opacity: 0.4,
          lineCap: 'round',
          lineJoin: 'round',
        }}
      />

      {/* Main Sharp Road Route Line */}
      <Polyline
        positions={routeData.geometry}
        pathOptions={{
          color: '#ea580c',
          weight: 3.5,
          opacity: 0.95,
          lineCap: 'round',
          lineJoin: 'round',
          dashArray: undefined,
        }}
      />

      {/* Route Statistics Overlay */}
      <div className="leaflet-top leaflet-right !top-3 !right-3 z-[1000] pointer-events-none">
        <div className="bg-navy-950/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 shadow-xl flex items-center gap-3 text-xs text-white">
          <div className="flex items-center gap-1 text-accent-400 font-bold">
            <Route className="w-3.5 h-3.5" />
            <span>Day {selectedDay} Road Route</span>
          </div>
          <span className="text-slate-400">•</span>
          <span className="text-slate-200">{routeData.distanceKm} km</span>
          <span className="text-slate-400">•</span>
          <div className="flex items-center gap-1 text-slate-300">
            <Clock className="w-3 h-3 text-emerald-400" />
            <span>~{routeData.durationMin} mins</span>
          </div>
        </div>
      </div>
    </>
  );
};
