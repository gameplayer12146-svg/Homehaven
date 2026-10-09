import React, { useState, useEffect } from 'react';
import { api } from '../../api/client.js';
import { showToast } from '../../hooks/useToast.js';
import { BookingCard } from '../../components/booking/BookingCard.js';
import { SkeletonCard } from '../../components/ui/SkeletonCard.js';
import { ArrowLeft } from 'lucide-react';

interface JobRequestsProps {
  onNavigate: (tab: string, param?: any) => void;
}

export const JobRequests: React.FC<JobRequestsProps> = ({ onNavigate }) => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'requested' | 'active' | 'completed'>('all');

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/bookings/mine');
      if (res.success) {
        setBookings(res.bookings || []);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to load jobs', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const filtered = bookings.filter(b => {
    if (filter === 'all') return true;
    if (filter === 'requested') return b.status === 'requested';
    if (filter === 'active') return ['accepted', 'on_the_way', 'in_progress'].includes(b.status);
    if (filter === 'completed') return b.status === 'completed';
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <button
        type="button"
        onClick={() => onNavigate('provider-dashboard')}
        className="text-xs font-semibold text-stone-500 hover:text-stone-800 flex items-center gap-1.5 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Specialist Dashboard</span>
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-[#0F4C5C] uppercase tracking-wider">
            Job Pipeline
          </span>
          <h1 className="text-3xl font-bold font-serif-display text-stone-900 mt-1">
            Specialist Dispatch Queue
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Accept upcoming client appointments and advance live status milestones.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex p-1 bg-stone-100 rounded-xl">
          {[
            { id: 'all', label: 'All Jobs' },
            { id: 'requested', label: 'Pending Requests' },
            { id: 'active', label: 'Active Work' },
            { id: 'completed', label: 'Completed' }
          ].map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => setFilter(t.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filter === t.id
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <SkeletonCard height="h-40" />
          <SkeletonCard height="h-40" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-stone-200 text-xs text-stone-500">
          No jobs found for this filter.
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(b => (
            <BookingCard
              key={b._id}
              booking={b}
              onViewDetails={id => onNavigate('booking-detail', id)}
              isProviderView={true}
            />
          ))}
        </div>
      )}

    </div>
  );
};
