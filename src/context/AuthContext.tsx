import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client.js';

export interface UserAddress {
  _id?: string;
  label: string;
  line: string;
  city: string;
  pincode: string;
  lat?: number;
  lng?: number;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'provider' | 'admin';
  avatar: string;
  addresses: UserAddress[];
  isApproved: boolean;
  createdAt: string;
}

export interface ProviderProfile {
  _id: string;
  userId: string;
  services: string[];
  experience: number;
  rating: number;
  reviewCount: number;
  jobsDone: number;
  trustScore: number;
  availability: {
    days: number[];
    slots: string[];
  };
  city: string;
  bio: string;
}

interface AuthContextType {
  user: User | null;
  rememberedName: string;
  provider: ProviderProfile | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  updateAddresses: (addresses: UserAddress[]) => Promise<void>;
  refreshUser: () => Promise<void>;
  updateRememberedName: (name: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [rememberedName, setRememberedName] = useState<string>(() => {
    return localStorage.getItem('homehaven_remembered_name') || 'Ananya Iyer';
  });
  const [provider, setProvider] = useState<ProviderProfile | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('homehaven_token'));
  const [loading, setLoading] = useState<boolean>(true);

  const fetchCurrentUser = async () => {
    try {
      const storedToken = localStorage.getItem('homehaven_token');
      if (!storedToken) {
        setUser(null);
        setProvider(null);
        setLoading(false);
        return;
      }
      const res = await api.get('/api/auth/me');
      if (res.success && res.user) {
        setUser(res.user);
        setProvider(res.provider || null);
        setRememberedName(res.user.name);
        localStorage.setItem('homehaven_remembered_name', res.user.name);
      } else {
        localStorage.removeItem('homehaven_token');
        setToken(null);
        setUser(null);
      }
    } catch {
      localStorage.removeItem('homehaven_token');
      setToken(null);
      setUser(null);
      setProvider(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post('/api/auth/login', { email, password });
    if (res.success && res.token) {
      localStorage.setItem('homehaven_token', res.token);
      setToken(res.token);
      setUser(res.user);
      setRememberedName(res.user.name);
      localStorage.setItem('homehaven_remembered_name', res.user.name);
      await fetchCurrentUser();
    }
  };

  const register = async (data: any) => {
    const res = await api.post('/api/auth/register', data);
    if (res.success && res.token) {
      localStorage.setItem('homehaven_token', res.token);
      setToken(res.token);
      setUser(res.user);
      setRememberedName(res.user.name);
      localStorage.setItem('homehaven_remembered_name', res.user.name);
      await fetchCurrentUser();
    }
  };

  const logout = () => {
    localStorage.removeItem('homehaven_token');
    setToken(null);
    setUser(null);
    setProvider(null);
  };

  const updateAddresses = async (addresses: UserAddress[]) => {
    const res = await api.put('/api/auth/profile', { addresses });
    if (res.success && res.user) {
      setUser(res.user);
    }
  };

  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  const updateRememberedName = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setRememberedName(trimmed);
    localStorage.setItem('homehaven_remembered_name', trimmed);
    if (user) {
      setUser({ ...user, name: trimmed });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        rememberedName,
        provider,
        token,
        loading,
        login,
        register,
        logout,
        updateAddresses,
        refreshUser,
        updateRememberedName
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
