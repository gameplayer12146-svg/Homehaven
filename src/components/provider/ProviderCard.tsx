import React from 'react';
import { Star, Shield, Award, CheckCircle, MapPin, Calendar } from 'lucide-react';
import { formatTimeSlot, formatCurrency } from '../../utils/helpers.js';

interface ProviderCardProps {
  provider: {
    _id: string;
    userId: string;
    experience: number;
    rating: number;
    reviewCount: number;
    jobsDone: number;
    trustScore: number;
    availability: {
      days: number[];
      slots: string[];
    };
    city: string;
    bio: string;
    user?: {
      name: string;
      avatar: string;
      phone?: string;
    } | null;
    serviceDetails?: Array<{
      _id: string;
      name: string;
      basePrice: number;
      category: string;
    }>;
  };
  selected?: boolean;
  onSelect?: () => void;
  onBookNow?: () => void;
  showBookButton?: boolean;
}

export const ProviderCard: React.FC<ProviderCardProps> = ({
  provider,
  selected = false,
  onSelect,
  onBookNow,
  showBookButton = true
}) => {
  const name = provider.user?.name || 'Verified Specialist';
  const avatar = provider.user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${provider._id}`;

  return (
    <div
      onClick={onSelect}
      className={`bg-white rounded-[20px] p-6 border transition-all duration-200 flex flex-col justify-between ${
        selected
          ? 'border-[#0F4C5C] ring-2 ring-[#0F4C5C]/20 shadow-md'
          : 'border-stone-200/80 shadow-xs hover:border-stone-300 hover:shadow-md'
      } ${onSelect ? 'cursor-pointer' : ''}`}
    >
      <div>
        {/* Top Header: Avatar + Name + Rating */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <img
                src={avatar}
                alt={name}
                referrerPolicy="no-referrer"
                className="w-14 h-14 rounded-2xl object-cover border border-stone-200/60 bg-stone-100"
              />
              <div
                title="Identity & Background Verified"
                className="absolute -bottom-1 -right-1 bg-[#0F4C5C] text-white p-1 rounded-full shadow-xs"
              >
                <CheckCircle className="w-3 h-3 stroke-[3]" />
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-stone-900 text-base leading-tight">
                {name}
              </h3>
              {/* Unboxed metadata with typographic dot separators */}
              <div className="flex items-center gap-2 text-xs text-stone-500 mt-1">
                <span className="flex items-center gap-1 text-stone-700 font-medium">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="font-mono tabular-nums">{provider.rating.toFixed(1)}</span>
                  <span className="text-stone-400">({provider.reviewCount})</span>
                </span>
                <span aria-hidden="true" className="text-stone-300">·</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-stone-400" />
                  {provider.city}
                </span>
              </div>
            </div>
          </div>

          {/* Trust Score Box */}
          <div className="text-right shrink-0">
            <div className="flex items-center gap-1 justify-end text-xs font-semibold text-[#0F4C5C]">
              <Shield className="w-3.5 h-3.5" />
              <span className="font-mono tabular-nums">{provider.trustScore}%</span>
            </div>
            <span className="text-[10px] text-stone-400 uppercase tracking-wider block">Trust Score</span>
          </div>
        </div>

        {/* Bio */}
        <p className="text-xs text-stone-600 mt-3.5 line-clamp-2 leading-relaxed">
          {provider.bio}
        </p>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 gap-2 mt-4 p-3 bg-stone-50/70 rounded-xl border border-stone-100 text-xs">
          <div>
            <span className="text-[11px] text-stone-400 block">Experience</span>
            <span className="font-semibold text-stone-800 font-mono tabular-nums">
              {provider.experience} years
            </span>
          </div>
          <div>
            <span className="text-[11px] text-stone-400 block">Jobs Finished</span>
            <span className="font-semibold text-stone-800 font-mono tabular-nums">
              {provider.jobsDone}+ verified
            </span>
          </div>
        </div>

        {/* Available Today Slots Preview */}
        {provider.availability?.slots?.length > 0 && (
          <div className="mt-3.5 text-xs">
            <span className="text-[11px] text-stone-400 font-medium flex items-center gap-1 mb-1.5">
              <Calendar className="w-3 h-3" />
              Standard Daily Slots:
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {provider.availability.slots.slice(0, 4).map(slot => (
                <span
                  key={slot}
                  className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 text-[11px] font-mono tabular-nums"
                >
                  {formatTimeSlot(slot)}
                </span>
              ))}
              {provider.availability.slots.length > 4 && (
                <span className="text-[11px] text-stone-400">+{provider.availability.slots.length - 4} more</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer / CTA */}
      <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between gap-3">
        {provider.serviceDetails && provider.serviceDetails.length > 0 ? (
          <div>
            <span className="text-[11px] text-stone-400 block">Starting from</span>
            <span className="text-base font-bold text-[#0F4C5C] font-mono tabular-nums">
              {formatCurrency(Math.min(...provider.serviceDetails.map(s => s.basePrice)))}
            </span>
          </div>
        ) : (
          <div />
        )}

        {showBookButton && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onBookNow) onBookNow();
              else if (onSelect) onSelect();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              selected
                ? 'bg-[#0F4C5C] text-white shadow-sm'
                : 'bg-stone-900 text-white hover:bg-[#0F4C5C]'
            }`}
          >
            {selected ? 'Selected Specialist' : 'Select Specialist'}
          </button>
        )}
      </div>
    </div>
  );
};
