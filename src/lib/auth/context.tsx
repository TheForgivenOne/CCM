'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, companyName?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(() => {
    if (typeof window === 'undefined') return true;
    return !localStorage.getItem('token');
  });

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    
    if (!storedToken) {
      return;
    }

    fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${storedToken}` }
    })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Token invalid');
      })
      .then((data) => {
        setUser(data.user);
        setToken(storedToken);
      })
      .catch(() => {
        localStorage.removeItem('token');
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    
    localStorage.setItem('token', data.user ? `Bearer ${JSON.stringify(data)}` : '');
    setUser(data.user);
    setToken(localStorage.getItem('token'));
    window.location.href = '/dashboard';
  };

  const register = async (email: string, password: string, companyName?: string) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, companyName }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    
    window.location.href = '/login';
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
