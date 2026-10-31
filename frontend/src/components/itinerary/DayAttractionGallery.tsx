import React from 'react';
import { Camera, MapPin } from 'lucide-react';
import { IActivity } from '@/types/itinerary.types';

interface DayAttractionGalleryProps {
  activities: IActivity[];
  dayNumber: number;
  onSelectAttraction?: (name: string) => void;
}

export const DayAttractionGallery: React.FC<DayAttractionGalleryProps> = ({
  activities,
  dayNumber,
  onSelectAttraction,
}) => {
  // Filter activities that have photos or valid names
  const itemsWithImages = activities.filter((act) => act.imageUrl || act.thumbUrl);

  // If no specific activity images are loaded yet, return null
  if (itemsWithImages.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-accent-400 flex items-center gap-1.5">
          <Camera className="w-3.5 h-3.5" /> Day {dayNumber} Visual Highlights
        </h4>
        <span className="text-[10px] text-slate-400">Photos powered by Unsplash</span>
      </div>

      <div className="flex items-stretch gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/10">
        {itemsWithImages.map((item, idx) => {
          const imgUrl = item.thumbUrl || item.imageUrl;
          return (
            <div
              key={idx}
              onClick={() => onSelectAttraction?.(item.name)}
              className="min-w-[200px] max-w-[220px] rounded-2xl glass-card border border-white/10 overflow-hidden shrink-0 group cursor-pointer transition-all hover:scale-[1.02] hover:border-white/20 shadow-lg flex flex-col justify-between"
            >
              {/* Photo Container */}
              <div className="h-28 w-full relative overflow-hidden bg-navy-950/60">
                <img
                  src={imgUrl}
                  alt={item.name}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  onError={(e) => {
                    // Fallback to high quality travel placeholder if link fails
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=400&auto=format&fit=crop';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-transparent to-black/20" />

                {/* Time or Slot Badge */}
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-bold bg-navy-950/80 backdrop-blur-md text-accent-400 border border-white/10">
                  {item.time || item.timeOfDay || 'Scheduled'}
                </div>

                {/* Unsplash Attribution Pill */}
                {item.imagePhotographer && (
                  <div className="absolute bottom-1 right-2 text-[8px] text-white/70 bg-black/40 px-1.5 py-0.5 rounded backdrop-blur-sm truncate max-w-[150px]">
                    Photo by {item.imagePhotographer}
                  </div>
                )}
              </div>

              {/* Information Body */}
              <div className="p-3 space-y-1">
                <div className="text-xs font-bold text-white group-hover:text-accent-400 transition-colors line-clamp-1">
                  {item.name}
                </div>
                {item.description && (
                  <div className="text-[10px] text-slate-300 line-clamp-2 leading-relaxed">
                    {item.description}
                  </div>
                )}
                <div className="flex items-center justify-between pt-1.5 text-[10px] text-slate-400 border-t border-white/5">
                  <span>{item.duration || '2 hrs'}</span>
                  <span className="flex items-center gap-0.5 text-accent-400 font-semibold group-hover:underline">
                    <MapPin className="w-2.5 h-2.5" /> View
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DayAttractionGallery;
