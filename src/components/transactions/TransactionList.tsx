'use client';

import { useState } from 'react';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';

interface Transaction {
  id: number;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description: string;
  date: string;
  recurring?: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly' | null;
  recurring_end?: string | null;
  parent_id?: number | null;
}

interface TransactionListProps {
  transactions: Transaction[];
  onUpdate?: (transaction: Transaction) => void;
  onDelete?: (id: number) => void;
}

const defaultCategories = {
  income: ['Salary', 'Freelance', 'Investments', 'Other Income'],
  expense: ['Rent', 'Utilities', 'Food', 'Transport', 'Entertainment', 'Shopping', 'Health', 'Other'],
};

export default function TransactionList({ transactions, onUpdate, onDelete }: TransactionListProps) {
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editForm, setEditForm] = useState({
    amount: '',
    type: 'expense' as 'income' | 'expense',
    category: '',
    description: '',
    date: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  const filtered = transactions
    .filter(t => filter === 'all' || t.type === filter)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleEdit = (tx: Transaction) => {
    setEditingTransaction(tx);
    setEditForm({
      amount: tx.amount.toString(),
      type: tx.type,
      category: tx.category,
      description: tx.description || '',
      date: tx.date.split('T')[0],
    });
  };

  const handleSaveEdit = async () => {
    if (!editingTransaction) return;
    
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/transactions/${editingTransaction.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });

      if (!res.ok) throw new Error('Failed to update');

      const data = await res.json();
      if (onUpdate) onUpdate(data.transaction);
      setEditingTransaction(null);
    } catch (err) {
      console.error('Error updating transaction:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const categoryOptions = (editForm.type === 'income' ? defaultCategories.income : defaultCategories.expense)
    .map(cat => ({ value: cat, label: cat }));

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-400">No transactions yet</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {(['all', 'income', 'expense'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filter === f
                ? 'bg-[#0EA5E9] text-white'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map((tx) => (
          <div
            key={tx.id}
            className="glass rounded-xl p-4 flex items-center justify-between hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <Badge variant={tx.type}>
                {tx.type === 'income' ? 'IN' : 'OUT'}
              </Badge>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-zinc-900 dark:text-white truncate">
                    {tx.category}
                  </p>
                  {tx.recurring && (
                    <span className="text-xs bg-[#0EA5E9]/20 text-[#0EA5E9] px-1.5 py-0.5 rounded">
                      {tx.recurring}
                    </span>
                  )}
                  {tx.parent_id && (
                    <span className="text-xs bg-[#0EA5E9]/20 text-[#0EA5E9] px-1.5 py-0.5 rounded">
                      recurring
                    </span>
                  )}
                </div>
                <p className="text-sm text-zinc-400 truncate">
                  {tx.description || '—'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className={`font-mono font-medium ${
                  tx.type === 'income' ? 'text-[#10B981]' : 'text-[#F43F5E]'
                }`}>
                  {tx.type === 'income' ? '+' : '-'}${tx.amount.toFixed(2)}
                </p>
                <p className="text-xs text-zinc-400">
                  {new Date(tx.date).toLocaleDateString()}
                </p>
              </div>

              <div className="flex gap-1">
                <button
                  onClick={() => handleEdit(tx)}
                  className="p-2 text-zinc-400 hover:text-[#0EA5E9] transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                {onDelete && (
                  <button
                    onClick={() => onDelete(tx.id)}
                    className="p-2 text-zinc-400 hover:text-[#F43F5E] transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={!!editingTransaction}
        onClose={() => setEditingTransaction(null)}
        title="Edit Transaction"
      >
        <div className="space-y-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setEditForm({ ...editForm, type: 'expense', category: '' })}
              className={`flex-1 py-2.5 rounded-lg font-medium transition-all ${
                editForm.type === 'expense'
                  ? 'bg-[#F43F5E] text-white'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setEditForm({ ...editForm, type: 'income', category: '' })}
              className={`flex-1 py-2.5 rounded-lg font-medium transition-all ${
                editForm.type === 'income'
                  ? 'bg-[#10B981] text-white'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
              }`}
            >
              Income
            </button>
          </div>

          <Input
            label="Amount"
            type="number"
            step="0.01"
            min="0"
            value={editForm.amount}
            onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
            placeholder="0.00"
          />

          <Select
            label="Category"
            value={editForm.category}
            onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
            options={[{ value: '', label: 'Select category' }, ...categoryOptions]}
          />

          <Input
            label="Description"
            type="text"
            value={editForm.description}
            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
            placeholder="What's this for?"
          />

          <Input
            label="Date"
            type="date"
            value={editForm.date}
            onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
          />

          <div className="flex gap-3 pt-2">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setEditingTransaction(null)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleSaveEdit}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
