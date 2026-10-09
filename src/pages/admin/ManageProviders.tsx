import React, { useState, useEffect } from 'react';
import { api } from '../../api/client.js';
import { showToast } from '../../hooks/useToast.js';
import { ArrowLeft, CheckCircle, XCircle, Shield, Star, MapPin } from 'lucide-react';

interface ManageProvidersProps {
  onNavigate: (tab: string, param?: any) => void;
}

export const ManageProviders: React.FC<ManageProvidersProps> = ({ onNavigate }) => {
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/admin/providers');
      if (res.success) setProviders(res.providers || []);
    } catch (err: any) {
      showToast(err.message || 'Failed to load specialists', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const handleToggleApproval = async (provId: string, currentStatus: boolean) => {
    setUpdatingId(provId);
    try {
      const res = await api.patch(`/api/admin/providers/${provId}`, {
        isApproved: !currentStatus
      });
      if (res.success) {
        showToast(res.message || 'Status updated', 'success');
        fetchProviders();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to update approval status', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <button
        type="button"
        onClick={() => onNavigate('admin-dashboard')}
        className="text-xs font-semibold text-stone-500 hover:text-stone-800 flex items-center gap-1.5 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Admin Command Center</span>
      </button>

      <div>
        <span className="text-xs font-semibold text-[#0F4C5C] uppercase tracking-wider">
          Contractor Verification
        </span>
        <h1 className="text-3xl font-bold font-serif-display text-stone-900 mt-1">
          Specialist Network & Approvals
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Manage specialist credentials, trade badges, and marketplace access permissions.
        </p>
      </div>

      <div className="bg-white rounded-[24px] border border-stone-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-stone-50/70 border-b border-stone-200 text-stone-500 uppercase text-[10px] font-semibold">
                <th className="p-4">Specialist</th>
                <th className="p-4">Metro</th>
                <th className="p-4">Trade Services</th>
                <th className="p-4">Rating & Jobs</th>
                <th className="p-4">Trust Score</th>
                <th className="p-4">Approval State</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {providers.map(p => {
                const isApproved = p.user?.isApproved;
                return (
                  <tr key={p._id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.user?.avatar}
                          alt={p.user?.name}
                          className="w-10 h-10 rounded-xl object-cover bg-stone-100 border border-stone-200"
                        />
                        <div>
                          <span className="font-semibold text-stone-900 block">{p.user?.name}</span>
                          <span className="text-stone-400 text-[11px]">{p.user?.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-stone-600">{p.city}</td>
                    <td className="p-4 text-stone-600">
                      <span className="line-clamp-1">{(p.serviceNames || []).join(', ') || 'General Repairs'}</span>
                    </td>
                    <td className="p-4 text-stone-700">
                      <span className="font-semibold">{p.rating} ★</span>
                      <span className="text-stone-400 text-[11px] block">{p.jobsDone} completed visits</span>
                    </td>
                    <td className="p-4 font-mono font-semibold text-[#0F4C5C]">
                      {p.trustScore}%
                    </td>
                    <td className="p-4">
                      {isApproved ? (
                        <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          Active & Verified
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                          Pending Approval
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        type="button"
                        disabled={updatingId === p._id}
                        onClick={() => handleToggleApproval(p._id, isApproved)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                          isApproved
                            ? 'border border-rose-200 text-rose-600 hover:bg-rose-50'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        }`}
                      >
                        {isApproved ? 'Revoke Access' : 'Approve Profile'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
