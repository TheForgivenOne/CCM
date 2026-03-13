'use client';

interface InsightCardProps {
  type: 'bad_habit' | 'passive_income' | 'investable_cash' | 'strategy';
  title: string;
  description: string;
  severity?: 'warning' | 'info' | 'success';
  action?: string;
  className?: string;
}

export default function InsightCard({ title, description, severity = 'info', action, className = '' }: InsightCardProps) {
  const severityStyles = {
    warning: {
      border: 'border-l-[#F59E0B]',
      bg: 'bg-[#F59E0B]/5',
      iconColor: 'text-[#F59E0B]',
      icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
    },
    success: {
      border: 'border-l-[#10B981]',
      bg: 'bg-[#10B981]/5',
      iconColor: 'text-[#10B981]',
      icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    },
    info: {
      border: 'border-l-[#0EA5E9]',
      bg: 'bg-[#0EA5E9]/5',
      iconColor: 'text-[#0EA5E9]',
      icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
    },
  };

  const style = severityStyles[severity];

  return (
    <div className={`glass rounded-xl p-5 border-l-4 ${style.border} ${style.bg} ${className}`}>
      <div className="flex items-start gap-4">
        <div className={`p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg ${style.iconColor}`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={style.icon} />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-zinc-900 dark:text-white">
            {title}
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            {description}
          </p>
          {action && (
            <p className="text-sm text-[#0EA5E9] mt-2 font-medium">
              {action}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
