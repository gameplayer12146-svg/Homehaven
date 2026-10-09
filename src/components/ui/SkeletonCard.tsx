import React from 'react';

export const SkeletonCard: React.FC<{ lines?: number; height?: string }> = ({
  lines = 3,
  height = 'h-48'
}) => {
  return (
    <div className={`bg-white/80 rounded-[20px] p-6 border border-stone-200/70 shadow-sm animate-pulse flex flex-col justify-between ${height}`}>
      <div className="space-y-3">
        <div className="h-6 bg-stone-200 rounded-md w-3/4"></div>
        <div className="h-4 bg-stone-100 rounded-md w-1/2"></div>
      </div>
      <div className="space-y-2 pt-4">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="h-3 bg-stone-100 rounded"
            style={{ width: `${85 - i * 15}%` }}
          ></div>
        ))}
      </div>
      <div className="pt-4 flex justify-between items-center border-t border-stone-100">
        <div className="h-5 bg-stone-200 rounded w-20"></div>
        <div className="h-8 bg-stone-200 rounded-lg w-28"></div>
      </div>
    </div>
  );
};
