'use client';

import { Line, Area, AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useMemo } from 'react';

interface BalanceDataPoint {
  date: string;
  balance: number;
}

interface BalanceChartProps {
  transactions: Array<{
    id: number;
    amount: number;
    type: 'income' | 'expense';
    date: string;
  }>;
  days?: number;
}

export default function BalanceChart({ transactions, days = 30 }: BalanceChartProps) {
  const { data, isPositiveTrend } = useMemo(() => {
    const sorted = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    const dateMap = new Map<string, number>();
    
    let runningBalance = 0;
    for (const tx of sorted) {
      runningBalance += tx.type === 'income' ? tx.amount : -tx.amount;
      dateMap.set(tx.date.split('T')[0], runningBalance);
    }
    
    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - days);
    
    const chartData: BalanceDataPoint[] = [];
    let lastBalance = 0;
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateKey = d.toISOString().split('T')[0];
      const balance = dateMap.get(dateKey);
      if (balance !== undefined) {
        lastBalance = balance;
      }
      chartData.push({
        date: dateKey,
        balance: lastBalance,
      });
    }
    
    const firstNonZero = chartData.find(d => d.balance !== 0);
    const lastPoint = chartData[chartData.length - 1];
    const trend = firstNonZero ? lastPoint.balance - firstNonZero.balance : 0;
    const isPositiveTrend = trend >= 0;
    
    return { data: chartData, isPositiveTrend };
  }, [transactions, days]);

  const lineColor = isPositiveTrend ? '#10B981' : '#F43F5E';

  if (data.length === 0) {
    return (
      <div className="w-full h-48 flex items-center justify-center text-zinc-400">
        <p>No data to display</p>
      </div>
    );
  }

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatBalance = (value: number | string) => {
    if (typeof value === 'undefined' || value === null || value === '') {
      return '$0.00';
    }
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(numValue);
  };

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={lineColor} stopOpacity={0.3} />
            <stop offset="95%" stopColor={lineColor} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(120, 120, 120, 0.1)" />
        <XAxis
          dataKey="date"
          tickFormatter={formatDate}
          stroke="#71717A"
          fontSize={11}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tickFormatter={formatBalance}
          stroke="#71717A"
          fontSize={11}
          tickLine={false}
          axisLine={false}
          width={80}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--card-border)',
            borderRadius: '8px',
            backdropFilter: 'blur(12px)',
          }}
          labelStyle={{ color: 'var(--foreground)', fontSize: '12px' }}
          formatter={(value) => formatBalance(value as number | string)}
          labelFormatter={(label) => formatDate(label as string)}
        />
        <Area
          type="monotone"
          dataKey="balance"
          stroke={lineColor}
          strokeWidth={2}
          fill="url(#balanceGradient)"
          animationDuration={1000}
          animationEasing="ease-out"
        />
        <Line
          type="monotone"
          dataKey="balance"
          stroke={lineColor}
          strokeWidth={2}
          dot={false}
          activeDot={{
            r: 6,
            fill: lineColor,
            stroke: 'var(--background)',
            strokeWidth: 2,
          }}
          animationDuration={1000}
          animationEasing="ease-out"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
