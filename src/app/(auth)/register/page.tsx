'use client';

import { useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, companyName }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      window.location.href = '/login';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-heading text-zinc-900 dark:text-white mb-2">
            Calculated Cash
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Your AI-Powered Business Accountant
          </p>
        </div>

        <div className="glass rounded-2xl p-8">
          <h2 className="text-2xl font-heading text-zinc-900 dark:text-white mb-6">
            Create Account
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            <Input
              label="Company Name (Optional)"
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Your Business"
            />

            {error && (
              <p className="text-sm text-[#F43F5E]">{error}</p>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <p className="mt-6 text-center text-zinc-500 dark:text-zinc-400">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-[#0EA5E9] hover:text-[#0284C7] font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>

        <div className="mt-8 flex justify-center">
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-[#0EA5E9] to-transparent opacity-50" />
        </div>
      </div>
    </div>
  );
}
