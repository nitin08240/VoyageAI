/**
 * Geocoding Service for VoyageAI using OpenStreetMap's Nominatim API.
 * Strict compliance with OSM Acceptable Use Policy:
 * - Minimum 1.1s throttling between consecutive requests.
 * - Identified User-Agent.
 * - In-memory caching with TTL to prevent redundant requests.
 * - Numerical boundary validation: Lat [-90, 90], Lng [-180, 180].
 */

interface GeocodeResult {
  lat: number;
  lng: number;
  displayName: string;
}

interface CacheEntry {
  result: GeocodeResult | null;
  timestamp: number;
}

class GeocodingService {
  private cache = new Map<string, CacheEntry>();
  private readonly CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days in memory
  private lastRequestTime = 0;
  private readonly MIN_INTERVAL_MS = 1100; // >1s per OSM terms of use
  private requestQueue: Array<() => Promise<void>> = [];
  private isProcessingQueue = false;

  /**
   * Rate-limited executor for Nominatim calls.
   */
  private async throttle(): Promise<void> {
    const now = Date.now();
    const elapsed = now - this.lastRequestTime;
    if (elapsed < this.MIN_INTERVAL_MS) {
      const waitTime = this.MIN_INTERVAL_MS - elapsed;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    this.lastRequestTime = Date.now();
  }

  /**
   * Clean and normalize location search query.
   */
  private normalizeQuery(name: string, context?: string): string {
    const raw = `${name} ${context || ''}`.trim();
    return raw
      .replace(/[^\w\s,\.-]/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Geocode a single place name with optional city/country context.
   */
  public async geocode(name: string, context?: string): Promise<GeocodeResult | null> {
    if (!name || name.trim().length === 0) return null;

    const query = this.normalizeQuery(name, context);
    const cacheKey = query.toLowerCase();

    // Check cache
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL_MS) {
      return cached.result;
    }

    try {
      await this.throttle();

      const url = new URL('https://nominatim.openstreetmap.org/search');
      url.searchParams.set('q', query);
      url.searchParams.set('format', 'jsonv2');
      url.searchParams.set('limit', '1');
      url.searchParams.set('addressdetails', '0');

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(url.toString(), {
        headers: {
          'User-Agent': 'VoyageAI/1.0 (contact@voyageai.local; AI-Travel-Planner)',
          Accept: 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        console.warn(`[Nominatim] HTTP ${res.status} for query: "${query}"`);
        this.cache.set(cacheKey, { result: null, timestamp: Date.now() });
        return null;
      }

      const data: any = await res.json();

      if (!Array.isArray(data) || data.length === 0) {
        // Retry with just destination context if venue specific was too narrow
        if (context && name !== context) {
          return this.geocode(context);
        }
        this.cache.set(cacheKey, { result: null, timestamp: Date.now() });
        return null;
      }

      const item = data[0];
      const lat = parseFloat(item.lat);
      const lng = parseFloat(item.lon);

      // Strict coordinate range validation
      if (
        isNaN(lat) ||
        isNaN(lng) ||
        lat < -90 ||
        lat > 90 ||
        lng < -180 ||
        lng > 180
      ) {
        this.cache.set(cacheKey, { result: null, timestamp: Date.now() });
        return null;
      }

      const result: GeocodeResult = {
        lat: Number(lat.toFixed(6)),
        lng: Number(lng.toFixed(6)),
        displayName: item.display_name || name,
      };

      this.cache.set(cacheKey, { result, timestamp: Date.now() });
      return result;
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.warn(`[Nominatim] Timeout for query: "${query}"`);
      } else {
        console.warn(`[Nominatim] Error resolving "${query}":`, err.message);
      }
      return null;
    }
  }

  /**
   * Geocode missing coordinates in an itinerary document and return whether changes occurred.
   */
  public async geocodeItinerary(itinerary: any, destinationContext?: string): Promise<boolean> {
    let modified = false;

    // 1. Geocode Hotels
    if (Array.isArray(itinerary.hotels)) {
      for (const hotel of itinerary.hotels) {
        if (!hotel.coordinates || !hotel.coordinates.lat || !hotel.coordinates.lng) {
          const res = await this.geocode(hotel.name, hotel.location || destinationContext);
          if (res) {
            hotel.coordinates = { lat: res.lat, lng: res.lng };
            hotel.verified = true;
            modified = true;
          }
        }
      }
    }

    // 2. Geocode Restaurants
    if (Array.isArray(itinerary.restaurants)) {
      for (const rest of itinerary.restaurants) {
        if (!rest.coordinates || !rest.coordinates.lat || !rest.coordinates.lng) {
          const res = await this.geocode(rest.name, rest.location || destinationContext);
          if (res) {
            rest.coordinates = { lat: res.lat, lng: res.lng };
            rest.verified = true;
            modified = true;
          }
        }
      }
    }

    // 3. Geocode Daily Activities
    if (Array.isArray(itinerary.days)) {
      for (const day of itinerary.days) {
        const slots = ['morning', 'afternoon', 'evening'] as const;
        for (const slot of slots) {
          if (Array.isArray(day[slot])) {
            for (const act of day[slot]) {
              if (!act.coordinates || !act.coordinates.lat || !act.coordinates.lng) {
                const res = await this.geocode(act.name, destinationContext);
                if (res) {
                  act.coordinates = { lat: res.lat, lng: res.lng };
                  modified = true;
                }
              }
            }
          }
        }
      }
    }

    return modified;
  }
}

export const geocodingService = new GeocodingService();

