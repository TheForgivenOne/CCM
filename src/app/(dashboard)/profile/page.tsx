'use client';

import { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import ThemeToggle from '@/components/theme/toggle';

interface User {
  id: number;
  email: string;
  company_name?: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-pulse text-zinc-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-heading text-zinc-900 dark:text-white mb-2">
          Profile
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          Manage your account settings
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <h2 className="text-lg font-heading text-zinc-900 dark:text-white mb-4">
            Account Information
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-zinc-100 dark:border-zinc-800">
              <span className="text-zinc-500 dark:text-zinc-400">Email</span>
              <span className="font-medium text-zinc-900 dark:text-white">{user?.email}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-zinc-100 dark:border-zinc-800">
              <span className="text-zinc-500 dark:text-zinc-400">Company</span>
              <span className="font-medium text-zinc-900 dark:text-white">
                {user?.company_name || 'Not set'}
              </span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-zinc-500 dark:text-zinc-400">Account ID</span>
              <span className="font-mono text-sm text-zinc-400">#{user?.id}</span>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-heading text-zinc-900 dark:text-white mb-4">
            Appearance
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-zinc-900 dark:text-white">Theme</p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Toggle between light and dark mode</p>
            </div>
            <ThemeToggle />
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-heading text-zinc-900 dark:text-white mb-4">
            Danger Zone
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
            Sign out of your account on this device.
          </p>
          <Button variant="danger" onClick={handleLogout}>
            Sign Out
          </Button>
        </Card>

        <div className="text-center py-8">
          <p className="text-sm text-zinc-400">
            Calculated Cash Management v1.0
          </p>
          <p className="text-xs text-zinc-500 mt-1">
            Your AI-Powered Business Accountant
          </p>
        </div>
      </div>
    </div>
  );
}
