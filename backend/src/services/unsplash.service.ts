import { env } from '../config/env';

export interface UnsplashPhoto {
  id: string;
  url: string;
  thumbUrl: string;
  alt: string;
  photographer: string;
  photographerUrl: string;
  sourceUrl: string;
}

interface CacheEntry {
  data: UnsplashPhoto[];
  timestamp: number;
}

// Fallback curated imagery when API quota is exceeded or offline
const FALLBACK_DESTINATIONS: Record<string, UnsplashPhoto> = {
  default: {
    id: 'default-travel',
    url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=1600&auto=format&fit=crop',
    thumbUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=400&auto=format&fit=crop',
    alt: 'Scenic travel journey',
    photographer: 'Leio McLaren',
    photographerUrl: 'https://unsplash.com/@leiomclaren?utm_source=voyageai&utm_medium=referral',
    sourceUrl: 'https://unsplash.com?utm_source=voyageai&utm_medium=referral',
  },
  manali: {
    id: 'manali-himalayas',
    url: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=1600&auto=format&fit=crop',
    thumbUrl: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=400&auto=format&fit=crop',
    alt: 'Majestic snowy mountains and pine valleys in Manali, Himachal Pradesh',
    photographer: 'Vikash Singh',
    photographerUrl: 'https://unsplash.com/@vikash?utm_source=voyageai&utm_medium=referral',
    sourceUrl: 'https://unsplash.com?utm_source=voyageai&utm_medium=referral',
  },
  kyoto: {
    id: 'kyoto-temple',
    url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1600&auto=format&fit=crop',
    thumbUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=400&auto=format&fit=crop',
    alt: 'Historic pagoda and traditional architecture in Kyoto',
    photographer: 'Su San Lee',
    photographerUrl: 'https://unsplash.com/@susanlee?utm_source=voyageai&utm_medium=referral',
    sourceUrl: 'https://unsplash.com?utm_source=voyageai&utm_medium=referral',
  },
  paris: {
    id: 'paris-eiffel',
    url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1600&auto=format&fit=crop',
    thumbUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=400&auto=format&fit=crop',
    alt: 'Paris skyline with the Eiffel Tower',
    photographer: 'Anthony DELANOIX',
    photographerUrl: 'https://unsplash.com/@anthonydelanoix?utm_source=voyageai&utm_medium=referral',
    sourceUrl: 'https://unsplash.com?utm_source=voyageai&utm_medium=referral',
  },
};

class UnsplashService {
  private cache = new Map<string, CacheEntry>();
  private readonly CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days in-memory cache

  private getAccessKey(): string {
    return (
      env.UNSPLASH_ACCESS_KEY ||
      process.env.UNSPLASH_ACCESS_KEY ||
      process.env.ACCESS_KEY ||
      ''
    );
  }

  /**
   * Search Unsplash photos with caching and rate-limit safety.
   */
  public async searchPhotos(query: string, perPage: number = 5): Promise<UnsplashPhoto[]> {
    const cleanQuery = query.trim().toLowerCase();
    if (!cleanQuery) return [];

    const cacheKey = `${cleanQuery}_${perPage}`;
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL_MS) {
      return cached.data;
    }

    const accessKey = this.getAccessKey();
    if (!accessKey) {
      console.warn('[Unsplash] No access key configured; returning fallback');
      return [this.getFallbackForQuery(cleanQuery)];
    }

    try {
      const url = new URL('https://api.unsplash.com/search/photos');
      url.searchParams.set('query', query);
      url.searchParams.set('per_page', String(perPage));
      url.searchParams.set('orientation', 'landscape');
      url.searchParams.set('content_filter', 'high');

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(url.toString(), {
        headers: {
          Authorization: `Client-ID ${accessKey}`,
          'Accept-Version': 'v1',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        console.warn(`[Unsplash] API responded with HTTP ${res.status} for "${query}"`);
        const fallback = [this.getFallbackForQuery(cleanQuery)];
        this.cache.set(cacheKey, { data: fallback, timestamp: Date.now() });
        return fallback;
      }

      const data: any = await res.json();
      if (!data.results || !Array.isArray(data.results) || data.results.length === 0) {
        const fallback = [this.getFallbackForQuery(cleanQuery)];
        this.cache.set(cacheKey, { data: fallback, timestamp: Date.now() });
        return fallback;
      }

      const photos: UnsplashPhoto[] = data.results.map((item: any) => ({
        id: item.id,
        url: item.urls?.regular || item.urls?.full || item.urls?.small,
        thumbUrl: item.urls?.small || item.urls?.thumb,
        alt: item.alt_description || item.description || query,
        photographer: item.user?.name || 'Unsplash Contributor',
        photographerUrl: item.user?.links?.html
          ? `${item.user.links.html}?utm_source=voyageai&utm_medium=referral`
          : 'https://unsplash.com?utm_source=voyageai&utm_medium=referral',
        sourceUrl: item.links?.html
          ? `${item.links.html}?utm_source=voyageai&utm_medium=referral`
          : 'https://unsplash.com?utm_source=voyageai&utm_medium=referral',
      }));

      this.cache.set(cacheKey, { data: photos, timestamp: Date.now() });
      return photos;
    } catch (err: any) {
      console.warn(`[Unsplash] Request failed for "${query}":`, err.message);
      const fallback = [this.getFallbackForQuery(cleanQuery)];
      return fallback;
    }
  }

  /**
   * Get hero banner and gallery photos for a destination.
   */
  public async getDestinationPhotos(
    destination: string
  ): Promise<{ hero: UnsplashPhoto; gallery: UnsplashPhoto[] }> {
    const photos = await this.searchPhotos(`${destination} landscape mountains landmarks`, 6);
    const hero = photos[0] || this.getFallbackForQuery(destination);
    const gallery = photos.slice(1);
    return { hero, gallery };
  }

  /**
   * Get a specific photo for an attraction/activity.
   */
  public async getAttractionPhoto(
    attractionName: string,
    destination: string
  ): Promise<UnsplashPhoto | null> {
    const cleanName = attractionName
      .replace(/Tour|Walk|Visit|Exploration|Experience|Morning|Afternoon|Evening/gi, '')
      .trim();

    const query = `${cleanName} ${destination}`;
    const photos = await this.searchPhotos(query, 1);
    return photos[0] || null;
  }

  /**
   * Enrich an itinerary document with Unsplash destination and attraction photos.
   */
  public async enrichItineraryImages(itinerary: any, destination: string): Promise<boolean> {
    let modified = false;

    // 1. Destination Media
    if (!itinerary.destinationMedia || !itinerary.destinationMedia.heroUrl) {
      const { hero, gallery } = await this.getDestinationPhotos(destination);
      itinerary.destinationMedia = {
        heroUrl: hero.url,
        thumbUrl: hero.thumbUrl,
        photographer: hero.photographer,
        photographerUrl: hero.photographerUrl,
        sourceUrl: hero.sourceUrl,
        gallery: gallery.map((g) => ({
          url: g.url,
          thumbUrl: g.thumbUrl,
          alt: g.alt,
          photographer: g.photographer,
          photographerUrl: g.photographerUrl,
        })),
      };
      modified = true;
    }

    // 2. Day Activities Photos
    if (Array.isArray(itinerary.days)) {
      for (const day of itinerary.days) {
        const slots = ['morning', 'afternoon', 'evening'] as const;
        for (const slot of slots) {
          if (Array.isArray(day[slot])) {
            for (const act of day[slot]) {
              if (!act.imageUrl) {
                const photo = await this.getAttractionPhoto(act.name, destination);
                if (photo) {
                  act.imageUrl = photo.url;
                  act.thumbUrl = photo.thumbUrl;
                  act.imagePhotographer = photo.photographer;
                  act.imagePhotographerUrl = photo.photographerUrl;
                  modified = true;
                }
              }
            }
          }
        }
      }
    }

    // 3. Hotels Photos
    if (Array.isArray(itinerary.hotels)) {
      for (const hotel of itinerary.hotels) {
        if (!hotel.imageUrl) {
          const photos = await this.searchPhotos(`${hotel.name} hotel ${destination}`, 1);
          if (photos[0]) {
            hotel.imageUrl = photos[0].url;
            hotel.thumbUrl = photos[0].thumbUrl;
            hotel.imagePhotographer = photos[0].photographer;
            hotel.imagePhotographerUrl = photos[0].photographerUrl;
            modified = true;
          }
        }
      }
    }

    // 4. Restaurants Photos
    if (Array.isArray(itinerary.restaurants)) {
      for (const rest of itinerary.restaurants) {
        if (!rest.imageUrl) {
          const photos = await this.searchPhotos(`${rest.name} food dining ${destination}`, 1);
          if (photos[0]) {
            rest.imageUrl = photos[0].url;
            rest.thumbUrl = photos[0].thumbUrl;
            rest.imagePhotographer = photos[0].photographer;
            rest.imagePhotographerUrl = photos[0].photographerUrl;
            modified = true;
          }
        }
      }
    }

    return modified;
  }

  private getFallbackForQuery(query: string): UnsplashPhoto {
    for (const [key, item] of Object.entries(FALLBACK_DESTINATIONS)) {
      if (query.includes(key)) return item;
    }
    return FALLBACK_DESTINATIONS.default;
  }
}

export const unsplashService = new UnsplashService();

