'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';

interface TransactionFormProps {
  onSuccess?: () => void;
}

const defaultIncomeCategories = ['Salary', 'Freelance', 'Investments', 'Other Income'];
const defaultExpenseCategories = ['Rent', 'Utilities', 'Food', 'Transport', 'Entertainment', 'Shopping', 'Health', 'Other'];

const recurrenceOptions = [
  { value: '', label: 'One-time' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

export default function TransactionForm({ onSuccess }: TransactionFormProps) {
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [recurring, setRecurring] = useState('');
  const [recurringEnd, setRecurringEnd] = useState('');
  const [categories, setCategories] = useState<string[]>(defaultExpenseCategories);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/settings', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (data.settings) {
          const cats = type === 'income' 
            ? data.settings.income_categories 
            : data.settings.expense_categories;
          setCategories(cats || (type === 'income' ? defaultIncomeCategories : defaultExpenseCategories));
        }
      } catch (err) {
        setCategories(type === 'income' ? defaultIncomeCategories : defaultExpenseCategories);
      }
    };

    fetchCategories();
  }, [type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          amount,
          type,
          category,
          description,
          date,
          recurring: recurring || null,
          recurring_end: recurringEnd || null
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to add transaction');
      }

      setAmount('');
      setCategory('');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
      setRecurring('');
      setRecurringEnd('');
      
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add transaction');
    } finally {
      setIsLoading(false);
    }
  };

  const categoryOptions = categories.map(cat => ({ value: cat, label: cat }));

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
        <button
          type="button"
          onClick={() => setType('expense')}
          className={`flex-1 py-2 rounded-md font-medium text-sm transition-all ${
            type === 'expense'
              ? 'bg-[#F43F5E] text-white shadow-sm'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
          }`}
        >
          Expense
        </button>
        <button
          type="button"
          onClick={() => setType('income')}
          className={`flex-1 py-2 rounded-md font-medium text-sm transition-all ${
            type === 'income'
              ? 'bg-[#10B981] text-white shadow-sm'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
          }`}
        >
          Income
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Amount"
          type="number"
          step="0.01"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          required
        />

        <Select
          label="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          options={[{ value: '', label: 'Select' }, ...categoryOptions]}
          required
        />
      </div>

      <Input
        label="Description"
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="What's this for?"
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />

        <Select
          label="Repeat"
          value={recurring}
          onChange={(e) => setRecurring(e.target.value)}
          options={recurrenceOptions}
        />
      </div>

      {recurring && (
        <Input
          label="Until"
          type="date"
          value={recurringEnd}
          onChange={(e) => setRecurringEnd(e.target.value)}
        />
      )}

      {error && (
        <p className="text-sm text-[#F43F5E]">{error}</p>
      )}

      <Button
        type="submit"
        className="w-full"
        variant={type === 'income' ? 'success' : 'danger'}
        disabled={isLoading}
      >
        {isLoading ? 'Adding...' : type === 'income' ? 'Add Income' : 'Add Expense'}
      </Button>
    </form>
  );
}
