'use client';

import { useMemo, useRef, useEffect, useState } from 'react';

interface BalanceChartProps {
  transactions: Array<{
    id: number | string;
    amount: number;
    type: 'income' | 'expense';
    date: string | number;
  }>;
  days?: number;
}

export default function BalanceChart({ transactions, days = 30 }: BalanceChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 200 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height: 200 });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const { data, isPositiveTrend } = useMemo(() => {
    const sorted = [...transactions].sort((a, b) => {
      const dateA = typeof a.date === 'number' ? a.date : new Date(a.date).getTime();
      const dateB = typeof b.date === 'number' ? b.date : new Date(b.date).getTime();
      return dateA - dateB;
    });
    
    const dateMap = new Map<string, number>();
    
    let runningBalance = 0;
    for (const tx of sorted) {
      runningBalance += tx.type === 'income' ? tx.amount : -tx.amount;
      const dateKey = typeof tx.date === 'number' 
        ? new Date(tx.date).toISOString().split('T')[0]
        : tx.date.split('T')[0];
      dateMap.set(dateKey, runningBalance);
    }
    
    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - days);
    
    const chartData: number[] = [];
    let lastBalance = 0;
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateKey = d.toISOString().split('T')[0];
      const balance = dateMap.get(dateKey);
      if (balance !== undefined) {
        lastBalance = balance;
      }
      chartData.push(lastBalance);
    }
    
    const firstNonZero = chartData.find(d => d !== 0);
    const lastPoint = chartData[chartData.length - 1];
    const trend = firstNonZero ? lastPoint - firstNonZero : 0;
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

  const maxValue = Math.max(...data, 0);
  const minValue = Math.min(...data, 0);
  const range = maxValue - minValue || 1;

  const chartHeight = dimensions.height * 0.8;
  const chartPadding = dimensions.height * 0.1;

  const getY = (value: number) => dimensions.height - ((value - minValue) / range) * chartHeight - chartPadding;
  const getX = (index: number) => (index / (data.length - 1)) * dimensions.width;

  // Create segments with individual colors based on trend
  const segments = [];
  for (let i = 0; i < data.length - 1; i++) {
    const x1 = getX(i);
    const y1 = getY(data[i]);
    const x2 = getX(i + 1);
    const y2 = getY(data[i + 1]);
    const isGoingUp = data[i + 1] >= data[i];
    const segmentColor = isGoingUp ? '#0EA5E9' : '#F43F5E';
    
    segments.push({
      key: i,
      x1, y1, x2, y2,
      color: segmentColor,
      isGoingUp
    });
  }

  // Create points string for area fill
  const points = data.map((value, index) => `${getX(index)},${getY(value)}`).join(' ');

  return (
    <div ref={containerRef} className="w-full">
      <svg width={dimensions.width} height={dimensions.height} className="overflow-visible">
        <defs>
          <linearGradient id="areaGradientUp" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0EA5E9" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#0EA5E9" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="areaGradientDown" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F43F5E" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#F43F5E" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Area fill - split into segments */}
        {segments.map((segment) => {
          const gradientId = segment.isGoingUp ? 'areaGradientUp' : 'areaGradientDown';
          return (
            <polygon
              key={`area-${segment.key}`}
              points={`${segment.x1},${dimensions.height} ${segment.x1},${segment.y1} ${segment.x2},${segment.y2} ${segment.x2},${dimensions.height}`}
              fill={`url(#${gradientId})`}
              opacity="0.5"
            />
          );
        })}

        {/* Line segments with individual colors */}
        {segments.map((segment) => (
          <line
            key={`line-${segment.key}`}
            x1={segment.x1}
            y1={segment.y1}
            x2={segment.x2}
            y2={segment.y2}
            stroke={segment.color}
            strokeWidth="2"
            strokeLinecap="round"
          />
        ))}

        {/* Data points */}
        {data.map((value, index) => {
          const x = getX(index);
          const y = getY(value);
          const prevValue = index > 0 ? data[index - 1] : value;
          const isUp = value >= prevValue;
          const pointColor = isUp ? '#0EA5E9' : '#F43F5E';
          
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="3"
              fill={pointColor}
              opacity="0.9"
            />
          );
        })}
      </svg>
    </div>
  );
}
