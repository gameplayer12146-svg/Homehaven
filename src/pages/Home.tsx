import React, { useState, useEffect } from 'react';
import { api } from '../api/client.js';
import { ProblemSearch } from '../components/search/ProblemSearch.js';
import { ProviderCard } from '../components/provider/ProviderCard.js';
import { SkeletonCard } from '../components/ui/SkeletonCard.js';
import { formatCurrency } from '../utils/helpers.js';
import { Shield, Clock, CheckCircle2, Star, ArrowRight, Award, Sparkles, Wrench, ChevronRight } from 'lucide-react';

interface HomeProps {
  onNavigate: (tab: string, param?: any) => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const [services, setServices] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [srvRes, provRes] = await Promise.all([
          api.get('/api/services'),
          api.get('/api/providers')
        ]);
        if (srvRes.success) setServices(srvRes.services || []);
        if (provRes.success) setProviders(provRes.providers || []);
      } catch (err) {
        console.error('Error loading home data', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSelectProblem = (serviceId: string, _searchPhrase: string) => {
    onNavigate('book', { serviceId });
  };

  return (
    <div className="space-y-20 pb-16">
      
      {/* HERO SECTION */}
      <section className="relative pt-6 sm:pt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Left Col: Core Value Prop & Problem-First Search */}
            <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
              
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#0F4C5C] tracking-wide uppercase">
                <span className="w-2 h-2 rounded-full bg-[#E36414]" />
                <span>On-Demand Residential Home Services</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-serif-display text-stone-900 leading-[1.1] tracking-tight">
                Vetted home craftspeople, booked in seconds.
              </h1>

              <p className="text-base sm:text-lg text-stone-600 max-w-xl leading-relaxed">
                Skip phone tag and uncertain arrival quotes. Connect directly with licensed plumbers, electricians, cleaners, and AC specialists with guaranteed transparent pricing.
              </p>

              {/* Problem-First Search Bar */}
              <div className="pt-2">
                <ProblemSearch
                  onSelectProblem={handleSelectProblem}
                  onNavigateToServices={q => onNavigate('services', q)}
                />
              </div>

              {/* Trust Badges */}
              <div className="pt-2 flex flex-wrap items-center gap-6 text-xs text-stone-500">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#0F4C5C]" />
                  <span>Licensed & Background Checked</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#0F4C5C]" />
                  <span>Conflict-Free Live Time Slots</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#0F4C5C]" />
                  <span>Upfront Diagnostic Pricing</span>
                </div>
              </div>
            </div>

            {/* Right Col: Hero Visual Asset */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              <div className="relative w-full h-[360px] sm:h-[460px] rounded-[28px] overflow-hidden shadow-2xl border border-stone-200/80 bg-stone-100">
                <img
                  src="/src/assets/images/hero_indian_home_1791556969719.jpg"
                  alt="Certified HomeHaven India specialist ready with toolkit in modern home"
                  className="w-full h-full object-cover"
                />
                
                {/* Overlay Card with Trust Signal */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-stone-200/90 shadow-lg flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-stone-400 uppercase tracking-wide block">Bengaluru, Mumbai & Hyderabad</span>
                    <span className="text-sm font-bold text-stone-900 font-serif-display">Top-Rated Specialists On Call</span>
                  </div>
                  <div className="flex items-center gap-1 bg-[#0F4C5C]/10 text-[#0F4C5C] px-2.5 py-1 rounded-xl text-xs font-semibold">
                    <Star className="w-3.5 h-3.5 fill-[#0F4C5C]" />
                    <span>4.9 / 5.0</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* THREE ADJACENT PROOF METRICS (Claim-to-Proof Adjacency) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-2xs">
            <span className="text-3xl font-bold font-serif-display text-[#0F4C5C] font-mono tabular-nums block">
              1,840+
            </span>
            <h4 className="text-sm font-semibold text-stone-900 mt-1">Verified Visits Completed</h4>
            <p className="text-xs text-stone-500 mt-1">Full post-repair diagnostic checklists signed off by verified homeowners.</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-2xs">
            <span className="text-3xl font-bold font-serif-display text-[#E36414] font-mono tabular-nums block">
              &lt; 45 mins
            </span>
            <h4 className="text-sm font-semibold text-stone-900 mt-1">Average Dispatch Confirmation</h4>
            <p className="text-xs text-stone-500 mt-1">Specialists lock your date and slot directly into their synced mobile schedules.</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-2xs">
            <span className="text-3xl font-bold font-serif-display text-teal-800 font-mono tabular-nums block">
              ₹0
            </span>
            <h4 className="text-sm font-semibold text-stone-900 mt-1">Hidden Doorstep Surcharges</h4>
            <p className="text-xs text-stone-500 mt-1">Fixed ₹149 visit fee + rate-card estimate with 18% GST. No arbitrary arrival charges.</p>
          </div>
        </div>
      </section>

      {/* CORE CAPABILITIES / SERVICES BENTO GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-semibold text-[#0F4C5C] uppercase tracking-wider mb-1">
              Popular Categories
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif-display text-stone-900">
              Essential Home Care Services
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('services')}
            className="text-xs font-semibold text-[#0F4C5C] hover:text-[#0A3642] flex items-center gap-1 group self-start sm:self-auto cursor-pointer"
          >
            <span>View All 8 Categories</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {services.slice(0, 8).map(service => (
              <div
                key={service._id}
                onClick={() => onNavigate('service-detail', service._id)}
                className="bg-white rounded-[20px] p-5 border border-stone-200/80 hover:border-stone-300 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl w-10 h-10 rounded-xl bg-stone-50 flex items-center justify-center border border-stone-100 group-hover:scale-110 transition-transform">
                      {service.icon}
                    </span>
                    <span className="text-xs font-semibold text-[#0F4C5C] font-mono tabular-nums">
                      From {formatCurrency(service.basePrice)}
                    </span>
                  </div>

                  <h3 className="font-semibold text-stone-900 text-sm group-hover:text-[#0F4C5C] transition-colors leading-snug">
                    {service.name}
                  </h3>

                  <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">
                    {service.description}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-400">
                  <span>~{service.duration} mins</span>
                  <span className="font-semibold text-[#E36414] group-hover:translate-x-0.5 transition-transform flex items-center">
                    Book <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* FEATURED VETTED SPECIALISTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-semibold text-[#0F4C5C] uppercase tracking-wider mb-1">
              Local Craftspeople
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif-display text-stone-900">
              Meet Top-Rated Specialists
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('providers')}
            className="text-xs font-semibold text-[#0F4C5C] hover:text-[#0A3642] flex items-center gap-1 group self-start sm:self-auto cursor-pointer"
          >
            <span>Browse All Specialists</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {providers.slice(0, 3).map(prov => (
            <ProviderCard
              key={prov._id}
              provider={prov}
              onBookNow={() => onNavigate('book', { providerId: prov._id })}
              onSelect={() => onNavigate('providers')}
            />
          ))}
        </div>
      </section>

      {/* HOW IT WORKS / MECHANISM (Proposition -> Mechanism -> Action) */}
      <section className="bg-stone-900 text-white py-16 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 rounded-3xl">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-semibold text-[#E36414] uppercase tracking-wider">The Standard</span>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif-display mt-1">
              How HomeHaven Works
            </h2>
            <p className="text-xs text-stone-400 mt-2">
              Four transparent steps to hassle-free repairs and home maintenance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-5 bg-stone-800/60 rounded-2xl border border-stone-800 space-y-3">
              <span className="text-2xl font-bold font-serif-display text-[#E36414]">01</span>
              <h3 className="font-semibold text-white text-sm">Select Service or Issue</h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                Describe your symptom or pick from 8 verified service categories with guaranteed checklists.
              </p>
            </div>

            <div className="p-5 bg-stone-800/60 rounded-2xl border border-stone-800 space-y-3">
              <span className="text-2xl font-bold font-serif-display text-[#E36414]">02</span>
              <h3 className="font-semibold text-white text-sm">Pick Vetted Specialist</h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                Compare verified reviews, trust score badges, and neighborhood history to find the perfect match.
              </p>
            </div>

            <div className="p-5 bg-stone-800/60 rounded-2xl border border-stone-800 space-y-3">
              <span className="text-2xl font-bold font-serif-display text-[#E36414]">03</span>
              <h3 className="font-semibold text-white text-sm">Lock Conflict-Free Slot</h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                Choose from real-time available time chips. Double bookings are blocked automatically.
              </p>
            </div>

            <div className="p-5 bg-stone-800/60 rounded-2xl border border-stone-800 space-y-3">
              <span className="text-2xl font-bold font-serif-display text-[#E36414]">04</span>
              <h3 className="font-semibold text-white text-sm">Track & Pay on Sign-Off</h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                Follow the live status timeline as your technician is dispatched. Pay only once work is approved.
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <button
              type="button"
              onClick={() => onNavigate('book')}
              className="px-8 py-3.5 bg-[#E36414] hover:bg-[#C5530E] text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-[#E36414]/25 inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Schedule Service Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
