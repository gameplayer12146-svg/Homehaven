import React, { useState, useEffect } from 'react';
import { api } from '../../api/client.js';
import { showToast } from '../../hooks/useToast.js';
import { formatCurrency } from '../../utils/helpers.js';
import { ArrowLeft, Plus, Edit2, Trash2, X, Check, Save } from 'lucide-react';

interface ManageServicesProps {
  onNavigate: (tab: string, param?: any) => void;
}

export const ManageServices: React.FC<ManageServicesProps> = ({ onNavigate }) => {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal create/edit state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('plumbing');
  const [description, setDescription] = useState('');
  const [basePrice, setBasePrice] = useState('65');
  const [duration, setDuration] = useState('60');
  const [icon, setIcon] = useState('🔧');
  const [inclusionsText, setInclusionsText] = useState('');
  const [exclusionsText, setExclusionsText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/services?activeOnly=false');
      if (res.success) setServices(res.services || []);
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch services', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setName('');
    setCategory('plumbing');
    setDescription('');
    setBasePrice('65');
    setDuration('60');
    setIcon('🛠️');
    setInclusionsText('On-site inspection\nStandard hardware check');
    setExclusionsText('Structural modification');
    setModalOpen(true);
  };

  const openEdit = (srv: any) => {
    setEditingId(srv._id);
    setName(srv.name);
    setCategory(srv.category);
    setDescription(srv.description);
    setBasePrice(srv.basePrice.toString());
    setDuration(srv.duration.toString());
    setIcon(srv.icon);
    setInclusionsText((srv.inclusions || []).join('\n'));
    setExclusionsText((srv.exclusions || []).join('\n'));
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        name,
        category,
        description,
        basePrice: Number(basePrice),
        duration: Number(duration),
        icon,
        inclusions: inclusionsText.split('\n').filter(Boolean),
        exclusions: exclusionsText.split('\n').filter(Boolean)
      };

      if (editingId) {
        await api.put(`/api/services/${editingId}`, payload);
        showToast('Service updated successfully', 'success');
      } else {
        await api.post('/api/services', payload);
        showToast('New service category added', 'success');
      }
      setModalOpen(false);
      fetchServices();
    } catch (err: any) {
      showToast(err.message || 'Failed to save service', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this service category?')) return;
    try {
      await api.delete(`/api/services/${id}`);
      showToast('Service deleted', 'info');
      fetchServices();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete service', 'error');
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

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-[#0F4C5C] uppercase tracking-wider">
            Catalog Management
          </span>
          <h1 className="text-3xl font-bold font-serif-display text-stone-900 mt-1">
            Service Catalog & Rate Cards
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Configure trade specialties, diagnostic durations, base pricing, and warranty inclusions.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="px-4 py-2 bg-[#0F4C5C] hover:bg-[#0A3642] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Service</span>
        </button>
      </div>

      <div className="bg-white rounded-[24px] border border-stone-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-stone-50/70 border-b border-stone-200 text-stone-500 uppercase text-[10px] font-semibold">
                <th className="p-4">Service</th>
                <th className="p-4">Category</th>
                <th className="p-4">Base Rate</th>
                <th className="p-4">Est. Time</th>
                <th className="p-4">Inclusions</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {services.map(s => (
                <tr key={s._id} className="hover:bg-stone-50/60 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xl w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center">
                        {s.icon}
                      </span>
                      <div>
                        <span className="font-semibold text-stone-900 block">{s.name}</span>
                        <span className="text-stone-400 text-[11px] line-clamp-1">{s.description}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 capitalize text-stone-600">{s.category.replace(/_/g, ' ')}</td>
                  <td className="p-4 font-semibold text-[#0F4C5C] font-mono tabular-nums">
                    {formatCurrency(s.basePrice)}
                  </td>
                  <td className="p-4 text-stone-600 font-mono tabular-nums">{s.duration} mins</td>
                  <td className="p-4 text-stone-500 font-mono tabular-nums">{s.inclusions?.length || 0} items</td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      type="button"
                      onClick={() => openEdit(s)}
                      className="p-1.5 text-stone-500 hover:text-[#0F4C5C] rounded-lg transition-colors"
                      title="Edit Service"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(s._id)}
                      className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg transition-colors"
                      title="Delete Service"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] max-w-lg w-full p-6 space-y-4 border border-stone-200 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="text-base font-bold font-serif-display text-stone-900">
                {editingId ? 'Edit Service Category' : 'Create New Service'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-1">
                  <label className="font-semibold text-stone-700">Service Title</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    placeholder="e.g. Tankless Water Heater Flush"
                    className="w-full p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-[#0F4C5C]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Icon Emoji</label>
                  <input
                    type="text"
                    value={icon}
                    onChange={e => setIcon(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-200 text-center text-base focus:outline-none focus:ring-1 focus:ring-[#0F4C5C]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-200 bg-white"
                  >
                    <option value="plumbing">Plumbing</option>
                    <option value="electrical">Electrical</option>
                    <option value="cleaning">Cleaning</option>
                    <option value="ac_repair">AC Repair</option>
                    <option value="painting">Painting</option>
                    <option value="pest_control">Pest Control</option>
                    <option value="appliance_repair">Appliances</option>
                    <option value="carpentry">Carpentry</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Base Price ($)</label>
                  <input
                    type="number"
                    value={basePrice}
                    onChange={e => setBasePrice(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl border border-stone-200"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Duration (mins)</label>
                  <input
                    type="number"
                    value={duration}
                    onChange={e => setDuration(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl border border-stone-200"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700">Description</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 rounded-xl border border-stone-200"
                  placeholder="Detailed explanation of work performed..."
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700">Inclusions (one per line)</label>
                <textarea
                  value={inclusionsText}
                  onChange={e => setInclusionsText(e.target.value)}
                  rows={3}
                  className="w-full p-2.5 rounded-xl border border-stone-200"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700">Exclusions (one per line)</label>
                <textarea
                  value={exclusionsText}
                  onChange={e => setExclusionsText(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 rounded-xl border border-stone-200"
                />
              </div>

              <div className="pt-3 border-t border-stone-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-stone-200 rounded-xl text-stone-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#0F4C5C] hover:bg-[#0A3642] text-white rounded-xl font-semibold disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
