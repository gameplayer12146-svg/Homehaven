import React, { useState, useEffect } from 'react';
import { api } from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.js';
import { showToast } from '../../hooks/useToast.js';
import { formatTimeSlot } from '../../utils/helpers.js';
import { ArrowLeft, Clock, Calendar, Plus, X, Save, Check } from 'lucide-react';

interface ManageAvailabilityProps {
  onNavigate: (tab: string, param?: any) => void;
}

export const ManageAvailability: React.FC<ManageAvailabilityProps> = ({ onNavigate }) => {
  const { provider, refreshUser } = useAuth();

  const [selectedDays, setSelectedDays] = useState<number[]>(provider?.availability?.days || [1, 2, 3, 4, 5]);
  const [slots, setSlots] = useState<string[]>(provider?.availability?.slots || ['09:00', '11:00', '14:00', '16:00']);
  const [newSlotTime, setNewSlotTime] = useState('10:00');
  const [city, setCity] = useState(provider?.city || 'Bengaluru');
  const [bio, setBio] = useState(provider?.bio || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (provider) {
      if (provider.availability?.days) setSelectedDays(provider.availability.days);
      if (provider.availability?.slots) setSlots(provider.availability.slots);
      if (provider.city) setCity(provider.city);
      if (provider.bio) setBio(provider.bio);
    }
  }, [provider]);

  const daysList = [
    { id: 0, label: 'Sunday' },
    { id: 1, label: 'Monday' },
    { id: 2, label: 'Tuesday' },
    { id: 3, label: 'Wednesday' },
    { id: 4, label: 'Thursday' },
    { id: 5, label: 'Friday' },
    { id: 6, label: 'Saturday' }
  ];

  const toggleDay = (id: number) => {
    if (selectedDays.includes(id)) {
      setSelectedDays(selectedDays.filter(d => d !== id));
    } else {
      setSelectedDays([...selectedDays, id].sort());
    }
  };

  const handleAddSlot = () => {
    if (!newSlotTime) return;
    if (slots.includes(newSlotTime)) {
      showToast('This time slot is already in your schedule', 'error');
      return;
    }
    const updated = [...slots, newSlotTime].sort();
    setSlots(updated);
  };

  const handleRemoveSlot = (slotToRemove: string) => {
    setSlots(slots.filter(s => s !== slotToRemove));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/api/providers/profile', {
        availability: {
          days: selectedDays,
          slots
        },
        city,
        bio
      });

      if (res.success) {
        showToast('Schedule & profile saved successfully!', 'success');
        await refreshUser();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to update availability', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <button
        type="button"
        onClick={() => onNavigate('provider-dashboard')}
        className="text-xs font-semibold text-stone-500 hover:text-stone-800 flex items-center gap-1.5 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Specialist Dashboard</span>
      </button>

      <div>
        <span className="text-xs font-semibold text-[#0F4C5C] uppercase tracking-wider">
          Schedule & Service Area
        </span>
        <h1 className="text-3xl font-bold font-serif-display text-stone-900 mt-1">
          Manage Working Availability
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Configure which days and daily time chips customers can book you for. Double bookings are automatically prevented.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Working Days */}
        <div className="bg-white rounded-[24px] border border-stone-200/90 p-6 space-y-4 shadow-2xs">
          <h3 className="text-sm font-semibold text-stone-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#0F4C5C]" />
            <span>Active Service Days</span>
          </h3>
          <p className="text-xs text-stone-500">
            Customers will only be allowed to book dates that match your active days.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
            {daysList.map(d => {
              const active = selectedDays.includes(d.id);
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => toggleDay(d.id)}
                  className={`p-3 rounded-xl border text-xs font-semibold transition-all ${
                    active
                      ? 'bg-[#0F4C5C] text-white border-[#0F4C5C] shadow-2xs'
                      : 'bg-stone-50 text-stone-500 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {d.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Time Slot Chips */}
        <div className="bg-white rounded-[24px] border border-stone-200/90 p-6 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-stone-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#0F4C5C]" />
              <span>Standard Daily Arrival Slots</span>
            </h3>
            <span className="text-xs text-stone-400 font-mono tabular-nums">{slots.length} configured slots</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {slots.map(s => (
              <div
                key={s}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-100 border border-stone-200 text-stone-800 text-xs font-medium font-mono tabular-nums"
              >
                <span>{formatTimeSlot(s)}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSlot(s)}
                  className="text-stone-400 hover:text-rose-600 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Add Slot */}
          <div className="flex items-center gap-3 pt-2">
            <input
              type="time"
              value={newSlotTime}
              onChange={e => setNewSlotTime(e.target.value)}
              className="p-2 border border-stone-200 rounded-xl text-xs bg-stone-50 focus:outline-none focus:ring-1 focus:ring-[#0F4C5C]"
            />
            <button
              type="button"
              onClick={handleAddSlot}
              className="px-4 py-2 bg-[#0F4C5C]/10 text-[#0F4C5C] hover:bg-[#0F4C5C]/20 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Slot</span>
            </button>
          </div>
        </div>

        {/* City and Bio */}
        <div className="bg-white rounded-[24px] border border-stone-200/90 p-6 space-y-4 shadow-2xs">
          <h3 className="text-sm font-semibold text-stone-900">Operating City & Profile Bio</h3>
          
          <div className="space-y-1 text-xs">
            <label className="font-semibold text-stone-700">Metro Operating Hub</label>
            <select
              value={city}
              onChange={e => setCity(e.target.value)}
              className="w-full sm:w-60 p-2.5 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#0F4C5C]"
            >
              <option value="Bengaluru">Bengaluru</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Hyderabad">Hyderabad</option>
              <option value="Delhi NCR">Delhi NCR</option>
              <option value="Pune">Pune</option>
              <option value="Chennai">Chennai</option>
            </select>
          </div>

          <div className="space-y-1 text-xs">
            <label className="font-semibold text-stone-700">Profile Bio & Specializations</label>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              rows={3}
              className="w-full p-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-[#0F4C5C]"
              placeholder="Detail your equipment, master licenses, and background..."
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-[#0F4C5C] hover:bg-[#0A3642] text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Availability & Bio'}</span>
          </button>
        </div>

      </form>

    </div>
  );
};
