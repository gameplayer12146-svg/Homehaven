import React, { useState, useEffect } from 'react';
import { api } from '../api/client.js';
import { useAuth, UserAddress } from '../context/AuthContext.js';
import { showToast } from '../hooks/useToast.js';
import { formatCurrency, formatDate, STATUS_LABELS } from '../utils/helpers.js';
import { MapPin, Plus, Trash2, Home, Building, Calendar, ChevronRight } from 'lucide-react';

interface HomeProfileProps {
  onNavigate: (tab: string, param?: any) => void;
}

export const HomeProfile: React.FC<HomeProfileProps> = ({ onNavigate }) => {
  const { user, updateAddresses } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New address form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLabel, setNewLabel] = useState('Primary Residence');
  const [newLine, setNewLine] = useState('');
  const [newCity, setNewCity] = useState('Bengaluru');
  const [newPincode, setNewPincode] = useState('560034');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadBookings() {
      setLoading(true);
      try {
        const res = await api.get('/api/bookings/mine');
        if (res.success) {
          setBookings(res.bookings || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadBookings();
  }, []);

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLine.trim()) {
      showToast('Please enter a street address', 'error');
      return;
    }

    setSaving(true);
    try {
      const current = user?.addresses || [];
      const updated: UserAddress[] = [
        ...current,
        {
          _id: `addr_${Date.now()}`,
          label: newLabel,
          line: newLine,
          city: newCity,
          pincode: newPincode
        }
      ];

      await updateAddresses(updated);
      showToast('Address added to your Home Profile!', 'success');
      setShowAddForm(false);
      setNewLine('');
    } catch (err: any) {
      showToast(err.message || 'Failed to save address', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAddress = async (id?: string) => {
    if (!id) return;
    if (!window.confirm('Remove this address from your profile?')) return;
    try {
      const current = user?.addresses || [];
      const updated = current.filter(a => a._id !== id);
      await updateAddresses(updated);
      showToast('Address removed', 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to remove address', 'error');
    }
  };

  const addresses = user?.addresses || [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-[#0F4C5C] uppercase tracking-wider">
            Property & Maintenance Dossier
          </span>
          <h1 className="text-3xl font-bold font-serif-display text-stone-900 mt-1">
            Home Profile & Service Log
          </h1>
          <p className="text-xs text-stone-500 mt-1 max-w-xl">
            Maintain past service history grouped by property address. Useful for equipment warranties and repair audits.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-[#0F4C5C] hover:bg-[#0A3642] text-white rounded-xl text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Property Address</span>
        </button>
      </div>

      {/* Add Address Form Modal / Expandable */}
      {showAddForm && (
        <form onSubmit={handleAddAddress} className="bg-white rounded-2xl border border-stone-200/90 p-6 space-y-4 shadow-sm max-w-xl">
          <h3 className="text-sm font-semibold text-stone-900">Add New Property Address</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="space-y-1">
              <label className="text-stone-600 font-medium">Label (e.g. Home, Rental, Parents)</label>
              <input
                type="text"
                value={newLabel}
                onChange={e => setNewLabel(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-[#0F4C5C]"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-stone-600 font-medium">Metro City</label>
              <select
                value={newCity}
                onChange={e => setNewCity(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#0F4C5C]"
              >
                <option value="Bengaluru">Bengaluru</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Delhi NCR">Delhi NCR</option>
                <option value="Pune">Pune</option>
                <option value="Chennai">Chennai</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-stone-600 font-medium">Flat / House No, Building, Street / Locality</label>
              <input
                type="text"
                value={newLine}
                onChange={e => setNewLine(e.target.value)}
                placeholder="e.g. Flat 402, Shanthi Niketan, 7th Main, 4th Block, Koramangala"
                className="w-full p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-[#0F4C5C]"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-stone-600 font-medium">PIN Code (6 digits)</label>
              <input
                type="text"
                value={newPincode}
                onChange={e => setNewPincode(e.target.value)}
                placeholder="560034"
                maxLength={6}
                className="w-full p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-[#0F4C5C]"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 rounded-xl border border-stone-200 text-xs font-medium text-stone-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-1.5 rounded-xl bg-[#0F4C5C] text-white text-xs font-semibold hover:bg-[#0A3642] disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Property'}
            </button>
          </div>
        </form>
      )}

      {/* Address Cards with grouped past services */}
      {addresses.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-stone-200 space-y-2">
          <p className="text-sm text-stone-600">No properties recorded in your Home Profile yet.</p>
          <p className="text-xs text-stone-400">Add your address to track plumbing, HVAC, and cleaning records in one place.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {addresses.map(addr => {
            // Find past bookings matching this address
            const matchingBookings = bookings.filter(b =>
              b.address?.line?.toLowerCase().includes(addr.line.toLowerCase().slice(0, 10)) ||
              b.address?.label === addr.label
            );

            return (
              <div
                key={addr._id || addr.line}
                className="bg-white rounded-[24px] border border-stone-200/90 p-6 shadow-xs space-y-6"
              >
                {/* Property Header */}
                <div className="flex items-start justify-between pb-4 border-b border-stone-100">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-[#0F4C5C]/10 text-[#0F4C5C] flex items-center justify-center">
                      <Home className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-stone-900 text-base leading-snug">
                        {addr.label}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-stone-500 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-stone-400" />
                        <span>{addr.line}, {addr.city} {addr.pincode}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-stone-400 font-mono tabular-nums">
                      {matchingBookings.length} Recorded Visit{matchingBookings.length === 1 ? '' : 's'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteAddress(addr._id)}
                      className="p-1.5 text-stone-300 hover:text-rose-600 rounded-lg transition-colors"
                      title="Remove Address"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Grouped Services List for this address */}
                <div>
                  <h4 className="text-xs font-semibold text-stone-700 uppercase tracking-wider mb-3">
                    Service & Maintenance History
                  </h4>

                  {matchingBookings.length === 0 ? (
                    <div className="p-4 bg-stone-50 rounded-xl text-center text-xs text-stone-400">
                      No visits recorded yet for this address.
                    </div>
                  ) : (
                    <div className="divide-y divide-stone-100 border border-stone-100 rounded-xl overflow-hidden">
                      {matchingBookings.map(b => (
                        <div
                          key={b._id}
                          onClick={() => onNavigate('booking-detail', b._id)}
                          className="p-3.5 flex items-center justify-between hover:bg-stone-50 transition-colors cursor-pointer text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xl w-8 h-8 rounded-lg bg-stone-50 flex items-center justify-center">
                              {b.service?.icon || '🛠️'}
                            </span>
                            <div>
                              <span className="font-semibold text-stone-900 block">{b.service?.name}</span>
                              <span className="text-stone-400 text-[11px]">
                                Specialist: {b.provider?.user?.name || 'Assigned Specialist'} · {formatDate(b.date)}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-[#0F4C5C] font-mono tabular-nums">
                              {formatCurrency(b.priceBreakdown?.total || 0)}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${STATUS_LABELS[b.status]?.color || 'bg-stone-100'}`}>
                              {STATUS_LABELS[b.status]?.label || b.status}
                            </span>
                            <ChevronRight className="w-4 h-4 text-stone-400" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quick book for this address */}
                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => onNavigate('book')}
                    className="px-3.5 py-1.5 text-xs font-semibold text-[#0F4C5C] hover:bg-[#0F4C5C]/5 rounded-lg border border-[#0F4C5C]/20 transition-colors"
                  >
                    Schedule Service for {addr.label}
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
