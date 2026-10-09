import React from 'react';
import { formatDate, formatTimeSlot, STATUS_LABELS } from '../../utils/helpers.js';
import { Check, Clock, Truck, Wrench, CheckCircle2, XCircle } from 'lucide-react';

interface TimelineItem {
  status: string;
  at: string;
  note?: string;
}

interface StatusTimelineProps {
  currentStatus: string;
  timeline: TimelineItem[];
}

export const StatusTimeline: React.FC<StatusTimelineProps> = ({
  currentStatus,
  timeline
}) => {
  const steps = [
    { key: 'requested', label: 'Requested', icon: Clock },
    { key: 'accepted', label: 'Accepted by Specialist', icon: Check },
    { key: 'on_the_way', label: 'On The Way', icon: Truck },
    { key: 'in_progress', label: 'In Progress', icon: Wrench },
    { key: 'completed', label: 'Job Completed', icon: CheckCircle2 }
  ];

  const isCancelled = currentStatus === 'cancelled';
  const currentStepIndex = steps.findIndex(s => s.key === currentStatus);

  return (
    <div className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-xs">
      <div className="flex items-center justify-between pb-4 border-b border-stone-100">
        <div>
          <h3 className="font-semibold text-stone-900 text-sm">Live Service Timeline</h3>
          <p className="text-xs text-stone-500 mt-0.5">Real-time milestones from dispatch to sign-off</p>
        </div>
        {isCancelled ? (
          <span className="flex items-center gap-1.5 text-xs text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg font-medium border border-rose-200">
            <XCircle className="w-3.5 h-3.5" />
            Cancelled
          </span>
        ) : (
          <span className="text-xs text-[#0F4C5C] bg-[#0F4C5C]/10 px-2.5 py-1 rounded-lg font-medium">
            {STATUS_LABELS[currentStatus]?.label || currentStatus}
          </span>
        )}
      </div>

      <div className="mt-6 relative">
        <div className="space-y-6">
          {steps.map((step, idx) => {
            const historyEntry = timeline.find(t => t.status === step.key);
            const isCompleted = !isCancelled && (idx <= currentStepIndex || Boolean(historyEntry));
            const isCurrent = !isCancelled && (step.key === currentStatus);
            const Icon = step.icon;

            return (
              <div key={step.key} className="flex items-start gap-4 relative">
                {/* Connecting Vertical Line */}
                {idx < steps.length - 1 && (
                  <div
                    className={`absolute top-8 left-4 w-0.5 -bottom-4 -translate-x-1/2 transition-colors ${
                      isCompleted && idx < currentStepIndex ? 'bg-[#0F4C5C]' : 'bg-stone-200'
                    }`}
                  />
                )}

                {/* Node Circle */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 transition-all ${
                    isCurrent
                      ? 'bg-[#E36414] text-white ring-4 ring-[#E36414]/20 shadow-xs'
                      : isCompleted
                      ? 'bg-[#0F4C5C] text-white shadow-xs'
                      : 'bg-stone-100 text-stone-400 border border-stone-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                {/* Step Info */}
                <div className="flex-1 pt-0.5">
                  <div className="flex items-center justify-between gap-2">
                    <h4
                      className={`text-sm font-semibold ${
                        isCurrent
                          ? 'text-[#E36414]'
                          : isCompleted
                          ? 'text-stone-900'
                          : 'text-stone-400'
                      }`}
                    >
                      {step.label}
                    </h4>
                    {historyEntry?.at && (
                      <span className="text-[11px] text-stone-400 font-mono tabular-nums">
                        {new Date(historyEntry.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>

                  {historyEntry?.note ? (
                    <p className="text-xs text-stone-600 mt-1 bg-stone-50 p-2.5 rounded-xl border border-stone-100 leading-relaxed">
                      {historyEntry.note}
                    </p>
                  ) : isCurrent ? (
                    <p className="text-xs text-stone-500 mt-0.5">
                      {STATUS_LABELS[step.key]?.desc}
                    </p>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>

        {isCancelled && (
          <div className="mt-6 pt-4 border-t border-rose-100 flex items-center gap-3 text-rose-800 text-xs bg-rose-50/50 p-3 rounded-xl">
            <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <span className="font-semibold block">Booking Cancelled</span>
              <span className="text-rose-600/90 text-[11px]">
                {timeline.find(t => t.status === 'cancelled')?.note || 'This visit was cancelled and will not take place.'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
