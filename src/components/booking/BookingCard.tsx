import React from 'react';
import { formatCurrency, formatDate, formatTimeSlot, STATUS_LABELS } from '../../utils/helpers.js';
import { Calendar, Clock, MapPin, ChevronRight, MessageSquare, AlertCircle } from 'lucide-react';

interface BookingCardProps {
  booking: any;
  onViewDetails: (id: string) => void;
  onReschedule?: (id: string) => void;
  onCancel?: (id: string) => void;
  onWriteReview?: (booking: any) => void;
  isProviderView?: boolean;
}

export const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  onViewDetails,
  onReschedule,
  onCancel,
  onWriteReview,
  isProviderView = false
}) => {
  const statusInfo = STATUS_LABELS[booking.status] || {
    label: booking.status,
    color: 'text-stone-700 bg-stone-100 border-stone-200'
  };

  const isCompleted = booking.status === 'completed';
  const isCancelled = booking.status === 'cancelled';
  const canModify = !isCompleted && !isCancelled;

  const otherPersonName = isProviderView
    ? (booking.customer?.name || 'Customer')
    : (booking.provider?.user?.name || 'Specialist');

  const otherPersonAvatar = isProviderView
    ? (booking.customer?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${otherPersonName}`)
    : (booking.provider?.user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${otherPersonName}`);

  return (
    <div className="bg-white rounded-[20px] p-5 md:p-6 border border-stone-200/80 shadow-xs hover:border-stone-300 hover:shadow-md transition-all duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0F4C5C]/10 text-[#0F4C5C] flex items-center justify-center text-xl shrink-0">
            {booking.service?.icon || '🛠️'}
          </div>
          <div>
            <h4 className="font-semibold text-stone-900 text-sm md:text-base leading-tight">
              {booking.service?.name || 'Home Service'}
            </h4>
            <div className="flex items-center gap-2 text-xs text-stone-500 mt-0.5">
              <span>{isProviderView ? 'Customer:' : 'Specialist:'} <strong>{otherPersonName}</strong></span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums text-stone-400">#{booking._id.slice(-6)}</span>
            </div>
          </div>
        </div>

        {/* Status indicator */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${statusInfo.color}`}>
            {statusInfo.label}
          </span>
        </div>
      </div>

      {/* Date & Location Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 py-4 text-xs text-stone-600">
        <div className="flex items-center gap-2 bg-stone-50/80 p-2.5 rounded-xl border border-stone-100">
          <Calendar className="w-4 h-4 text-[#0F4C5C] shrink-0" />
          <div>
            <span className="text-[10px] text-stone-400 block uppercase">Scheduled Date</span>
            <span className="font-medium text-stone-800">{formatDate(booking.date)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-stone-50/80 p-2.5 rounded-xl border border-stone-100">
          <Clock className="w-4 h-4 text-[#0F4C5C] shrink-0" />
          <div>
            <span className="text-[10px] text-stone-400 block uppercase">Time Slot</span>
            <span className="font-medium text-stone-800 font-mono tabular-nums">{formatTimeSlot(booking.timeSlot)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-stone-50/80 p-2.5 rounded-xl border border-stone-100">
          <MapPin className="w-4 h-4 text-[#0F4C5C] shrink-0" />
          <div className="truncate">
            <span className="text-[10px] text-stone-400 block uppercase">Service Address</span>
            <span className="font-medium text-stone-800 truncate block">
              {booking.address?.line || booking.address?.city || 'On-site'}
            </span>
          </div>
        </div>
      </div>

      {/* Problem note snippet */}
      {booking.problemNote && (
        <div className="text-xs text-stone-500 bg-stone-50/50 p-2.5 rounded-xl border border-stone-100 mb-4 line-clamp-1 italic">
          "{booking.problemNote}"
        </div>
      )}

      {/* Actions and Price Footer */}
      <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-[11px] text-stone-400 block">Total Cost</span>
          <span className="text-base font-bold font-serif-display text-[#0F4C5C] font-mono tabular-nums">
            {formatCurrency(booking.priceBreakdown?.total || 0)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {canModify && onReschedule && (
            <button
              type="button"
              onClick={() => onReschedule(booking._id)}
              className="px-3 py-1.5 rounded-lg border border-stone-200 text-stone-700 hover:bg-stone-50 text-xs font-medium transition-colors"
            >
              Reschedule
            </button>
          )}

          {canModify && onCancel && (
            <button
              type="button"
              onClick={() => onCancel(booking._id)}
              className="px-3 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-medium transition-colors"
            >
              Cancel
            </button>
          )}

          {isCompleted && !booking.review && onWriteReview && !isProviderView && (
            <button
              type="button"
              onClick={() => onWriteReview(booking)}
              className="px-3 py-1.5 rounded-lg bg-[#E36414] text-white hover:bg-[#C5530E] text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Leave Review</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onViewDetails(booking._id)}
            className="px-3.5 py-1.5 rounded-lg bg-[#0F4C5C] text-white hover:bg-[#0A3642] text-xs font-medium transition-colors flex items-center gap-1"
          >
            <span>View Details</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
