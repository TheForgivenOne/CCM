'use client';

interface BalanceDisplayProps {
  amount: number;
  isNewRecord?: boolean;
}

export default function BalanceDisplay({ amount, isNewRecord }: BalanceDisplayProps) {
  return (
    <div className="relative">
      <div className={`text-center ${isNewRecord ? 'glow-green' : ''} rounded-2xl p-8 transition-all duration-500`}>
        <p className="text-sm uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-2">
          Current Balance
        </p>
        <p className={`text-5xl md:text-6xl font-mono font-medium ${amount >= 0 ? 'text-[#10B981]' : 'text-[#F43F5E]'}`}>
          ${Math.abs(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        {isNewRecord && (
          <p className="mt-3 text-sm text-[#10B981] font-medium animate-pulse">
            ✨ New All-Time High!
          </p>
        )}
      </div>
    </div>
  );
}
