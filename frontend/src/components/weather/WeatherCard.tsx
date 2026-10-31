import React from 'react';
import {
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudFog,
  Wind,
  Droplets,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { IDayWeather } from '@/types/itinerary.types';

interface WeatherCardProps {
  weather?: IDayWeather;
  destinationCity?: string;
  dayNumber?: number;
}

export const WeatherCard: React.FC<WeatherCardProps> = ({
  weather,
  destinationCity = 'Destination',
  dayNumber,
}) => {
  // If no weather object or forecast is unavailable for this date
  if (!weather || !weather.forecastAvailable) {
    return (
      <div className="p-4 rounded-2xl bg-navy-950/40 border border-white/10 backdrop-blur-md flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400">
            <Calendar className="w-5 h-5 text-accent-400" />
          </div>
          <div>
            <div className="text-xs font-semibold text-white flex items-center gap-2">
              <span>{destinationCity} Weather</span>
              <span className="text-[10px] text-slate-400 font-normal">
                {weather?.date ? `(${weather.date})` : dayNumber ? `(Day ${dayNumber})` : ''}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Forecast not available yet &bull; Live 5-day OpenWeather forecast activates closer to your travel dates.
            </div>
          </div>
        </div>

        <span className="hidden sm:inline-block px-2.5 py-1 rounded-full text-[10px] font-semibold bg-white/5 text-slate-300 border border-white/10">
          Live Sync Active
        </span>
      </div>
    );
  }

  // Determine weather icon
  const getConditionIcon = (condition: string = '', iconCode: string = '') => {
    const c = condition.toLowerCase();
    if (c.includes('thunder')) return <CloudLightning className="w-6 h-6 text-amber-400" />;
    if (c.includes('rain') || c.includes('drizzle')) return <CloudRain className="w-6 h-6 text-sky-400" />;
    if (c.includes('snow')) return <CloudSnow className="w-6 h-6 text-cyan-200" />;
    if (c.includes('mist') || c.includes('fog') || c.includes('haze')) return <CloudFog className="w-6 h-6 text-slate-400" />;
    if (c.includes('cloud')) {
      if (iconCode.includes('02') || iconCode.includes('03')) return <CloudSun className="w-6 h-6 text-amber-300" />;
      return <Cloud className="w-6 h-6 text-slate-300" />;
    }
    return <Sun className="w-6 h-6 text-amber-400" />;
  };

  return (
    <div className="p-4 sm:p-5 rounded-2xl glass-card border border-white/10 shadow-xl space-y-3">
      {/* Top Row: City, Condition & Temperature */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner">
            {getConditionIcon(weather.condition, weather.icon)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">Weather in {destinationCity}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-accent-500/10 text-accent-400 border border-accent-500/20 capitalize">
                {weather.condition || 'Clear'}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 capitalize">
              {weather.description || weather.condition} &bull; {weather.date}
            </div>
          </div>
        </div>

        {/* Temperature Badge */}
        <div className="text-right">
          <div className="text-2xl font-bold font-serif text-white leading-none">
            {weather.temperature !== undefined ? `${weather.temperature}°C` : '--'}
          </div>
          {weather.minTemperature !== undefined && weather.maxTemperature !== undefined && (
            <div className="text-[10px] text-slate-400 mt-1">
              H: {weather.maxTemperature}° / L: {weather.minTemperature}°
            </div>
          )}
        </div>
      </div>

      {/* Metrics Row: Humidity, Wind, Rain Probability */}
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5 text-xs text-slate-300">
        <div className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.03]">
          <Droplets className="w-4 h-4 text-sky-400 shrink-0" />
          <div>
            <div className="text-[10px] text-slate-400">Humidity</div>
            <div className="font-semibold text-white">{weather.humidity ?? 50}%</div>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.03]">
          <Wind className="w-4 h-4 text-emerald-400 shrink-0" />
          <div>
            <div className="text-[10px] text-slate-400">Wind</div>
            <div className="font-semibold text-white">{weather.windSpeed ?? 5} km/h</div>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.03]">
          <CloudRain className="w-4 h-4 text-indigo-400 shrink-0" />
          <div>
            <div className="text-[10px] text-slate-400">Precipitation</div>
            <div className="font-semibold text-white">{weather.rainProbability ?? 0}%</div>
          </div>
        </div>
      </div>

      {/* Travel Recommendations based on live weather */}
      {weather.recommendations && weather.recommendations.length > 0 && (
        <div className="p-3 rounded-xl bg-accent-500/10 border border-accent-500/20 flex items-start gap-2.5 text-xs text-slate-200 leading-relaxed">
          <Sparkles className="w-4 h-4 text-accent-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-accent-400">Weather Advisory: </span>
            {weather.recommendations.join(' ')}
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherCard;

