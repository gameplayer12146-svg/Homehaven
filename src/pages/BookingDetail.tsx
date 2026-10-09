import React, { useState, useEffect } from 'react';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.js';
import { showToast } from '../hooks/useToast.js';
import { StatusTimeline } from '../components/booking/StatusTimeline.js';
import { PriceBreakdown } from '../components/ui/PriceBreakdown.js';
import { SkeletonCard } from '../components/ui/SkeletonCard.js';
import { formatDate, formatTimeSlot, formatCurrency } from '../utils/helpers.js';
import { ArrowLeft, MapPin, Calendar, Clock, Phone, ShieldCheck, Star, AlertTriangle, CheckCircle, Truck, Wrench } from 'lucide-react';

interface BookingDetailProps {
  bookingId: string;
  onNavigate: (tab: string, param?: any) => void;
}

export const BookingDetail: React.FC<BookingDetailProps> = ({ bookingId, onNavigate }) => {
  const { user } = useAuth();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchBooking = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/bookings/${bookingId}`);
      if (res.success) {
        setBooking(res.booking);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to load booking details', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooking();
  }, [bookingId]);

  const handleUpdateStatus = async (nextStatus: string, defaultNote?: string) => {
    setUpdating(true);
    try {
      const res = await api.patch(`/api/bookings/${bookingId}/status`, {
        status: nextStatus,
        note: defaultNote
      });
      if (res.success) {
        showToast(`Status updated to ${nextStatus.replace(/_/g, ' ')}!`, 'success');
        setBooking(res.booking);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to update status', 'error');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <SkeletonCard height="h-64" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <p className="text-sm text-stone-600">Booking not found or access denied.</p>
        <button
          onClick={() => onNavigate('my-bookings')}
          className="px-4 py-2 bg-[#0F4C5C] text-white rounded-xl text-xs font-semibold"
        >
          Back to Bookings
        </button>
      </div>
    );
  }

  const isProvider = user?.role === 'provider';
  const isAdmin = user?.role === 'admin';
  const isCustomer = user?.role === 'customer' || booking.customerId === user?._id;
  const canManageStatus = isProvider || isAdmin;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Back button */}
      <button
        type="button"
        onClick={() => onNavigate(isProvider ? 'provider-dashboard' : 'my-bookings')}
        className="text-xs font-semibold text-stone-500 hover:text-stone-800 flex items-center gap-1.5 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Bookings</span>
      </button>

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-[24px] border border-stone-200/90 shadow-2xs">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#0F4C5C]/10 text-3xl flex items-center justify-center">
            {booking.service?.icon || '🔧'}
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs text-stone-400">
              <span>Booking #{booking._id.slice(-6)}</span>
              <span aria-hidden="true">·</span>
              <span>Created {new Date(booking.createdAt).toLocaleDateString()}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-serif-display text-stone-900 mt-0.5">
              {booking.service?.name}
            </h1>
          </div>
        </div>

        {/* Live Status Controls for Specialist / Admin */}
        {canManageStatus && booking.status !== 'completed' && booking.status !== 'cancelled' && (
          <div className="flex items-center gap-2 flex-wrap">
            {booking.status === 'requested' && (
              <button
                type="button"
                disabled={updating}
                onClick={() => handleUpdateStatus('accepted', 'Specialist confirmed appointment')}
                className="px-4 py-2 bg-[#0F4C5C] text-white rounded-xl text-xs font-semibold hover:bg-[#0A3642] transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Accept Job</span>
              </button>
            )}

            {booking.status === 'accepted' && (
              <button
                type="button"
                disabled={updating}
                onClick={() => handleUpdateStatus('on_the_way', 'Technician dispatched with van & tools')}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Truck className="w-4 h-4" />
                <span>Mark On The Way</span>
              </button>
            )}

            {booking.status === 'on_the_way' && (
              <button
                type="button"
                disabled={updating}
                onClick={() => handleUpdateStatus('in_progress', 'Arrival on-site, beginning diagnostic checklist')}
                className="px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-semibold hover:bg-amber-700 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Wrench className="w-4 h-4" />
                <span>Start Service</span>
              </button>
            )}

            {booking.status === 'in_progress' && (
              <button
                type="button"
                disabled={updating}
                onClick={() => handleUpdateStatus('completed', 'Diagnostic test passed, work signed off by customer')}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Complete Job</span>
              </button>
            )}

            <button
              type="button"
              disabled={updating}
              onClick={() => handleUpdateStatus('cancelled', 'Booking cancelled by specialist/admin')}
              className="px-3 py-2 border border-rose-200 text-rose-600 rounded-xl text-xs font-semibold hover:bg-rose-50 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Main Grid: Status Timeline + Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Live Status Timeline */}
        <div className="lg:col-span-7 space-y-6">
          <StatusTimeline
            currentStatus={booking.status}
            timeline={booking.timeline || []}
          />

          {/* Problem Note from customer */}
          {booking.problemNote && (
            <div className="bg-white rounded-2xl border border-stone-200/90 p-5 space-y-2">
              <h4 className="text-xs font-semibold text-stone-700 uppercase tracking-wide">
                Customer Problem Notes
              </h4>
              <p className="text-xs text-stone-600 bg-stone-50 p-3 rounded-xl border border-stone-100 leading-relaxed italic">
                "{booking.problemNote}"
              </p>
            </div>
          )}

          {/* Completed Review if exists */}
          {booking.review && (
            <div className="bg-white rounded-2xl border border-stone-200/90 p-5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                <h4 className="text-xs font-semibold text-stone-900">Verified Customer Review</h4>
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span className="text-xs font-bold font-mono">{booking.review.rating} / 5</span>
                </div>
              </div>
              <p className="text-xs text-stone-600 italic">"{booking.review.comment}"</p>
              {booking.review.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {booking.review.tags.map((t: string) => (
                    <span key={t} className="text-[11px] px-2 py-0.5 rounded bg-stone-100 text-stone-600">
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Specialist Info & Price Breakdown */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Appointment Schedule & Location */}
          <div className="bg-white rounded-2xl border border-stone-200/90 p-5 space-y-3 text-xs">
            <h4 className="font-semibold text-stone-900 pb-2 border-b border-stone-100">
              Schedule & Location
            </h4>
            
            <div className="flex items-center gap-2.5 text-stone-700">
              <Calendar className="w-4 h-4 text-[#0F4C5C]" />
              <span>{formatDate(booking.date)}</span>
            </div>

            <div className="flex items-center gap-2.5 text-stone-700">
              <Clock className="w-4 h-4 text-[#0F4C5C]" />
              <span className="font-mono tabular-nums">{formatTimeSlot(booking.timeSlot)}</span>
            </div>

            <div className="flex items-start gap-2.5 text-stone-700">
              <MapPin className="w-4 h-4 text-[#0F4C5C] shrink-0 mt-0.5" />
              <div>
                <span className="font-medium text-stone-900 block">{booking.address?.label || 'Service Site'}</span>
                <span className="text-stone-500">{booking.address?.line}, {booking.address?.city} {booking.address?.pincode}</span>
              </div>
            </div>
          </div>

          {/* Specialist or Customer Contact Card */}
          <div className="bg-white rounded-2xl border border-stone-200/90 p-5 space-y-3">
            <h4 className="font-semibold text-stone-900 text-xs pb-2 border-b border-stone-100">
              {isProvider ? 'Client Details' : 'Assigned Specialist'}
            </h4>

            {isProvider ? (
              <div className="flex items-center gap-3">
                <img
                  src={booking.customer?.avatar}
                  alt={booking.customer?.name}
                  className="w-12 h-12 rounded-xl object-cover bg-stone-100 border border-stone-200"
                />
                <div>
                  <h5 className="font-semibold text-stone-900 text-sm">{booking.customer?.name}</h5>
                  <p className="text-xs text-stone-500">{booking.customer?.phone || 'Verified Phone'}</p>
                  <p className="text-[11px] text-stone-400">{booking.customer?.email}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <img
                  src={booking.provider?.user?.avatar}
                  alt={booking.provider?.user?.name}
                  className="w-12 h-12 rounded-xl object-cover bg-stone-100 border border-stone-200"
                />
                <div>
                  <h5 className="font-semibold text-stone-900 text-sm">{booking.provider?.user?.name}</h5>
                  <p className="text-xs text-stone-500">{booking.provider?.experience} yrs exp · {booking.provider?.rating} ★</p>
                  <p className="text-[11px] text-stone-400">{booking.provider?.user?.phone || 'Direct dispatch line'}</p>
                </div>
              </div>
            )}
          </div>

          {/* Transparent Price Breakdown */}
          <PriceBreakdown
            visitFee={booking.priceBreakdown?.visitFee || 25}
            estimate={booking.priceBreakdown?.estimate || 75}
            tax={booking.priceBreakdown?.tax || 8}
            total={booking.priceBreakdown?.total || 108}
            serviceName={booking.service?.name}
          />

        </div>

      </div>

    </div>
  );
};
