import React, { useState, useEffect } from 'react';
import { api } from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.js';
import { showToast } from '../../hooks/useToast.js';
import { formatDate, formatTimeSlot, formatCurrency, STATUS_LABELS } from '../../utils/helpers.js';
import {
  Calendar, CheckCircle, Clock, MapPin, DollarSign, Star,
  Award, Shield, ArrowRight, Settings, ChevronRight, Check, X
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ProviderDashboardProps {
  onNavigate: (tab: string, param?: any) => void;
}

export const ProviderDashboard: React.FC<ProviderDashboardProps> = ({ onNavigate }) => {
  const { user, provider } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchProviderData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/bookings/mine');
      if (res.success) {
        setBookings(res.bookings || []);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to load specialist appointments', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviderData();
  }, []);

  const handleQuickStatus = async (id: string, status: string, note?: string) => {
    setActionLoading(true);
    try {
      const res = await api.patch(`/api/bookings/${id}/status`, { status, note });
      if (res.success) {
        showToast(`Job ${status.replace(/_/g, ' ')}!`, 'success');
        fetchProviderData();
      }
    } catch (err: any) {
      showToast(err.message || 'Action failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Metrics
  const pendingRequests = bookings.filter(b => b.status === 'requested');
  const activeJobs = bookings.filter(b => ['accepted', 'on_the_way', 'in_progress'].includes(b.status));
  const completedJobs = bookings.filter(b => b.status === 'completed');

  // Estimated provider earnings (total completed jobs * 85%)
  const totalEarnings = completedJobs.reduce((sum, b) => sum + (b.priceBreakdown?.total || 0) * 0.85, 0);

  // Rating distribution data for chart
  const ratingData = [
    { stars: '5 ★', count: 38, fill: '#0F4C5C' },
    { stars: '4 ★', count: 8, fill: '#166A80' },
    { stars: '3 ★', count: 2, fill: '#E36414' },
    { stars: '2 ★', count: 0, fill: '#d4ccbd' },
    { stars: '1 ★', count: 0, fill: '#e5e0d8' }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Profile Bar */}
      <div className="bg-white rounded-[26px] p-6 sm:p-8 border border-stone-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={user?.avatar}
            alt={user?.name}
            className="w-16 h-16 rounded-2xl object-cover bg-stone-100 border border-stone-200"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#0F4C5C] uppercase tracking-wider">
                Specialist Console
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
                Active & Dispatched
              </span>
            </div>
            <h1 className="text-2xl font-bold font-serif-display text-stone-900 mt-0.5">
              Namaste, {user?.name || 'Specialist'}!
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">
              Operating in {provider?.city || 'Bengaluru'} · {provider?.experience || 8} yrs verified trade experience
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigate('provider-availability')}
            className="px-4 py-2 border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Settings className="w-4 h-4 text-stone-500" />
            <span>Manage Availability</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('provider-jobs')}
            className="px-4 py-2 bg-[#0F4C5C] hover:bg-[#0A3642] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Clock className="w-4 h-4" />
            <span>Job Queue ({pendingRequests.length})</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-2xs">
          <span className="text-xs text-stone-400 uppercase tracking-wide block">Pending Requests</span>
          <span className="text-3xl font-bold font-serif-display text-[#E36414] font-mono tabular-nums mt-1 block">
            {pendingRequests.length}
          </span>
          <span className="text-[11px] text-stone-500 mt-1 block">Requires confirmation</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-2xs">
          <span className="text-xs text-stone-400 uppercase tracking-wide block">Jobs Done</span>
          <span className="text-3xl font-bold font-serif-display text-[#0F4C5C] font-mono tabular-nums mt-1 block">
            {provider?.jobsDone || 182}
          </span>
          <span className="text-[11px] text-stone-500 mt-1 block">All-time completed</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-2xs">
          <span className="text-xs text-stone-400 uppercase tracking-wide block">Average Rating</span>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-3xl font-bold font-serif-display text-stone-900 font-mono tabular-nums">
              {(provider?.rating || 4.9).toFixed(1)}
            </span>
            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
          </div>
          <span className="text-[11px] text-stone-500 mt-1 block">{provider?.reviewCount || 48} verified ratings</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-2xs">
          <span className="text-xs text-stone-400 uppercase tracking-wide block">Net Earnings</span>
          <span className="text-3xl font-bold font-serif-display text-emerald-800 font-mono tabular-nums mt-1 block">
            {formatCurrency(totalEarnings || 18450)}
          </span>
          <span className="text-[11px] text-stone-500 mt-1 block">Direct deposit balance</span>
        </div>
      </div>

      {/* Two Column Layout: Pending Requests & Rating Breakdown Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Col: Pending Incoming Requests */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-stone-900 font-serif-display uppercase tracking-wide">
              New Customer Booking Requests
            </h3>
            <span className="text-xs text-stone-400">{pendingRequests.length} Waiting</span>
          </div>

          {pendingRequests.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 border border-stone-200 text-center space-y-2">
              <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto" />
              <p className="text-xs font-semibold text-stone-700">All caught up!</p>
              <p className="text-[11px] text-stone-400">No unconfirmed appointment requests waiting in your queue.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingRequests.map(b => (
                <div
                  key={b._id}
                  className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-2xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-xs font-semibold text-[#0F4C5C] block">
                        {b.service?.name}
                      </span>
                      <h4 className="font-semibold text-stone-900 text-sm mt-0.5">
                        Client: {b.customer?.name}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-stone-500 mt-1">
                        <span>{formatDate(b.date)}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">{formatTimeSlot(b.timeSlot)}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-bold font-serif-display text-[#0F4C5C] font-mono tabular-nums">
                        {formatCurrency(b.priceBreakdown?.total || 0)}
                      </span>
                    </div>
                  </div>

                  {b.problemNote && (
                    <p className="text-xs text-stone-600 bg-stone-50 p-2.5 rounded-xl border border-stone-100 italic">
                      "{b.problemNote}"
                    </p>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleQuickStatus(b._id, 'cancelled', 'Declined by specialist')}
                      className="px-3 py-1.5 border border-rose-200 text-rose-600 rounded-lg text-xs font-medium hover:bg-rose-50"
                    >
                      Decline
                    </button>

                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleQuickStatus(b._id, 'accepted', 'Specialist confirmed booking')}
                      className="px-4 py-1.5 bg-[#0F4C5C] hover:bg-[#0A3642] text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Accept Appointment</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Active Work In-Flight */}
          <div className="pt-4 space-y-4">
            <h3 className="text-sm font-bold text-stone-900 font-serif-display uppercase tracking-wide">
              Active Dispatches & In-Progress Visits
            </h3>

            {activeJobs.length === 0 ? (
              <div className="bg-white rounded-2xl p-6 border border-stone-200 text-center text-xs text-stone-400">
                No visits currently in dispatch or in-progress status.
              </div>
            ) : (
              <div className="space-y-3">
                {activeJobs.map(b => (
                  <div
                    key={b._id}
                    onClick={() => onNavigate('booking-detail', b._id)}
                    className="bg-white rounded-2xl p-4 border border-stone-200 hover:border-stone-300 hover:shadow-xs transition-all cursor-pointer flex items-center justify-between text-xs"
                  >
                    <div>
                      <h4 className="font-semibold text-stone-900">{b.service?.name}</h4>
                      <p className="text-stone-500 text-[11px]">
                        Customer: {b.customer?.name} · {formatDate(b.date)} at {formatTimeSlot(b.timeSlot)}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-0.5 rounded-lg text-xs font-medium ${STATUS_LABELS[b.status]?.color}`}>
                        {STATUS_LABELS[b.status]?.label}
                      </span>
                      <ChevronRight className="w-4 h-4 text-stone-400" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Rating Breakdown Chart (Recharts) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-stone-200/90 p-5 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <div>
                <h4 className="text-xs font-semibold text-stone-900 uppercase tracking-wide">
                  Customer Rating Distribution
                </h4>
                <p className="text-[11px] text-stone-400 mt-0.5">Based on {provider?.reviewCount || 48} verified post-visit reviews</p>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-[#0F4C5C]">
                <Shield className="w-3.5 h-3.5" />
                <span>{provider?.trustScore || 98}% Trust</span>
              </div>
            </div>

            {/* Recharts BarChart */}
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ratingData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="stars" tick={{ fontSize: 11, fill: '#666' }} width={35} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, fontSize: 12, border: '1px solid #e5e0d8' }}
                    formatter={(val: any) => [`${val} reviews`, 'Count']}
                  />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                    {ratingData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="text-[11px] text-stone-500 bg-stone-50 p-3 rounded-xl border border-stone-100 leading-relaxed">
              ⭐ <strong>Trade Performance Note:</strong> Specialists with &gt;95% trust scores receive first-tier algorithmic matching on the HomeHaven homepage.
            </div>
          </div>

          {/* Quick Schedule summary */}
          <div className="bg-white rounded-2xl border border-stone-200/90 p-5 space-y-3">
            <h4 className="text-xs font-semibold text-stone-900 uppercase tracking-wide">
              Configured Working Days
            </h4>
            <div className="flex items-center gap-1.5 flex-wrap">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => {
                const isActive = provider?.availability?.days?.includes(idx);
                return (
                  <span
                    key={day}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                      isActive ? 'bg-[#0F4C5C] text-white' : 'bg-stone-100 text-stone-400'
                    }`}
                  >
                    {day}
                  </span>
                );
              })}
            </div>
            <button
              type="button"
              onClick={() => onNavigate('provider-availability')}
              className="w-full mt-2 py-2 text-xs font-semibold text-[#0F4C5C] hover:bg-[#0F4C5C]/5 border border-[#0F4C5C]/20 rounded-xl transition-colors cursor-pointer"
            >
              Adjust Slots & Days
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
