import React, { useState, useEffect } from 'react';
import { api } from '../../api/client.js';
import { showToast } from '../../hooks/useToast.js';
import { formatDate, formatTimeSlot, formatCurrency, STATUS_LABELS } from '../../utils/helpers.js';
import { ArrowLeft, Search, Filter } from 'lucide-react';

interface ManageBookingsProps {
  onNavigate: (tab: string, param?: any) => void;
}

export const ManageBookings: React.FC<ManageBookingsProps> = ({ onNavigate }) => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/bookings/mine');
      if (res.success) setBookings(res.bookings || []);
    } catch (err: any) {
      showToast(err.message || 'Failed to load bookings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const filtered = bookings.filter(b => {
    if (filter !== 'all' && b.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchName = b.customer?.name?.toLowerCase().includes(q) || b.provider?.user?.name?.toLowerCase().includes(q);
      const matchSrv = b.service?.name?.toLowerCase().includes(q);
      const matchId = b._id.toLowerCase().includes(q);
      return matchName || matchSrv || matchId;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <button
        type="button"
        onClick={() => onNavigate('admin-dashboard')}
        className="text-xs font-semibold text-stone-500 hover:text-stone-800 flex items-center gap-1.5 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Admin Command Center</span>
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-[#0F4C5C] uppercase tracking-wider">
            Booking Records
          </span>
          <h1 className="text-3xl font-bold font-serif-display text-stone-900 mt-1">
            Global Booking Registry
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Complete audit log of all appointments, customer problem notes, and billing breakdowns.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search client, specialist or ID..."
            className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-1 focus:ring-[#0F4C5C]"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex p-1 bg-stone-100 rounded-xl overflow-x-auto">
        {['all', 'requested', 'accepted', 'on_the_way', 'in_progress', 'completed', 'cancelled'].map(st => (
          <button
            key={st}
            type="button"
            onClick={() => setFilter(st)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-all cursor-pointer ${
              filter === st
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            {st.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-[24px] border border-stone-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-stone-50/70 border-b border-stone-200 text-stone-500 uppercase text-[10px] font-semibold">
                <th className="p-4">ID</th>
                <th className="p-4">Service</th>
                <th className="p-4">Client</th>
                <th className="p-4">Specialist</th>
                <th className="p-4">Date & Time</th>
                <th className="p-4">Address</th>
                <th className="p-4">Total</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.map(b => (
                <tr key={b._id} className="hover:bg-stone-50/60 transition-colors">
                  <td className="p-4 font-mono text-stone-400">#{b._id.slice(-6)}</td>
                  <td className="p-4 font-semibold text-stone-900">{b.service?.name}</td>
                  <td className="p-4 text-stone-700">{b.customer?.name}</td>
                  <td className="p-4 text-stone-700">{b.provider?.user?.name}</td>
                  <td className="p-4 text-stone-500">
                    {formatDate(b.date)} at {formatTimeSlot(b.timeSlot)}
                  </td>
                  <td className="p-4 text-stone-500 truncate max-w-[150px]">
                    {b.address?.line}, {b.address?.city}
                  </td>
                  <td className="p-4 font-semibold text-[#0F4C5C] font-mono tabular-nums">
                    {formatCurrency(b.priceBreakdown?.total || 0)}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${STATUS_LABELS[b.status]?.color || 'bg-stone-100'}`}>
                      {STATUS_LABELS[b.status]?.label || b.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      type="button"
                      onClick={() => onNavigate('booking-detail', b._id)}
                      className="text-[#0F4C5C] font-semibold hover:underline"
                    >
                      Audit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
