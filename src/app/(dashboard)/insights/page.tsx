'use client';

import { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';

interface Insight {
  type: string;
  title: string;
  description: string;
  severity?: string;
  action?: string;
}

const defaultInsights: Insight[] = [
  {
    type: 'bad_habit',
    title: 'Add transactions to analyze habits',
    description: 'Start tracking your spending to identify patterns and receive personalized recommendations.',
    severity: 'info',
    action: 'Go to Transactions'
  },
  {
    type: 'passive_income',
    title: 'Unlock passive income suggestions',
    description: 'We need more financial data to suggest ways to generate passive income.',
    severity: 'info',
    action: 'Add your income sources'
  },
  {
    type: 'investable_cash',
    title: 'Build your balance to see opportunities',
    description: 'Once you have surplus cash, we can suggest investment strategies.',
    severity: 'info',
    action: 'Focus on increasing income'
  },
  {
    type: 'strategy',
    title: 'Welcome to Calculated Cash Management',
    description: 'Start by adding your income and expenses to get personalized financial strategy.',
    severity: 'info',
    action: 'Begin tracking transactions'
  }
];

export default function InsightsPage() {
  const [insights, setInsights] = useState<Insight[]>(defaultInsights);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/ai/insights', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        });
        const data = await res.json();
        
        if (data.insights && data.insights.length > 0) {
          setInsights(data.insights);
        }
      } catch (err) {
        console.error('Error fetching insights:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInsights();
  }, []);

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'warning': return 'border-l-[#F59E0B] bg-[#F59E0B]/5';
      case 'success': return 'border-l-[#10B981] bg-[#10B981]/5';
      default: return 'border-l-[#0EA5E9] bg-[#0EA5E9]/5';
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'bad_habit':
        return (
          <svg className="w-5 h-5 text-[#F59E0B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'passive_income':
        return (
          <svg className="w-5 h-5 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'investable_cash':
        return (
          <svg className="w-5 h-5 text-[#0EA5E9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-[#0EA5E9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        );
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-heading text-zinc-900 dark:text-white mb-2">
          AI Insights
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          Personalized financial analysis and recommendations
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-pulse text-zinc-400">Analyzing your finances...</div>
        </div>
      ) : (
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <Card 
              key={index}
              className={`border-l-4 ${getSeverityColor(insight.severity)}`}
            >
              <div className="flex items-start gap-4">
                <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                  {getIcon(insight.type)}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-zinc-900 dark:text-white">
                    {insight.title}
                  </h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                    {insight.description}
                  </p>
                  {insight.action && (
                    <p className="text-sm text-[#0EA5E9] mt-2 font-medium">
                      {insight.action}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-8 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl">
        <p className="text-xs text-zinc-400 text-center">
          Powered by Mistral AI • Analysis based on your transaction data
        </p>
      </div>
    </div>
  );
}
