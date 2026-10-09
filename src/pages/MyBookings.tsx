import React, { useState, useEffect } from 'react';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.js';
import { showToast } from '../hooks/useToast.js';
import { BookingCard } from '../components/booking/BookingCard.js';
import { SkeletonCard } from '../components/ui/SkeletonCard.js';
import { DateStrip } from '../components/ui/DateStrip.js';
import { TimeSlotChips } from '../components/ui/TimeSlotChips.js';
import { Calendar, MessageSquare, Star, X, Check, AlertCircle } from 'lucide-react';

interface MyBookingsProps {
  onNavigate: (tab: string, param?: any) => void;
}

export const MyBookings: React.FC<MyBookingsProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all');

  // Review modal state
  const [reviewModalBooking, setReviewModalBooking] = useState<any | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [reviewSubmitting, setReviewSubmitting] = useState<boolean>(false);

  // Reschedule modal state
  const [rescheduleBooking, setRescheduleBooking] = useState<any | null>(null);
  const [newDate, setNewDate] = useState<string>('');
  const [newSlot, setNewSlot] = useState<string>('');
  const [rescheduleSubmitting, setRescheduleSubmitting] = useState<boolean>(false);

  const availableTags = [
    'punctual', 'clean work', 'expert diagnosis', 'fair pricing',
    'friendly', 'thorough', 'fast repair', 'knowledgeable', 'craftsmanship'
  ];

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/bookings/mine');
      if (res.success) {
        setBookings(res.bookings || []);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to load bookings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel this booking appointment?')) return;
    try {
      const res = await api.patch(`/api/bookings/${id}/cancel`, {
        status: 'cancelled',
        note: 'Cancelled by customer'
      });
      if (res.success) {
        showToast('Booking cancelled.', 'info');
        fetchBookings();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to cancel', 'error');
    }
  };

  const handleOpenReschedule = (id: string) => {
    const target = bookings.find(b => b._id === id);
    if (target) {
      setRescheduleBooking(target);
      setNewDate(target.date);
      setNewSlot(target.timeSlot);
    }
  };

  const handleConfirmReschedule = async () => {
    if (!newDate || !newSlot) {
      showToast('Please select both a date and a time slot', 'error');
      return;
    }
    setRescheduleSubmitting(true);
    try {
      const res = await api.patch(`/api/bookings/${rescheduleBooking._id}/reschedule`, {
        date: newDate,
        timeSlot: newSlot
      });
      if (res.success) {
        showToast('Appointment rescheduled successfully!', 'success');
        setRescheduleBooking(null);
        fetchBookings();
      }
    } catch (err: any) {
      showToast(err.message || 'Slot conflict or error', 'error');
    } finally {
      setRescheduleSubmitting(false);
    }
  };

  const handleOpenReview = (booking: any) => {
    setReviewModalBooking(booking);
    setRating(5);
    setComment('');
    setSelectedTags(['punctual', 'clean work']);
  };

  const handleSubmitReview = async () => {
    if (!reviewModalBooking) return;
    setReviewSubmitting(true);
    try {
      const res = await api.post('/api/reviews', {
        bookingId: reviewModalBooking._id,
        rating,
        tags: selectedTags,
        comment
      });
      if (res.success) {
        showToast('Review submitted! Thank you for supporting local specialists.', 'success');
        setReviewModalBooking(null);
        fetchBookings();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to submit review', 'error');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const filteredBookings = bookings.filter(b => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'active') return ['requested', 'accepted', 'on_the_way', 'in_progress'].includes(b.status);
    if (statusFilter === 'completed') return b.status === 'completed';
    if (statusFilter === 'cancelled') return b.status === 'cancelled';
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-[#0F4C5C] uppercase tracking-wider">
            Booking Records
          </span>
          <h1 className="text-3xl font-bold font-serif-display text-stone-900 mt-1">
            My Appointments
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Track live dispatch statuses, schedule changes, and completed service invoices.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('book')}
          className="px-4 py-2 bg-[#0F4C5C] hover:bg-[#0A3642] text-white rounded-xl text-xs font-semibold transition-all shadow-xs self-start sm:self-auto cursor-pointer"
        >
          Book Another Service
        </button>
      </div>

      {/* Filter Tabs (Functional segmented buttons) */}
      <div className="flex p-1 bg-stone-100 rounded-xl max-w-md">
        {[
          { id: 'all', label: 'All Bookings' },
          { id: 'active', label: 'Active Visits' },
          { id: 'completed', label: 'Completed' },
          { id: 'cancelled', label: 'Cancelled' }
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setStatusFilter(tab.id as any)}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              statusFilter === tab.id
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-4">
          <SkeletonCard height="h-44" />
          <SkeletonCard height="h-44" />
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-stone-200 space-y-3">
          <p className="text-sm text-stone-600">No bookings found in this view.</p>
          <button
            type="button"
            onClick={() => onNavigate('book')}
            className="px-4 py-2 bg-[#0F4C5C] text-white rounded-xl text-xs font-semibold"
          >
            Schedule a Service
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map(b => (
            <BookingCard
              key={b._id}
              booking={b}
              onViewDetails={id => onNavigate('booking-detail', id)}
              onReschedule={handleOpenReschedule}
              onCancel={handleCancelBooking}
              onWriteReview={handleOpenReview}
              isProviderView={user?.role === 'provider'}
            />
          ))}
        </div>
      )}

      {/* RESCHEDULE MODAL */}
      {rescheduleBooking && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] max-w-lg w-full p-6 space-y-5 border border-stone-200 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="text-base font-bold font-serif-display text-stone-900">
                Reschedule Service Visit
              </h3>
              <button
                onClick={() => setRescheduleBooking(null)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-stone-600">
              Change date & time for <strong>{rescheduleBooking.service?.name}</strong> with <strong>{rescheduleBooking.provider?.user?.name}</strong>.
            </p>

            <div className="space-y-3">
              <label className="text-xs font-semibold text-stone-700 block">Select New Date:</label>
              <DateStrip
                selectedDate={newDate}
                onSelectDate={d => {
                  setNewDate(d);
                  setNewSlot('');
                }}
              />
            </div>

            <div className="space-y-2 pt-2">
              <label className="text-xs font-semibold text-stone-700 block">Select New Time Slot:</label>
              <TimeSlotChips
                slots={rescheduleBooking.provider?.availability?.slots || ['09:00', '11:00', '14:00', '16:00']}
                selectedSlot={newSlot}
                onSelectSlot={s => setNewSlot(s)}
              />
            </div>

            <div className="pt-4 border-t border-stone-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRescheduleBooking(null)}
                className="px-4 py-2 border border-stone-200 rounded-xl text-xs font-semibold text-stone-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReschedule}
                disabled={rescheduleSubmitting || !newDate || !newSlot}
                className="px-5 py-2 bg-[#0F4C5C] hover:bg-[#0A3642] text-white rounded-xl text-xs font-semibold disabled:opacity-50"
              >
                {rescheduleSubmitting ? 'Updating...' : 'Confirm Reschedule'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REVIEW MODAL */}
      {reviewModalBooking && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] max-w-lg w-full p-6 space-y-5 border border-stone-200 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <h3 className="text-base font-bold font-serif-display text-stone-900">
                  Rate & Review Specialist
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  {reviewModalBooking.service?.name} · {reviewModalBooking.provider?.user?.name}
                </p>
              </div>
              <button
                onClick={() => setReviewModalBooking(null)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Star Rating Selector */}
            <div className="space-y-2 text-center py-2 bg-stone-50 rounded-2xl border border-stone-100">
              <span className="text-xs font-semibold text-stone-600 block">Overall Experience</span>
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        star <= rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-stone-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <span className="text-xs font-medium text-stone-500 font-mono">
                {rating} / 5 Stars
              </span>
            </div>

            {/* Praise Tags */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-stone-700 block">What stood out?</span>
              <div className="flex flex-wrap gap-1.5">
                {availableTags.map(tag => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        if (isSelected) setSelectedTags(selectedTags.filter(t => t !== tag));
                        else setSelectedTags([...selectedTags, tag]);
                      }}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                        isSelected
                          ? 'bg-[#0F4C5C] text-white border-[#0F4C5C]'
                          : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Feedback Comment */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700 block">Your Review Comment</label>
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                rows={3}
                placeholder="Share your experience to help other homeowners..."
                className="w-full text-xs p-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-[#0F4C5C]"
              />
            </div>

            <div className="pt-4 border-t border-stone-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setReviewModalBooking(null)}
                className="px-4 py-2 border border-stone-200 rounded-xl text-xs font-semibold text-stone-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitReview}
                disabled={reviewSubmitting}
                className="px-5 py-2 bg-[#E36414] hover:bg-[#C5530E] text-white rounded-xl text-xs font-semibold disabled:opacity-50"
              >
                {reviewSubmitting ? 'Posting...' : 'Post Verified Review'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
