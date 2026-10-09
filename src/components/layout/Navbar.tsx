import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { Wrench, User, LogOut, Menu, X, Shield, Calendar, Layers, MapPin } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string, param?: any) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onNavigate }) => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const navLinks = [
    { id: 'services', label: 'Services' },
    { id: 'providers', label: 'Specialists' },
    { id: 'book', label: 'Book Service' },
    ...(user ? [{ id: 'my-bookings', label: 'My Bookings' }] : []),
    ...(user?.role === 'customer' ? [{ id: 'home-profile', label: 'My Addresses' }] : []),
    ...(user?.role === 'admin' ? [{ id: 'admin-dashboard', label: 'Admin Hub' }] : []),
    ...(user?.role === 'provider' ? [{ id: 'provider-dashboard', label: 'Specialist Hub' }] : [])
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FBF7F0]/95 backdrop-blur-md border-b border-stone-200/80">
      {/* 3-Zone Top Bar Contract */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-8">
        
        {/* Zone 1: Single text element wordmark */}
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2.5 text-left text-xl font-bold tracking-tight text-[#0F4C5C] font-serif-display whitespace-nowrap shrink-0 group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-[#0F4C5C] text-white flex items-center justify-center shadow-xs group-hover:bg-[#0A3642] transition-colors">
            <Wrench className="w-4 h-4" />
          </div>
          <span className="text-2xl font-bold font-serif-display">HomeHaven</span>
        </button>

        {/* Zone 2: 4-5 single-line clean text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-stone-600">
          {navLinks.slice(0, 5).map(link => {
            const isActive = currentTab === link.id;
            return (
              <button
                key={link.id}
                type="button"
                onClick={() => onNavigate(link.id)}
                className={`whitespace-nowrap shrink-0 py-1 transition-colors relative cursor-pointer ${
                  isActive ? 'text-[#0F4C5C] font-semibold' : 'hover:text-[#0F4C5C]'
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0F4C5C] rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 Primary Action / User Account */}
        <div className="flex items-center gap-3 shrink-0">
          {user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 pl-3 rounded-full border border-stone-200 bg-white hover:border-stone-300 transition-all cursor-pointer shadow-2xs"
              >
                <span className="text-xs font-semibold text-stone-800 hidden sm:inline-block max-w-[130px] truncate">
                  {user.name}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#0F4C5C]/10 text-[#0F4C5C] font-semibold uppercase tracking-wide">
                  {user.role}
                </span>
                <img
                  src={user.avatar}
                  alt={user.name}
                  referrerPolicy="no-referrer"
                  className="w-7 h-7 rounded-full object-cover bg-stone-100 border border-stone-200"
                />
              </button>

              {roleDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-stone-200 shadow-xl p-2 z-50 text-xs"
                  onMouseLeave={() => setRoleDropdownOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-stone-100 mb-1">
                    <p className="font-semibold text-stone-900 truncate">{user.name}</p>
                    <p className="text-stone-400 text-[11px] truncate">{user.email}</p>
                  </div>

                  {user.role === 'customer' && (
                    <>
                      <button
                        type="button"
                        onClick={() => { setRoleDropdownOpen(false); onNavigate('customer-dashboard'); }}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-stone-50 flex items-center gap-2"
                      >
                        <Calendar className="w-3.5 h-3.5 text-stone-500" />
                        <span>My Dashboard</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => { setRoleDropdownOpen(false); onNavigate('home-profile'); }}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-stone-50 flex items-center gap-2"
                      >
                        <MapPin className="w-3.5 h-3.5 text-stone-500" />
                        <span>Saved Addresses</span>
                      </button>
                    </>
                  )}

                  {user.role === 'provider' && (
                    <button
                      type="button"
                      onClick={() => { setRoleDropdownOpen(false); onNavigate('provider-dashboard'); }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-stone-50 flex items-center gap-2"
                    >
                      <Layers className="w-3.5 h-3.5 text-stone-500" />
                      <span>Specialist Hub</span>
                    </button>
                  )}

                  {user.role === 'admin' && (
                    <button
                      type="button"
                      onClick={() => { setRoleDropdownOpen(false); onNavigate('admin-dashboard'); }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-stone-50 flex items-center gap-2"
                    >
                      <Shield className="w-3.5 h-3.5 text-stone-500" />
                      <span>Admin Control Panel</span>
                    </button>
                  )}

                  <div className="border-t border-stone-100 my-1 pt-1">
                    <button
                      type="button"
                      onClick={() => { logout(); setRoleDropdownOpen(false); onNavigate('home'); }}
                      className="w-full text-left px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onNavigate('login')}
                className="px-3.5 py-2 text-xs font-medium text-stone-700 hover:text-[#0F4C5C] transition-colors whitespace-nowrap cursor-pointer"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => onNavigate('book')}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#0F4C5C] hover:bg-[#0A3642] rounded-xl transition-all shadow-xs whitespace-nowrap cursor-pointer"
              >
                Book a Service
              </button>
            </div>
          )}

          {/* Mobile hamburger button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-stone-600 hover:bg-stone-100 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-stone-200 px-4 pt-2 pb-5 space-y-2">
          {navLinks.map(link => (
            <button
              key={link.id}
              type="button"
              onClick={() => { onNavigate(link.id); setMobileMenuOpen(false); }}
              className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium ${
                currentTab === link.id
                  ? 'bg-[#0F4C5C]/10 text-[#0F4C5C] font-semibold'
                  : 'text-stone-700 hover:bg-stone-50'
              }`}
            >
              {link.label}
            </button>
          ))}
          {!user && (
            <div className="pt-2 border-t border-stone-100 flex gap-2">
              <button
                type="button"
                onClick={() => { onNavigate('login'); setMobileMenuOpen(false); }}
                className="flex-1 py-2 text-center text-xs font-semibold border border-stone-200 rounded-xl"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { onNavigate('register'); setMobileMenuOpen(false); }}
                className="flex-1 py-2 text-center text-xs font-semibold bg-[#0F4C5C] text-white rounded-xl"
              >
                Create Account
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
