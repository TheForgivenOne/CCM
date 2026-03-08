'use client';

import { useEffect, useState } from 'react';
import ThemeToggle from '@/components/theme/toggle';

interface User {
  id: number;
  email: string;
  company_name?: string;
}

export default function TopBar() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setUser(data.user);
      } catch (err) {
        console.error('Error fetching user:', err);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <header className="hidden lg:flex items-center justify-between px-8 py-4 bg-zinc-50 dark:bg-black border-b border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-[#0EA5E9] rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">CCM</span>
        </div>
        <span className="font-heading text-lg text-zinc-900 dark:text-white">
          {user?.company_name || 'Calculated Cash'}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <ThemeToggle />
        
        <div className="flex items-center gap-3 pl-4 border-l border-zinc-200 dark:border-zinc-800">
          <div className="w-8 h-8 bg-zinc-200 dark:bg-zinc-800 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
