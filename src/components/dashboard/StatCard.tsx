'use client';

interface StatCardProps {
  label: string;
  amount: number;
  type: 'income' | 'expense' | 'net';
}

export default function StatCard({ label, amount, type }: StatCardProps) {
  const colors = {
    income: 'text-[#10B981]',
    expense: 'text-[#F43F5E]',
    net: amount >= 0 ? 'text-[#10B981]' : 'text-[#F43F5E]',
  };

  const glows = {
    income: 'glow-green',
    expense: 'glow-red',
    net: amount >= 0 ? 'glow-green' : 'glow-red',
  };

  return (
    <div className={`glass rounded-xl p-4 ${glows[type]} transition-all duration-300`}>
      <p className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
        {label}
      </p>
      <p className={`text-2xl font-mono font-medium ${colors[type]}`}>
        {type === 'expense' && '-'}
        ${Math.abs(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </p>
    </div>
  );
}
