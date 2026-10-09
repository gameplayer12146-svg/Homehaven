import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { showToast } from '../hooks/useToast.js';
import { Wrench, ArrowRight, ShieldCheck } from 'lucide-react';

interface LoginProps {
  onNavigate: (tab: string, param?: any) => void;
}

export const Login: React.FC<LoginProps> = ({ onNavigate }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please enter both email and password', 'error');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      showToast('Welcome back to HomeHaven!', 'success');
      onNavigate('customer-dashboard');
    } catch (err: any) {
      showToast(err.message || 'Login failed. Please check your credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <div className="bg-white rounded-[24px] border border-stone-200/90 p-8 shadow-sm space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#0F4C5C] text-white flex items-center justify-center mx-auto shadow-xs">
            <Wrench className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold font-serif-display text-stone-900">
            Sign In to HomeHaven
          </h2>
          <p className="text-xs text-stone-500">
            Secure login for customers, specialists, and administrators
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <label className="text-xs font-semibold text-stone-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full text-xs p-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-[#0F4C5C]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#0F4C5C] hover:bg-[#0A3642] text-white rounded-xl text-xs font-semibold transition-all shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="p-3 bg-stone-50 rounded-xl border border-stone-100 text-[11px] text-stone-500 space-y-1">
          <p className="font-semibold text-stone-700">Test Account Credentials:</p>
          <p>• Customer: <span className="font-mono text-stone-800">ananya@example.com</span> / <span className="font-mono">customer123</span></p>
          <p>• Specialist: <span className="font-mono text-stone-800">ajay@homehaven.in</span> / <span className="font-mono">provider123</span></p>
          <p>• Admin: <span className="font-mono text-stone-800">admin@homehaven.in</span> / <span className="font-mono">admin123</span></p>
        </div>

        <div className="text-center pt-2 border-t border-stone-100 text-xs text-stone-500">
          New to HomeHaven?{' '}
          <button
            type="button"
            onClick={() => onNavigate('register')}
            className="text-[#0F4C5C] font-semibold hover:underline cursor-pointer"
          >
            Create an account
          </button>
        </div>

      </div>
    </div>
  );
};
