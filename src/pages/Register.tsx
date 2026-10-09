import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { showToast } from '../hooks/useToast.js';
import { Wrench, ArrowRight } from 'lucide-react';

interface RegisterProps {
  onNavigate: (tab: string, param?: any) => void;
}

export const Register: React.FC<RegisterProps> = ({ onNavigate }) => {
  const { register } = useAuth();
  const [role, setRole] = useState<'customer' | 'provider'>('customer');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Bengaluru');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      showToast('Please fill in required fields', 'error');
      return;
    }

    setLoading(true);
    try {
      await register({
        name,
        email,
        password,
        phone,
        role,
        city,
        bio
      });
      showToast(
        role === 'provider'
          ? 'Specialist account created! Your profile is submitted for verification.'
          : `Welcome, ${name}! Your account is active.`,
        'success'
      );
      if (role === 'provider') onNavigate('provider-dashboard');
      else onNavigate('customer-dashboard');
    } catch (err: any) {
      showToast(err.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-10 px-4">
      <div className="bg-white rounded-[24px] border border-stone-200/90 p-8 shadow-sm space-y-6">
        
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-[#0F4C5C] text-white flex items-center justify-center mx-auto shadow-xs">
            <Wrench className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold font-serif-display text-stone-900">
            Create an Account
          </h2>
          <p className="text-xs text-stone-500">
            Join India's trusted home service specialist platform
          </p>
        </div>

        {/* Role toggle */}
        <div className="flex p-1 bg-stone-100 rounded-xl">
          <button
            type="button"
            onClick={() => setRole('customer')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              role === 'customer'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            I Need Home Services
          </button>
          <button
            type="button"
            onClick={() => setRole('provider')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              role === 'provider'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            I am a Specialist
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-stone-700">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Ananya Iyer or Rajesh Sharma"
              required
              className="w-full text-xs p-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-[#0F4C5C]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-stone-700">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="e.g. ananya@example.com"
              required
              className="w-full text-xs p-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-[#0F4C5C]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-stone-700">Mobile Number (10 digits)</label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full text-xs p-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-[#0F4C5C]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-stone-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              required
              className="w-full text-xs p-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-[#0F4C5C]"
            />
          </div>

          {role === 'provider' && (
            <>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-700">Operating City</label>
                <select
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-[#0F4C5C] bg-white"
                >
                  <option value="Bengaluru">Bengaluru</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Hyderabad">Hyderabad</option>
                  <option value="Delhi NCR">Delhi NCR</option>
                  <option value="Pune">Pune</option>
                  <option value="Chennai">Chennai</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-700">Trade Certifications & Bio</label>
                <textarea
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  rows={2}
                  placeholder="Detail your ITI certification, years of experience, and tools..."
                  className="w-full text-xs p-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-[#0F4C5C]"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#0F4C5C] hover:bg-[#0A3642] text-white rounded-xl text-xs font-semibold transition-all shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            <span>{loading ? 'Registering Account...' : 'Register Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-stone-100 text-xs text-stone-500">
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => onNavigate('login')}
            className="text-[#0F4C5C] font-semibold hover:underline cursor-pointer"
          >
            Sign in
          </button>
        </div>

      </div>
    </div>
  );
};
