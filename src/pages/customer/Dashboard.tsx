import React, { useState, useEffect } from 'react';
import { api } from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.js';
import { BookingCard } from '../../components/booking/BookingCard.js';
import { SkeletonCard } from '../../components/ui/SkeletonCard.js';
import { formatDate, formatTimeSlot, formatCurrency, STATUS_LABELS } from '../../utils/helpers.js';
import { Calendar, CheckCircle2, Clock, MapPin, ArrowRight, Wrench, Shield, ChevronRight, Edit3, Check, UserCheck } from 'lucide-react';

interface CustomerDashboardProps {
  onNavigate: (tab: string, param?: any) => void;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ onNavigate }) => {
  const { user, rememberedName, updateRememberedName } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditingName, setIsEditingName] = useState(false);
  const [customNameInput, setCustomNameInput] = useState('');

  // Active user name: user.name if logged in, else rememberedName
  const displayName = user?.name || rememberedName || 'Ananya Iyer';

  const handleSaveName = () => {
    if (customNameInput.trim()) {
      updateRememberedName(customNameInput.trim());
      setIsEditingName(false);
    }
  };

  const handleQuickNameSelect = (name: string) => {
    updateRememberedName(name);
    setCustomNameInput(name);
    setIsEditingName(false);
  };

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [bookRes, srvRes] = await Promise.all([
          api.get('/api/bookings/mine'),
          api.get('/api/services')
        ]);
        if (bookRes.success) setBookings(bookRes.bookings || []);
        if (srvRes.success) setServices(srvRes.services || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const activeBookings = bookings.filter(b => ['requested', 'accepted', 'on_the_way', 'in_progress'].includes(b.status));
  const completedBookings = bookings.filter(b => b.status === 'completed');
  const upcomingBooking = activeBookings[0] || null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Welcome Banner */}
      <div className="bg-white rounded-[26px] p-6 sm:p-8 border border-stone-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#0F4C5C] uppercase tracking-wider">
              Customer Hub
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
              Session Profile Active
            </span>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={customNameInput}
                  onChange={e => setCustomNameInput(e.target.value)}
                  placeholder="Enter your name"
                  autoFocus
                  onKeyDown={e => e.key === 'Enter' && handleSaveName()}
                  className="text-xl sm:text-2xl font-bold font-serif-display text-stone-900 border-b-2 border-[#0F4C5C] bg-stone-50 px-2 py-0.5 rounded-lg focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleSaveName}
                  className="p-1.5 rounded-xl bg-[#0F4C5C] text-white hover:bg-[#0A3642] cursor-pointer"
                  title="Save Name"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-bold font-serif-display text-stone-900">
                  Namaste, {displayName}!
                </h1>
                <button
                  type="button"
                  onClick={() => {
                    setCustomNameInput(displayName);
                    setIsEditingName(true);
                  }}
                  className="p-1 text-stone-400 hover:text-[#0F4C5C] hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                  title="Change remembered name"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Quick Indian Name Switchers */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            <span className="text-[11px] text-stone-400 flex items-center gap-1">
              <UserCheck className="w-3 h-3 text-[#0F4C5C]" />
              Quick switch:
            </span>
            {['Ananya Iyer', 'Rohan Verma', 'Pooja Sharma', 'Arjun Reddy'].map(name => (
              <button
                key={name}
                type="button"
                onClick={() => handleQuickNameSelect(name)}
                className={`text-[11px] px-2.5 py-0.5 rounded-full border transition-all cursor-pointer ${
                  displayName === name
                    ? 'bg-[#0F4C5C] text-white border-[#0F4C5C] font-semibold'
                    : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                }`}
              >
                {name}
              </button>
            ))}
          </div>

          <p className="text-xs text-stone-500 pt-0.5 max-w-lg">
            Manage your doorstep service bookings, live technician status, and property service records.
          </p>
        </div>

        <div
          onClick={() => onNavigate('book')}
          className="group cursor-pointer px-5 py-3.5 bg-[#0F4C5C] hover:bg-[#0A3642] text-white rounded-2xl text-xs font-semibold transition-all shadow-md flex items-center gap-2.5 self-start md:self-auto hover:shadow-lg"
        >
          <Wrench className="w-4 h-4 group-hover:rotate-45 transition-transform" />
          <span>Book a Technician</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>

      {/* Interactive Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => onNavigate('my-bookings')}
          className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-2xs hover:border-[#0F4C5C] hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-500 font-medium">Active Visits</span>
            <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-[#0F4C5C] group-hover:translate-x-1 transition-all" />
          </div>
          <span className="text-3xl font-bold font-serif-display text-[#0F4C5C] font-mono tabular-nums mt-1 block">
            {activeBookings.length}
          </span>
          <span className="text-[11px] text-stone-400 mt-1 block">Technician scheduled or en route</span>
        </div>

        <div
          onClick={() => onNavigate('my-bookings')}
          className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-2xs hover:border-[#0F4C5C] hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-500 font-medium">Completed Jobs</span>
            <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-[#0F4C5C] group-hover:translate-x-1 transition-all" />
          </div>
          <span className="text-3xl font-bold font-serif-display text-emerald-700 font-mono tabular-nums mt-1 block">
            {completedBookings.length}
          </span>
          <span className="text-[11px] text-stone-400 mt-1 block">Service warranties active</span>
        </div>

        <div
          onClick={() => onNavigate('home-profile')}
          className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-2xs hover:border-[#0F4C5C] hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-500 font-medium">Saved Addresses</span>
            <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-[#0F4C5C] group-hover:translate-x-1 transition-all" />
          </div>
          <span className="text-3xl font-bold font-serif-display text-[#E36414] font-mono tabular-nums mt-1 block">
            {user?.addresses?.length || 2}
          </span>
          <span className="text-[11px] text-stone-400 mt-1 block">In your Home Profile dossier</span>
        </div>
      </div>

      {/* Upcoming Booking Interactive Banner */}
      {upcomingBooking && (
        <div
          onClick={() => onNavigate('booking-detail', upcomingBooking._id)}
          className="bg-white rounded-[24px] border-2 border-[#0F4C5C]/30 p-6 shadow-sm hover:border-[#0F4C5C] hover:shadow-md transition-all cursor-pointer space-y-4 group"
        >
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E36414] animate-pulse" />
              <h3 className="font-bold text-stone-900 text-sm font-serif-display">
                Next Upcoming Service Appointment
              </h3>
            </div>
            <span className={`px-2.5 py-0.5 rounded-lg text-xs font-semibold ${STATUS_LABELS[upcomingBooking.status]?.color}`}>
              {STATUS_LABELS[upcomingBooking.status]?.label}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-stone-400 text-[11px] block">Service</span>
              <span className="font-semibold text-stone-900 text-sm">{upcomingBooking.service?.name}</span>
            </div>
            <div>
              <span className="text-stone-400 text-[11px] block">Assigned Specialist</span>
              <span className="font-semibold text-stone-900 text-sm">{upcomingBooking.provider?.user?.name}</span>
            </div>
            <div>
              <span className="text-stone-400 text-[11px] block">Date & Slot</span>
              <span className="font-semibold text-stone-900">
                {formatDate(upcomingBooking.date)} at {formatTimeSlot(upcomingBooking.timeSlot)}
              </span>
            </div>
            <div className="flex items-center justify-end">
              <span className="text-xs font-semibold text-[#0F4C5C] group-hover:translate-x-1 transition-transform flex items-center gap-1">
                <span>Track Live Status</span>
                <ChevronRight className="w-4 h-4" />
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Quick-Book Category Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-stone-900 font-serif-display uppercase tracking-wide">
            Book Common Services
          </h3>
          <span
            onClick={() => onNavigate('services')}
            className="text-xs font-semibold text-[#0F4C5C] hover:underline cursor-pointer"
          >
            All Services ({services.length})
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          {services.slice(0, 4).map(s => (
            <div
              key={s._id}
              onClick={() => onNavigate('book', { serviceId: s._id })}
              className="p-4 bg-white rounded-2xl border border-stone-200/80 hover:border-[#0F4C5C] hover:shadow-md transition-all text-left cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <span className="text-2xl block mb-2 group-hover:scale-110 transition-transform">{s.icon}</span>
                <h4 className="font-semibold text-stone-900 text-xs group-hover:text-[#0F4C5C] truncate">
                  {s.name}
                </h4>
              </div>
              <div className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-between text-[11px]">
                <span className="font-mono text-stone-500">From {formatCurrency(s.basePrice)}</span>
                <span className="text-[#E36414] font-semibold opacity-0 group-hover:opacity-100 transition-opacity">Book →</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Bookings List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-stone-900 font-serif-display uppercase tracking-wide">
            Recent Service Visits
          </h3>
          <span
            onClick={() => onNavigate('my-bookings')}
            className="text-xs font-semibold text-[#0F4C5C] hover:underline cursor-pointer"
          >
            View All ({bookings.length})
          </span>
        </div>

        {loading ? (
          <SkeletonCard height="h-36" />
        ) : bookings.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-stone-200 text-xs text-stone-500">
            No booking history yet. Select any category above to schedule your first service visit.
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.slice(0, 3).map(b => (
              <BookingCard
                key={b._id}
                booking={b}
                onViewDetails={id => onNavigate('booking-detail', id)}
                isProviderView={false}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
