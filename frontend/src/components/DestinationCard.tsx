import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, ArrowUpRight, Star } from 'lucide-react';
import { Badge } from './ui/Badge';

export interface DestinationCardProps {
  id: string;
  name: string;
  country: string;
  image: string;
  tagline: string;
  rating?: number;
  category?: string;
  startingPrice?: string;
  onSelect?: (id: string) => void;
}

export const DestinationCard: React.FC<DestinationCardProps> = ({
  id,
  name,
  country,
  image,
  tagline,
  rating = 4.9,
  category = 'Top Pick',
  startingPrice = '$1,200',
  onSelect,
}) => {
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="group relative rounded-2xl overflow-hidden glass-card border border-white/10 shadow-xl cursor-pointer flex flex-col h-[420px]"
      onClick={() => onSelect?.(id)}
    >
      {/* Background Image with Gradient Overlay */}
      <div className="relative w-full h-3/5 overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/40 to-transparent" />
        
        {/* Floating Badges */}
        <div className="absolute top-4 left-4 flex gap-2">
          <Badge variant="neutral" className="bg-navy-950/70 backdrop-blur-md border border-white/20 text-white font-medium text-xs">
            {category}
          </Badge>
        </div>

        <div className="absolute top-4 right-4 bg-navy-950/80 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1 border border-white/10 text-xs text-amber-400 font-semibold">
          <Star className="w-3.5 h-3.5 fill-amber-400" />
          <span>{rating}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between bg-navy-950/90 backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-1.5 text-accent-400 text-xs font-semibold uppercase tracking-wider mb-1.5">
            <MapPin className="w-3.5 h-3.5" />
            <span>{country}</span>
          </div>
          <h3 className="text-xl font-serif font-bold text-white group-hover:text-accent-400 transition-colors">
            {name}
          </h3>
          <p className="text-slate-400 text-xs mt-1.5 line-clamp-2 leading-relaxed">
            {tagline}
          </p>
        </div>

        {/* Footer info & CTA */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block">From</span>
            <span className="text-sm font-semibold text-white">{startingPrice}</span>
          </div>
          <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white group-hover:bg-accent-500 group-hover:border-accent-500 transition-all duration-300">
            <ArrowUpRight className="w-4 h-4 group-hover:rotate-45 transition-transform" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DestinationCard;

