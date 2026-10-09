import React from 'react';

interface DateStripProps {
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (date: string) => void;
  daysCount?: number;
}

export const DateStrip: React.FC<DateStripProps> = ({
  selectedDate,
  onSelectDate,
  daysCount = 7
}) => {
  // Generate next 7 days starting from today
  const dates = Array.from({ length: daysCount }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNumber = d.getDate();
    const monthName = d.toLocaleDateString('en-US', { month: 'short' });
    const isToday = i === 0;

    return {
      dateStr,
      dayName,
      dayNumber,
      monthName,
      isToday
    };
  });

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none snap-x">
        {dates.map(d => {
          const isSelected = selectedDate === d.dateStr;

          return (
            <button
              key={d.dateStr}
              type="button"
              onClick={() => onSelectDate(d.dateStr)}
              className={`snap-start shrink-0 flex flex-col items-center justify-center p-3 w-20 rounded-2xl border transition-all duration-200 text-center ${
                isSelected
                  ? 'bg-[#0F4C5C] text-white border-[#0F4C5C] shadow-md shadow-[#0F4C5C]/15 scale-[1.02]'
                  : 'bg-white text-stone-700 border-stone-200 hover:border-stone-300 hover:bg-stone-50'
              }`}
            >
              <span className={`text-[11px] font-medium tracking-wide uppercase ${isSelected ? 'text-white/80' : 'text-stone-400'}`}>
                {d.isToday ? 'Today' : d.dayName}
              </span>
              <span className="text-xl font-bold font-serif-display my-0.5">
                {d.dayNumber}
              </span>
              <span className={`text-[11px] ${isSelected ? 'text-white/80' : 'text-stone-500'}`}>
                {d.monthName}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
