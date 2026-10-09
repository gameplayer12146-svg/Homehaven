import React, { useState, useEffect } from 'react';
import { api } from '../api/client.js';
import { ProviderCard } from '../components/provider/ProviderCard.js';
import { SkeletonCard } from '../components/ui/SkeletonCard.js';
import { Shield, Filter, MapPin, Star } from 'lucide-react';

interface ProviderListProps {
  onNavigate: (tab: string, param?: any) => void;
}

export const ProviderList: React.FC<ProviderListProps> = ({ onNavigate }) => {
  const [providers, setProviders] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [minRating, setMinRating] = useState('0');

  useEffect(() => {
    async function fetchServices() {
      try {
        const res = await api.get('/api/services');
        if (res.success) setServices(res.services || []);
      } catch (err) {
        console.error(err);
      }
    }
    fetchServices();
  }, []);

  useEffect(() => {
    async function fetchProviders() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (selectedService !== 'all') params.set('serviceId', selectedService);
        if (selectedCity !== 'all') params.set('city', selectedCity);
        if (Number(minRating) > 0) params.set('minRating', minRating);

        const res = await api.get(`/api/providers?${params.toString()}`);
        if (res.success) setProviders(res.providers || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchProviders();
  }, [selectedService, selectedCity, minRating]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div>
        <span className="text-xs font-semibold text-[#0F4C5C] uppercase tracking-wider">
          Licensed Trade Network
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold font-serif-display text-stone-900 mt-1">
          Certified Home Specialists
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-xl leading-relaxed">
          Every technician is background verified, trade-licensed, and carries commercial liability insurance with active neighborhood ratings.
        </p>
      </div>

      {/* Filter Bar (Segmented Controls) */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        
        {/* Service filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-stone-600">Trade:</span>
          <select
            value={selectedService}
            onChange={e => setSelectedService(e.target.value)}
            className="text-xs p-2 bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-[#0F4C5C]"
          >
            <option value="all">All Specialties</option>
            {services.map(s => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* City filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-stone-600">Metro Area:</span>
          <select
            value={selectedCity}
            onChange={e => setSelectedCity(e.target.value)}
            className="text-xs p-2 bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-[#0F4C5C]"
          >
            <option value="all">All Metros</option>
            <option value="Bengaluru">Bengaluru</option>
            <option value="Mumbai">Mumbai</option>
            <option value="Hyderabad">Hyderabad</option>
            <option value="Delhi NCR">Delhi NCR</option>
            <option value="Pune">Pune</option>
            <option value="Chennai">Chennai</option>
          </select>
        </div>

        {/* Rating filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-stone-600">Rating:</span>
          <select
            value={minRating}
            onChange={e => setMinRating(e.target.value)}
            className="text-xs p-2 bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-[#0F4C5C]"
          >
            <option value="0">All Ratings</option>
            <option value="4.8">4.8+ Stars</option>
            <option value="4.9">4.9+ Stars</option>
          </select>
        </div>

        <span className="text-xs text-stone-400 font-mono tabular-nums">
          {providers.length} Specialist{providers.length === 1 ? '' : 's'} Available
        </span>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : providers.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-stone-200">
          <p className="text-sm text-stone-600">No specialists match your selected criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {providers.map(prov => (
            <ProviderCard
              key={prov._id}
              provider={prov}
              onBookNow={() => onNavigate('book', { providerId: prov._id })}
              onSelect={() => onNavigate('book', { providerId: prov._id })}
            />
          ))}
        </div>
      )}

    </div>
  );
};
