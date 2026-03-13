import { NextResponse } from 'next/server';
import { Mistral } from '@mistralai/mistralai';
import { convex } from '@/lib/convex';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { verifyToken, getTokenFromCookies } from '@/lib/auth';

const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });

async function getUserFromToken() {
  const token = await getTokenFromCookies();
  if (!token) return null;
  return verifyToken(token);
}

export async function POST() {
  try {
    const payload = await getUserFromToken();
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = payload.userId as Id<"users">;
    const transactions = await convex.query(api.transactions.getByUser, { userId });
    const balance = await convex.query(api.transactions.getBalance, { userId });
    let settings = await convex.query(api.settings.getByUser, { userId });

    if (!settings) {
      await convex.mutation(api.settings.create, { userId });
      settings = await convex.query(api.settings.getByUser, { userId });
    }

    const incomeCategories = settings?.incomeCategories || [];
    const expenseCategories = settings?.expenseCategories || [];

    const recentTransactions = transactions.slice(0, 20);
    
    const incomeTotal = transactions
      .filter((t: { type: string }) => t.type === 'income')
      .reduce((sum: number, t: { amount: number }) => sum + t.amount, 0);
    
    const expenseTotal = transactions
      .filter((t: { type: string }) => t.type === 'expense')
      .reduce((sum: number, t: { amount: number }) => sum + t.amount, 0);

    const monthlyDates = new Set(transactions.map((t: { date: number }) => new Date(t.date).toISOString().substring(0, 7)));
    const monthlyExpenses = expenseTotal / Math.max(1, monthlyDates.size);
    const investableCash = Math.max(0, balance - (monthlyExpenses * 3) - (settings?.savingsTarget || 0));

    const prompt = `You are a financial advisor analyzing a user's cash flow. Provide actionable insights.

User's Financial Summary:
- Current Balance: $${balance.toFixed(2)}
- Total Income: $${incomeTotal.toFixed(2)}
- Total Expenses: $${expenseTotal.toFixed(2)}
- Average Monthly Expenses: $${monthlyExpenses.toFixed(2)}
- Potential Investable Cash: $${investableCash.toFixed(2)}
- Savings Target: $${settings?.savingsTarget || 0}

Recent Transactions (last 20):
${recentTransactions.map((t: { date: number; type: string; amount: number; category: string; description?: string }) => `- ${new Date(t.date).toISOString().substring(0, 10)} | ${t.type.toUpperCase()} | $${t.amount} | ${t.category} | ${t.description || ''}`).join('\n')}

Income Categories: ${incomeCategories.join(', ')}
Expense Categories: ${expenseCategories.join(', ')}

Provide exactly 4 insights in JSON format:
1. BAD_HABIT: Identify any spending patterns that could be harmful (e.g., too much dining out, increasing expenses, no savings)
2. PASSIVE_INCOME: Suggest ways to generate passive income based on their financial situation
3. INVESTABLE_CASH: Analyze how they could invest their surplus cash
4. STRATEGY: General financial strategy recommendations

Return ONLY valid JSON like this:
{
  "insights": [
    { "type": "bad_habit", "title": "...", "description": "...", "severity": "warning|info|success", "action": "..." },
    { "type": "passive_income", "title": "...", "description": "...", "severity": "info", "action": "..." },
    { "type": "investable_cash", "title": "...", "description": "...", "severity": "success|info", "action": "..." },
    { "type": "strategy", "title": "...", "description": "...", "severity": "info", "action": "..." }
  ]
}`;

    const chatResponse = await mistral.chat.complete({
      model: 'mistral-small-latest',
      messages: [{ role: 'user', content: prompt }],
      responseFormat: { type: 'json_object' }
    });

    const content = chatResponse.choices?.[0]?.message?.content;
    
    if (!content || typeof content !== 'string') {
      throw new Error('No content from Mistral');
    }

    const result = JSON.parse(content);

    return NextResponse.json(result);
  } catch (error) {
    console.error('AI insights error:', error);
    
    return NextResponse.json({
      insights: [
        {
          type: 'bad_habit',
          title: 'Unable to analyze habits',
          description: 'Add more transactions to get personalized habit analysis.',
          severity: 'info',
          action: 'Start tracking your expenses'
        },
        {
          type: 'passive_income',
          title: 'Keep tracking to unlock suggestions',
          description: 'We need more financial data to suggest passive income opportunities.',
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
      ]
    });
  }
}
