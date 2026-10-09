import React, { useState, useEffect } from 'react';
import { api } from '../api/client.js';
import { SkeletonCard } from '../components/ui/SkeletonCard.js';
import { formatCurrency } from '../utils/helpers.js';
import { Search, Clock, Check, X, ArrowRight, Sparkles, Filter } from 'lucide-react';

interface ServicesProps {
  onNavigate: (tab: string, param?: any) => void;
  initialFilter?: string;
}

export const Services: React.FC<ServicesProps> = ({ onNavigate, initialFilter }) => {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialFilter || 'all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', label: 'All Services' },
    { id: 'plumbing', label: 'Plumbing' },
    { id: 'electrical', label: 'Electrical' },
    { id: 'cleaning', label: 'Cleaning' },
    { id: 'ac_repair', label: 'AC Repair' },
    { id: 'painting', label: 'Painting' },
    { id: 'pest_control', label: 'Pest Control' },
    { id: 'appliance_repair', label: 'Appliances' },
    { id: 'carpentry', label: 'Carpentry' }
  ];

  useEffect(() => {
    async function fetchServices() {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (selectedCategory !== 'all') queryParams.set('category', selectedCategory);
        if (searchQuery) queryParams.set('search', searchQuery);

        const res = await api.get(`/api/services?${queryParams.toString()}`);
        if (res.success) {
          setServices(res.services || []);
        }
      } catch (err) {
        console.error('Error fetching services', err);
      } finally {
        setLoading(false);
      }
    }
    fetchServices();
  }, [selectedCategory, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-[#0F4C5C] uppercase tracking-wider">
            Verified Service Catalog
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold font-serif-display text-stone-900 mt-1">
            Home Services & Repairs
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-xl leading-relaxed">
            Every service includes a standardized on-site diagnostic checklist, transparent itemized pricing, and guaranteed post-repair testing.
          </p>
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Filter service or keyword..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-[#0F4C5C]"
          />
        </div>
      </div>

      {/* Category Segmented Controls (Interactive buttons) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        {categories.map(cat => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#0F4C5C] text-white shadow-xs'
                  : 'bg-white text-stone-600 border border-stone-200/80 hover:bg-stone-50'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Service Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : services.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-stone-200">
          <p className="text-sm text-stone-600">No services found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map(service => (
            <div
              key={service._id}
              className="bg-white rounded-[22px] p-6 border border-stone-200/80 shadow-xs hover:border-stone-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#0F4C5C]/5 text-2xl flex items-center justify-center border border-stone-100">
                    {service.icon}
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-stone-400 uppercase tracking-wider block">Base Estimate</span>
                    <span className="text-xl font-bold font-serif-display text-[#0F4C5C] font-mono tabular-nums">
                      {formatCurrency(service.basePrice)}
                    </span>
                  </div>
                </div>

                <h3 className="font-semibold text-stone-900 text-lg leading-tight mb-2">
                  {service.name}
                </h3>
                
                <p className="text-xs text-stone-600 leading-relaxed mb-4">
                  {service.description}
                </p>

                {/* Duration & Category unboxed metadata */}
                <div className="flex items-center gap-2 text-xs text-stone-500 mb-4 pb-4 border-b border-stone-100">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-stone-400" />
                    <span>~{service.duration} mins</span>
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="capitalize">{service.category.replace(/_/g, ' ')}</span>
                </div>

                {/* Inclusions checklist preview */}
                <div className="space-y-1.5 mb-4">
                  <span className="text-[11px] font-semibold text-stone-700 block">Service Includes:</span>
                  {service.inclusions?.slice(0, 3).map((item: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-stone-600">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom CTAs */}
              <div className="pt-4 border-t border-stone-100 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => onNavigate('service-detail', service._id)}
                  className="text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors"
                >
                  View Details
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('book', { serviceId: service._id })}
                  className="px-4 py-2 bg-[#0F4C5C] hover:bg-[#0A3642] text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-1 shadow-xs cursor-pointer"
                >
                  <span>Book Visit</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
