import { RouteData, RouteWaypoint } from '@/types/map.types';

const OSRM_BASE_URL = 'https://router.project-osrm.org/route/v1/driving';

/**
 * In-memory cache for OSRM route requests
 */
const routeCache = new Map<string, RouteData>();

/**
 * Fetch real road routing between waypoints using OSRM.
 * Strictly respects [longitude, latitude] input order required by OSRM API,
 * and converts geometry to [latitude, longitude] for Leaflet rendering.
 */
export async function fetchDayRoute(waypoints: RouteWaypoint[]): Promise<RouteData | null> {
  // Routing requires at least 2 distinct points with valid coordinates
  if (!waypoints || waypoints.length < 2) {
    return null;
  }

  // Filter valid points
  const validPoints = waypoints.filter(
    (p) => typeof p.lat === 'number' && typeof p.lng === 'number' && !isNaN(p.lat) && !isNaN(p.lng)
  );

  if (validPoints.length < 2) {
    return null;
  }

  // OSRM coordinates format: {lon},{lat};{lon},{lat}...
  const coordsString = validPoints.map((p) => `${p.lng.toFixed(6)},${p.lat.toFixed(6)}`).join(';');
  const cacheKey = coordsString;

  if (routeCache.has(cacheKey)) {
    return routeCache.get(cacheKey)!;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const url = `${OSRM_BASE_URL}/${coordsString}?overview=full&geometries=geojson&steps=false`;
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn(`[OSRM Routing] HTTP ${res.status}`);
      return null;
    }

    const json = await res.json();

    if (json.code !== 'Ok' || !json.routes || json.routes.length === 0) {
      return null;
    }

    const route = json.routes[0];
    const geoJsonCoords: [number, number][] = route.geometry.coordinates;

    // Convert GeoJSON [lon, lat] -> Leaflet [lat, lon]
    const leafletGeometry: [number, number][] = geoJsonCoords.map(([lon, lat]) => [lat, lon]);

    const result: RouteData = {
      geometry: leafletGeometry,
      distanceKm: Number((route.distance / 1000).toFixed(1)),
      durationMin: Math.round(route.duration / 60),
      waypoints: validPoints,
      provider: 'osrm',
    };

    routeCache.set(cacheKey, result);
    return result;
  } catch (err: any) {
    console.warn('[OSRM Routing Error]:', err.message);
    return null;
  }
}

