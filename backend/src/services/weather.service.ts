import { env } from '../config/env';

export interface DailyWeatherSummary {
  date: string; // YYYY-MM-DD
  forecastAvailable: boolean;
  temperature?: number;
  minTemperature?: number;
  maxTemperature?: number;
  condition?: string;
  description?: string;
  icon?: string;
  humidity?: number;
  windSpeed?: number;
  rainProbability?: number;
  recommendations?: string[];
  message?: string;
  lastUpdated?: Date;
}

interface CacheEntry {
  data: Map<string, DailyWeatherSummary>;
  timestamp: number;
}

class WeatherService {
  private cache = new Map<string, CacheEntry>();
  private readonly CACHE_TTL_MS = 1000 * 60 * 30; // 30 minutes cache

  private getApiKey(): string {
    return (
      env.OPENWEATHER_API_KEY ||
      process.env.OPENWEATHER_API_KEY ||
      (process.env as any).OpenWeather ||
      ''
    );
  }

  /**
   * Geocode a city name using OpenWeather Geocoding API if coordinates are missing.
   */
  public async getCityCoordinates(cityName: string): Promise<{ lat: number; lon: number } | null> {
    const key = this.getApiKey();
    if (!key) return null;

    try {
      const url = `http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(cityName)}&limit=1&appid=${key}`;
      const res = await fetch(url);
      if (!res.ok) return null;
      const data: any = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return { lat: data[0].lat, lon: data[0].lon };
      }
      return null;
    } catch (err: any) {
      console.warn(`[OpenWeather Geocode Error for "${cityName}"]`, err.message);
      return null;
    }
  }

  /**
   * Fetch 5-day / 3-hour forecast from OpenWeather and aggregate by calendar day.
   */
  public async getDailyForecasts(
    lat: number,
    lon: number
  ): Promise<Map<string, DailyWeatherSummary>> {
    const cacheKey = `${lat.toFixed(3)}_${lon.toFixed(3)}`;
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL_MS) {
      return cached.data;
    }

    const key = this.getApiKey();
    const resultMap = new Map<string, DailyWeatherSummary>();

    if (!key) {
      console.warn('[OpenWeather] No API key provided');
      return resultMap;
    }

    try {
      const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${key}&units=metric`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) {
        console.warn(`[OpenWeather] API responded with HTTP ${res.status}`);
        return resultMap;
      }

      const json: any = await res.json();
      if (!json.list || !Array.isArray(json.list)) {
        return resultMap;
      }

      // Group 3-hour records by Date (YYYY-MM-DD)
      const dayGroups = new Map<string, any[]>();

      for (const item of json.list) {
        const dateStr = item.dt_txt.split(' ')[0]; // '2026-10-31'
        if (!dayGroups.has(dateStr)) {
          dayGroups.set(dateStr, []);
        }
        dayGroups.get(dateStr)!.push(item);
      }

      // Aggregate each day's records
      dayGroups.forEach((records, dateStr) => {
        // Pick representative midday record (around 12:00 or 15:00) if available
        let midRecord = records.find(
          (r) => r.dt_txt.includes('12:00') || r.dt_txt.includes('15:00')
        );
        if (!midRecord) midRecord = records[Math.floor(records.length / 2)];

        const temps = records.map((r) => r.main?.temp).filter((t) => typeof t === 'number');
        const minTemp = Math.round(Math.min(...temps));
        const maxTemp = Math.round(Math.max(...temps));
        const avgTemp = Math.round(midRecord.main?.temp ?? (minTemp + maxTemp) / 2);

        const condition = midRecord.weather?.[0]?.main || 'Clear';
        const description = midRecord.weather?.[0]?.description || 'clear sky';
        const icon = midRecord.weather?.[0]?.icon || '01d';
        const humidity = midRecord.main?.humidity || 50;
        const windSpeed = Math.round((midRecord.wind?.speed || 2) * 3.6); // m/s to km/h
        const rainProbability = Math.round((midRecord.pop || 0) * 100);

        // Generate recommendations based on actual weather
        const recommendations: string[] = [];
        const condLower = condition.toLowerCase();

        if (condLower.includes('rain') || rainProbability > 40) {
          recommendations.push('Rain expected: pack an umbrella and waterproof jacket.');
        }
        if (condLower.includes('snow') || minTemp <= 2) {
          recommendations.push('Cold/snowy conditions: bring thermal layers, gloves, and warm boots.');
        }
        if (maxTemp >= 28) {
          recommendations.push('High temperatures: stay hydrated, use sunscreen, and wear a hat.');
        }
        if (windSpeed > 25) {
          recommendations.push('Breezy conditions: check mountain pass and cable car advisories.');
        }
        if (recommendations.length === 0) {
          recommendations.push('Mild and pleasant weather: ideal for walking tours and outdoor sightseeing.');
        }

        resultMap.set(dateStr, {
          date: dateStr,
          forecastAvailable: true,
          temperature: avgTemp,
          minTemperature: minTemp,
          maxTemperature: maxTemp,
          condition,
          description,
          icon,
          humidity,
          windSpeed,
          rainProbability,
          recommendations,
          lastUpdated: new Date(),
        });
      });

      this.cache.set(cacheKey, { data: resultMap, timestamp: Date.now() });
      return resultMap;
    } catch (err: any) {
      console.warn('[OpenWeather Forecast Error]:', err.message);
      return resultMap;
    }
  }

  /**
   * Enrich itinerary days with weather forecast information.
   * Dates covered by the 5-day forecast receive live metrics.
   * Dates beyond the window receive honest "Forecast not available yet" status.
   */
  public async enrichItineraryWeather(
    itinerary: any,
    destination: string,
    coords?: { lat: number; lng: number }
  ): Promise<boolean> {
    let targetCoords = coords;

    if (!targetCoords || !targetCoords.lat || !targetCoords.lng) {
      // Try resolving via OpenWeather Geocode
      const geo = await this.getCityCoordinates(destination);
      if (geo) {
        targetCoords = { lat: geo.lat, lng: geo.lon };
      }
    }

    if (!targetCoords || !targetCoords.lat || !targetCoords.lng) {
      return false;
    }

    const forecasts = await this.getDailyForecasts(targetCoords.lat, targetCoords.lng);
    let modified = false;

    if (Array.isArray(itinerary.days)) {
      for (const day of itinerary.days) {
        const dayDate = day.date ? day.date.split('T')[0] : '';
        const forecast = forecasts.get(dayDate);

        if (forecast) {
          day.weather = forecast;
          modified = true;
        } else {
          // Date is beyond the 5-day forecast window
          day.weather = {
            date: dayDate || `Day ${day.dayNumber}`,
            forecastAvailable: false,
            message: 'Forecast not available yet (forecasts are released 5 days prior to arrival)',
            lastUpdated: new Date(),
          };
          modified = true;
        }
      }
    }

    return modified;
  }
}

export const weatherService = new WeatherService();

