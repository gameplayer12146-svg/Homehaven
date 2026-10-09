import React from 'react';
import { Check } from 'lucide-react';

interface ProgressBarProps {
  currentStep: number;
  steps: string[];
  onStepClick?: (step: number) => void;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  currentStep,
  steps,
  onStepClick
}) => {
  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between relative">
        {/* Background track line */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-stone-200 -translate-y-1/2 z-0" />
        
        {/* Active track line */}
        <div
          className="absolute top-1/2 left-0 h-0.5 bg-[#0F4C5C] -translate-y-1/2 z-0 transition-all duration-300"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((title, idx) => {
          const stepNum = idx + 1;
          const isCompleted = stepNum < currentStep;
          const isCurrent = stepNum === currentStep;

          return (
            <div
              key={title}
              className="relative z-10 flex flex-col items-center"
            >
              <button
                type="button"
                disabled={!onStepClick || stepNum > currentStep}
                onClick={() => onStepClick && stepNum < currentStep && onStepClick(stepNum)}
                className={`w-9 h-9 rounded-full flex items-center justify-center font-medium text-xs transition-all duration-200 ${
                  isCompleted
                    ? 'bg-[#0F4C5C] text-white shadow-sm cursor-pointer'
                    : isCurrent
                    ? 'bg-[#E36414] text-white ring-4 ring-[#E36414]/20 shadow-sm'
                    : 'bg-white text-stone-400 border border-stone-200'
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4 stroke-[2.5]" /> : stepNum}
              </button>
              <span
                className={`text-xs mt-2 font-medium whitespace-nowrap transition-colors ${
                  isCurrent
                    ? 'text-[#0F4C5C] font-semibold'
                    : isCompleted
                    ? 'text-stone-700'
                    : 'text-stone-400'
                }`}
              >
                {title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
