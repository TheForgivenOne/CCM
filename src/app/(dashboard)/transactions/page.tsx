'use client';

import { useEffect, useState } from 'react';
import TransactionForm from '@/components/transactions/TransactionForm';
import TransactionList from '@/components/transactions/TransactionList';
import Card from '@/components/ui/Card';

interface Transaction {
  id: number | string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description: string;
  date: string;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/transactions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setTransactions(data.transactions || []);
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleDelete = async (id: number | string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;

    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      setTransactions(transactions.filter(t => t.id !== id));
    } catch (err) {
      console.error('Error deleting transaction:', err);
    }
  };

  const handleUpdate = (updatedTransaction: Transaction) => {
    setTransactions(transactions.map(t => 
      t.id === updatedTransaction.id ? updatedTransaction : t
    ));
  };

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-heading text-zinc-900 dark:text-white mb-1">
          Transactions
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Track your income and expenses
        </p>
      </div>

      <div className="space-y-6">
        <Card className="p-4">
          <TransactionForm onSuccess={fetchTransactions} />
        </Card>

        <div>
          <h2 className="text-lg font-heading text-zinc-900 dark:text-white mb-4">
            History
          </h2>
          {isLoading ? (
            <div className="text-center py-12 text-zinc-400">Loading...</div>
          ) : (
            <TransactionList 
              transactions={transactions} 
              onDelete={handleDelete}
              onUpdate={handleUpdate}
            />
          )}
        </div>
      </div>
    </div>
  );
}
