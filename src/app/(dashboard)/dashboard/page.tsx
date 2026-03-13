'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import BalanceDisplay from '@/components/dashboard/BalanceDisplay';
import BalanceChart from '@/components/dashboard/BalanceChart';
import StatCard from '@/components/dashboard/StatCard';
import AISummaryCard from '@/components/dashboard/AISummaryCard';
import Badge from '@/components/ui/Badge';

interface Transaction {
  id: number | string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description: string;
  date: string | number;
}

interface DashboardData {
  balance: number;
  allTimeHigh: number;
  totalIncome: number;
  totalExpenses: number;
  transactions: Transaction[];
  recentTransactions: Transaction[];
  aiInsight?: {
    title: string;
    description: string;
  };
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        const [transactionsRes, settingsRes] = await Promise.all([
          fetch('/api/transactions', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch('/api/settings', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        const transactionsData = await transactionsRes.json();
        await settingsRes.json();

        const transactions = transactionsData.transactions || [];
        
        const totalIncome = transactions
          .filter((t: Transaction) => t.type === 'income')
          .reduce((sum: number, t: Transaction) => sum + t.amount, 0);
        
        const totalExpenses = transactions
          .filter((t: Transaction) => t.type === 'expense')
          .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

        const balance = totalIncome - totalExpenses;
        
        const sortedByDate = [...transactions].sort((a, b) => {
          const dateA = typeof a.date === 'number' ? a.date : new Date(a.date).getTime();
          const dateB = typeof b.date === 'number' ? b.date : new Date(b.date).getTime();
          return dateA - dateB;
        });
        let runningBalance = 0;
        let allTimeHigh = 0;
        for (const t of sortedByDate) {
          runningBalance += t.type === 'income' ? t.amount : -t.amount;
          if (runningBalance > allTimeHigh) allTimeHigh = runningBalance;
        }

        const recentTransactions = transactions.slice(0, 5);

        setData({
          balance,
          allTimeHigh,
          totalIncome,
          totalExpenses,
          transactions,
          recentTransactions,
          aiInsight: {
            title: 'AI Insights Ready',
            description: 'Click to get personalized financial advice and strategy recommendations.'
          }
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-pulse text-zinc-400">Loading...</div>
      </div>
    );
  }

  const isNewRecord = !!(data && data.balance > data.allTimeHigh && data.balance > 0);

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-heading text-zinc-900 dark:text-white mb-2">
          Dashboard
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          Your financial overview at a glance
        </p>
      </div>

      <div className="space-y-6">
        <BalanceDisplay 
          amount={data?.balance || 0} 
          isNewRecord={isNewRecord} 
        />

        <div className="glass rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm text-zinc-500 dark:text-zinc-400">Balance History (30 days)</h3>
          </div>
          <BalanceChart transactions={data?.transactions || []} />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <StatCard 
            label="Income" 
            amount={data?.totalIncome || 0} 
            type="income" 
          />
          <StatCard 
            label="Expenses" 
            amount={data?.totalExpenses || 0} 
            type="expense" 
          />
          <StatCard 
            label="Net" 
            amount={(data?.totalIncome || 0) - (data?.totalExpenses || 0)} 
            type="net" 
          />
        </div>

        <AISummaryCard 
          title={data?.aiInsight?.title || 'AI Insights'}
          description={data?.aiInsight?.description || 'Loading insights...'}
        />

        <div className="glass rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-heading text-zinc-900 dark:text-white">
              Recent Transactions
            </h2>
            <Link 
              href="/transactions"
              className="text-sm text-[#0EA5E9] hover:text-[#0284C7] font-medium"
            >
              View All
            </Link>
          </div>

          {data?.recentTransactions && data.recentTransactions.length > 0 ? (
            <div className="space-y-3">
              {data.recentTransactions.map((tx, index) => (
                <div 
                  key={`recent-${String(tx.id)}-${index}`}
                  className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant={tx.type}>
                      {tx.type === 'income' ? '+' : '-'}
                    </Badge>
                    <div>
                      <p className="text-sm font-medium text-zinc-900 dark:text-white">
                        {tx.category}
                      </p>
                      <p className="text-xs text-zinc-400">
                        {tx.description || 'No description'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-mono text-sm ${tx.type === 'income' ? 'text-[#10B981]' : 'text-[#F43F5E]'}`}>
                      {tx.type === 'income' ? '+' : '-'}${tx.amount.toFixed(2)}
                    </p>
                    <p className="text-xs text-zinc-400">
                      {new Date(typeof tx.date === 'number' ? tx.date : tx.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-zinc-400 py-8">
              No transactions yet. 
              <Link href="/transactions" className="text-[#0EA5E9] ml-1">
                Add your first transaction
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
