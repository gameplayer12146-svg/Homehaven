import React from 'react';
import { Wrench, Shield, CheckCircle2, MapPin } from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: string, param?: any) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-stone-900 text-stone-300 mt-20 pt-16 pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-stone-800">
          
          {/* Col 1: Wordmark & Proposition */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-white font-serif-display text-xl font-bold">
              <div className="w-7 h-7 rounded-lg bg-[#E36414] text-white flex items-center justify-center">
                <Wrench className="w-3.5 h-3.5" />
              </div>
              <span>HomeHaven India</span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              Verified local technicians and craftspeople across Bengaluru, Mumbai, Hyderabad, and Delhi NCR. Standard rate cards, conflict-free scheduling, and guaranteed service.
            </p>
            <div className="flex items-center gap-2 text-xs text-stone-400">
              <Shield className="w-4 h-4 text-[#E36414]" />
              <span>Aadhaar & Background-Verified Specialists</span>
            </div>
          </div>

          {/* Col 2: Services */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">Popular Services</h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <button type="button" onClick={() => onNavigate('services', 'plumbing')} className="hover:text-white transition-colors cursor-pointer">
                  Plumbing Repair & Leak Fixing
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate('services', 'electrical')} className="hover:text-white transition-colors cursor-pointer">
                  Electrical Wiring & MCB Repairs
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate('services', 'cleaning')} className="hover:text-white transition-colors cursor-pointer">
                  Deep House Cleaning & Sanitization
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate('services', 'ac_repair')} className="hover:text-white transition-colors cursor-pointer">
                  Split AC Jet Pump Servicing
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate('services', 'painting')} className="hover:text-white transition-colors cursor-pointer">
                  Interior Accent Wall Painting
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate('services', 'pest_control')} className="hover:text-white transition-colors cursor-pointer">
                  Odorless Eco Gel Pest Control
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Cities Served */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">Service Hubs</h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-[#E36414]" /> Bengaluru (Koramangala, Indiranagar, HSR, Whitefield)</li>
              <li className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-[#E36414]" /> Mumbai (Bandra, Andheri, Powai, Juhu)</li>
              <li className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-[#E36414]" /> Hyderabad (Jubilee Hills, Gachibowli, Hitec City)</li>
              <li className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-[#E36414]" /> Delhi NCR (Gurugram, Noida, South Delhi)</li>
            </ul>
          </div>

          {/* Col 4: Platform Navigation */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">Quick Links</h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li><button type="button" onClick={() => onNavigate('providers')} className="hover:text-white cursor-pointer">Browse Vetted Specialists</button></li>
              <li><button type="button" onClick={() => onNavigate('book')} className="hover:text-white cursor-pointer">Book an Appointment</button></li>
              <li><button type="button" onClick={() => onNavigate('my-bookings')} className="hover:text-white cursor-pointer">My Bookings & Invoices</button></li>
              <li><button type="button" onClick={() => onNavigate('home-profile')} className="hover:text-white cursor-pointer">Saved Addresses Dossier</button></li>
              <li><button type="button" onClick={() => onNavigate('login')} className="hover:text-white cursor-pointer">Sign In to Account</button></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© {new Date().getFullYear()} HomeHaven India Services Private Limited. All prices inclusive of GST.</p>
          <div className="flex items-center gap-4">
            <span>Customer Safety Charter</span>
            <span>Terms & Conditions</span>
            <span>Privacy Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
