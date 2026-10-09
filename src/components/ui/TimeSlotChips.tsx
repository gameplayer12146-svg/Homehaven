import React from 'react';
import { formatTimeSlot } from '../../utils/helpers.js';
import { Clock } from 'lucide-react';

interface TimeSlotChipsProps {
  slots: string[];
  bookedSlots?: string[];
  selectedSlot: string;
  onSelectSlot: (slot: string) => void;
}

export const TimeSlotChips: React.FC<TimeSlotChipsProps> = ({
  slots,
  bookedSlots = [],
  selectedSlot,
  onSelectSlot
}) => {
  if (!slots || slots.length === 0) {
    return (
      <div className="p-4 bg-stone-100 rounded-xl text-stone-500 text-sm text-center">
        No scheduled time slots for this date. Please pick another day.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
      {slots.map(slot => {
        const isBooked = bookedSlots.includes(slot);
        const isSelected = selectedSlot === slot;

        return (
          <button
            key={slot}
            type="button"
            disabled={isBooked}
            onClick={() => !isBooked && onSelectSlot(slot)}
            className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl border text-xs font-medium transition-all duration-150 ${
              isBooked
                ? 'bg-stone-100/80 text-stone-400 border-stone-200/60 cursor-not-allowed line-through'
                : isSelected
                ? 'bg-[#E36414] text-white border-[#E36414] shadow-sm shadow-[#E36414]/20 ring-2 ring-[#E36414]/20 font-semibold'
                : 'bg-white text-stone-700 border-stone-200 hover:border-[#0F4C5C]/50 hover:bg-stone-50/70'
            }`}
          >
            <Clock className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : isBooked ? 'text-stone-300' : 'text-stone-400'}`} />
            <span>{formatTimeSlot(slot)}</span>
            {isBooked && <span className="text-[10px] uppercase tracking-wider text-stone-400 no-underline">(Booked)</span>}
          </button>
        );
      })}
    </div>
  );
};
