import React, { useState, useEffect } from 'react';
import { api } from '../api/client.js';
import { ProviderCard } from '../components/provider/ProviderCard.js';
import { SkeletonCard } from '../components/ui/SkeletonCard.js';
import { formatCurrency } from '../utils/helpers.js';
import { ArrowLeft, Clock, ShieldCheck, Check, X, ArrowRight, Star } from 'lucide-react';

interface ServiceDetailProps {
  serviceId: string;
  onNavigate: (tab: string, param?: any) => void;
}

export const ServiceDetail: React.FC<ServiceDetailProps> = ({ serviceId, onNavigate }) => {
  const [service, setService] = useState<any>(null);
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDetail() {
      setLoading(true);
      try {
        const res = await api.get(`/api/services/${serviceId}`);
        if (res.success) {
          setService(res.service);
          setProviders(res.providers || []);
        }
      } catch (err) {
        console.error('Failed to load service detail', err);
      } finally {
        setLoading(false);
      }
    }
    loadDetail();
  }, [serviceId]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <SkeletonCard height="h-64" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center">
        <p className="text-sm text-stone-600">Service not found.</p>
        <button
          onClick={() => onNavigate('services')}
          className="mt-4 px-4 py-2 bg-[#0F4C5C] text-white rounded-xl text-xs font-semibold"
        >
          Back to Services
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Breadcrumb back */}
      <button
        type="button"
        onClick={() => onNavigate('services')}
        className="text-xs font-semibold text-stone-500 hover:text-stone-800 flex items-center gap-1.5 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to All Services</span>
      </button>

      {/* Hero Header */}
      <div className="bg-white rounded-[26px] p-6 sm:p-8 border border-stone-200/90 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        <div className="md:col-span-8 space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-12 h-12 rounded-2xl bg-[#0F4C5C]/10 text-2xl flex items-center justify-center">
              {service.icon}
            </span>
            <div>
              <span className="text-xs text-stone-400 capitalize">{service.category.replace(/_/g, ' ')}</span>
              <h1 className="text-2xl sm:text-3xl font-bold font-serif-display text-stone-900">
                {service.name}
              </h1>
            </div>
          </div>

          <p className="text-sm text-stone-600 leading-relaxed max-w-2xl">
            {service.description}
          </p>

          <div className="flex flex-wrap items-center gap-6 text-xs text-stone-500 pt-2">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#0F4C5C]" />
              <span>Standard Duration: ~{service.duration} mins</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#0F4C5C]" />
              <span>HomeHaven Verified Checklist</span>
            </div>
          </div>
        </div>

        {/* Pricing Card on right */}
        <div className="md:col-span-4 bg-stone-50 rounded-2xl p-6 border border-stone-200/80 text-center space-y-4">
          <div>
            <span className="text-xs text-stone-400 block">Starting Diagnostic Labor</span>
            <span className="text-3xl font-bold font-serif-display text-[#0F4C5C] font-mono tabular-nums">
              {formatCurrency(service.basePrice)}
            </span>
            <span className="text-[11px] text-stone-400 block mt-1">+ ₹149 standard technician visit fee</span>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('book', { serviceId: service._id })}
            className="w-full py-3 bg-[#E36414] hover:bg-[#C5530E] text-white rounded-xl text-xs font-semibold transition-all shadow-md shadow-[#E36414]/20 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Book This Service</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Inclusions and Exclusions side-by-side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Inclusions */}
        <div className="bg-white rounded-[22px] p-6 border border-stone-200/90 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Check className="w-4 h-4 stroke-[2.5]" />
            </div>
            <h3 className="font-semibold text-stone-900 text-sm">What is Included</h3>
          </div>

          <ul className="space-y-3 text-xs text-stone-600">
            {service.inclusions?.map((item: string, idx: number) => (
              <li key={idx} className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Exclusions */}
        <div className="bg-white rounded-[22px] p-6 border border-stone-200/90 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
            <div className="w-7 h-7 rounded-lg bg-stone-100 text-stone-500 flex items-center justify-center">
              <X className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-stone-900 text-sm">What is Excluded</h3>
          </div>

          <ul className="space-y-3 text-xs text-stone-600">
            {service.exclusions?.map((item: string, idx: number) => (
              <li key={idx} className="flex items-start gap-2.5">
                <X className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* Specialists offering this service */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold font-serif-display text-stone-900">
              Specialists Available for {service.name}
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Certified trade contractors with verified licenses & ratings
            </p>
          </div>
        </div>

        {providers.length === 0 ? (
          <div className="p-8 bg-white rounded-2xl border border-stone-200 text-center text-xs text-stone-500">
            No active specialists currently available for this category.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {providers.map(prov => (
              <ProviderCard
                key={prov._id}
                provider={prov}
                onBookNow={() => onNavigate('book', { serviceId: service._id, providerId: prov._id })}
                onSelect={() => onNavigate('book', { serviceId: service._id, providerId: prov._id })}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
