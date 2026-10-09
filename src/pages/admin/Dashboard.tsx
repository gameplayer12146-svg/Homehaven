import React, { useState, useEffect } from 'react';
import { api } from '../../api/client.js';
import { showToast } from '../../hooks/useToast.js';
import { formatCurrency, formatDate, formatTimeSlot, STATUS_LABELS } from '../../utils/helpers.js';
import {
  Users, Briefcase, Calendar, DollarSign, ShieldAlert,
  CheckCircle, XCircle, ArrowRight, Settings, Layers, RefreshCw
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

interface AdminDashboardProps {
  onNavigate: (tab: string, param?: any) => void;
}

const CATEGORY_COLORS = ['#0F4C5C', '#E36414', '#166A80', '#2A9D8F', '#E76F51', '#264653', '#F4A261', '#457B9D'];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<any>(null);
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState<string | null>(null);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, provRes] = await Promise.all([
        api.get('/api/admin/stats'),
        api.get('/api/admin/providers')
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (provRes.success) setProviders(provRes.providers || []);
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch admin metrics', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleApproveProvider = async (providerId: string, approve: boolean) => {
    setApproving(providerId);
    try {
      const res = await api.patch(`/api/admin/providers/${providerId}`, {
        isApproved: approve
      });
      if (res.success) {
        showToast(res.message || 'Provider status updated', 'success');
        fetchAdminData();
      }
    } catch (err: any) {
      showToast(err.message || 'Approval action failed', 'error');
    } finally {
      setApproving(null);
    }
  };

  const handleResetSeed = async () => {
    if (!window.confirm('Reset database to clean seed state?')) return;
    try {
      const res = await api.post('/api/seed/reset');
      if (res.success) {
        showToast('Database reset to fresh demo data!', 'success');
        fetchAdminData();
      }
    } catch (err: any) {
      showToast(err.message || 'Reset failed', 'error');
    }
  };

  const pendingProviders = providers.filter(p => !p.user?.isApproved);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="bg-white rounded-[26px] p-6 sm:p-8 border border-stone-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-semibold text-[#0F4C5C] uppercase tracking-wider">
            Platform Operations
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif-display text-stone-900 mt-1">
            HomeHaven Admin Command Center
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Global service network oversight, revenue reconciliation, and contractor verification queue.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleResetSeed}
            className="px-3.5 py-2 border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Reset to original 8 services & 6 providers demo state"
          >
            <RefreshCw className="w-3.5 h-3.5 text-stone-500" />
            <span>Reset Demo DB</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('admin-services')}
            className="px-4 py-2 bg-[#0F4C5C] hover:bg-[#0A3642] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Settings className="w-4 h-4" />
            <span>Manage Services</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-stone-400">
            <span>Total Customers</span>
            <Users className="w-4 h-4 text-[#0F4C5C]" />
          </div>
          <span className="text-3xl font-bold font-serif-display text-stone-900 font-mono tabular-nums mt-1 block">
            {stats?.totalUsers || 2}
          </span>
          <span className="text-[11px] text-stone-500 mt-1 block">Registered homeowners</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-stone-400">
            <span>Active Specialists</span>
            <Briefcase className="w-4 h-4 text-[#0F4C5C]" />
          </div>
          <span className="text-3xl font-bold font-serif-display text-[#0F4C5C] font-mono tabular-nums mt-1 block">
            {stats?.totalProviders || 6}
          </span>
          <span className="text-[11px] text-stone-500 mt-1 block">
            {pendingProviders.length} pending verification
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-stone-400">
            <span>Total Bookings</span>
            <Calendar className="w-4 h-4 text-[#0F4C5C]" />
          </div>
          <span className="text-3xl font-bold font-serif-display text-[#E36414] font-mono tabular-nums mt-1 block">
            {stats?.totalBookings || 10}
          </span>
          <span className="text-[11px] text-stone-500 mt-1 block">
            {stats?.completedBookings || 5} completed
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-stone-400">
            <span>Gross Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-3xl font-bold font-serif-display text-emerald-800 font-mono tabular-nums mt-1 block">
            {formatCurrency(stats?.totalRevenue || 580)}
          </span>
          <span className="text-[11px] text-stone-500 mt-1 block">Completed visit billings</span>
        </div>
      </div>

      {/* TWO CHARTS: Revenue Chart (BarChart) & Bookings by Category (PieChart) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Monthly Revenue BarChart */}
        <div className="lg:col-span-7 bg-white rounded-[24px] border border-stone-200/90 p-6 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100">
            <div>
              <h3 className="text-sm font-bold text-stone-900 font-serif-display uppercase tracking-wide">
                Platform Revenue Trajectory
              </h3>
              <p className="text-[11px] text-stone-400">Gross completed booking volume (INR)</p>
            </div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
              +28% MoM Growth
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.monthlyRevenue || []} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#888' }} />
                <YAxis tick={{ fontSize: 11, fill: '#888' }} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, fontSize: 12, border: '1px solid #e5e0d8' }}
                  formatter={(val: any) => [`₹${val}`, 'Revenue']}
                />
                <Bar dataKey="revenue" fill="#0F4C5C" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bookings by Category PieChart */}
        <div className="lg:col-span-5 bg-white rounded-[24px] border border-stone-200/90 p-6 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100">
            <div>
              <h3 className="text-sm font-bold text-stone-900 font-serif-display uppercase tracking-wide">
                Bookings by Category
              </h3>
              <p className="text-[11px] text-stone-400">Distribution across 8 trade lines</p>
            </div>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.categoryBreakdown || []}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  innerRadius={40}
                  paddingAngle={3}
                >
                  {(stats?.categoryBreakdown || []).map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: 12, fontSize: 12, border: '1px solid #e5e0d8' }}
                  formatter={(val: any, name: any) => [`${val} visits`, name]}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* PROVIDER APPROVAL QUEUE */}
      <div className="bg-white rounded-[24px] border border-stone-200/90 p-6 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div>
            <h3 className="text-sm font-bold text-stone-900 font-serif-display uppercase tracking-wide">
              Contractor Verification Queue
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Review trade licenses, insurance documentation, and approve marketplace access.
            </p>
          </div>
          <span className="text-xs text-stone-400 font-mono tabular-nums">
            {pendingProviders.length} Pending Approval
          </span>
        </div>

        {pendingProviders.length === 0 ? (
          <div className="p-6 bg-stone-50 rounded-2xl text-center text-xs text-stone-500">
            All registered specialists have been reviewed and approved.
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {pendingProviders.map(p => (
              <div key={p._id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={p.user?.avatar}
                    alt={p.user?.name}
                    className="w-12 h-12 rounded-xl object-cover bg-stone-100 border border-stone-200"
                  />
                  <div>
                    <h4 className="font-semibold text-stone-900 text-sm">{p.user?.name}</h4>
                    <p className="text-xs text-stone-500">
                      {p.city} · {p.experience} yrs exp · {p.user?.email}
                    </p>
                    <p className="text-[11px] text-stone-400 italic mt-0.5">"{p.bio}"</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    type="button"
                    disabled={approving === p._id}
                    onClick={() => handleApproveProvider(p._id, false)}
                    className="px-3 py-1.5 border border-rose-200 text-rose-600 rounded-xl text-xs font-semibold hover:bg-rose-50 cursor-pointer"
                  >
                    Decline
                  </button>
                  <button
                    type="button"
                    disabled={approving === p._id}
                    onClick={() => handleApproveProvider(p._id, true)}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Approve Specialist</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RECENT BOOKINGS TABLE */}
      <div className="bg-white rounded-[24px] border border-stone-200/90 p-6 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div>
            <h3 className="text-sm font-bold text-stone-900 font-serif-display uppercase tracking-wide">
              Recent Platform Bookings
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">Live transaction log across all metros</p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('admin-bookings')}
            className="text-xs font-semibold text-[#0F4C5C] hover:underline"
          >
            View All
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-200 text-stone-400 font-semibold uppercase text-[10px]">
                <th className="pb-3">Booking ID</th>
                <th className="pb-3">Service</th>
                <th className="pb-3">Homeowner</th>
                <th className="pb-3">Specialist</th>
                <th className="pb-3">Date & Slot</th>
                <th className="pb-3">Total</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {(stats?.recentBookings || []).map((b: any) => (
                <tr key={b._id} className="hover:bg-stone-50/60 transition-colors">
                  <td className="py-3 font-mono text-stone-500">#{b._id.slice(-6)}</td>
                  <td className="py-3 font-semibold text-stone-900">{b.serviceName}</td>
                  <td className="py-3 text-stone-700">{b.customerName}</td>
                  <td className="py-3 text-stone-700">{b.providerName}</td>
                  <td className="py-3 text-stone-500">
                    {formatDate(b.date)} ({formatTimeSlot(b.timeSlot)})
                  </td>
                  <td className="py-3 font-semibold text-[#0F4C5C] font-mono tabular-nums">
                    {formatCurrency(b.total)}
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${STATUS_LABELS[b.status]?.color || 'bg-stone-100'}`}>
                      {STATUS_LABELS[b.status]?.label || b.status}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <button
                      type="button"
                      onClick={() => onNavigate('booking-detail', b._id)}
                      className="text-[#0F4C5C] font-semibold hover:underline"
                    >
                      Detail
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
