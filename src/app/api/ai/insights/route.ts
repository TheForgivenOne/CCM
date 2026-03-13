import { NextResponse } from 'next/server';
import { Mistral } from '@mistralai/mistralai';
import { getTransactionsByUserId, getBalance, getSettingsByUserId, createSettings } from '@/lib/db';
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

    const userId = payload.userId;
    const transactions = await getTransactionsByUserId(userId);
    const balance = await getBalance(userId);
    let settings = await getSettingsByUserId(userId);
    if (!settings) {
      settings = await createSettings(userId);
    }

    const incomeCategories = JSON.parse(settings.income_categories);
    const expenseCategories = JSON.parse(settings.expense_categories);

    const recentTransactions = transactions.slice(0, 20);
    
    const incomeTotal = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenseTotal = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const monthlyExpenses = expenseTotal / Math.max(1, new Set(transactions.map(t => t.date.substring(0, 7))).size);
    const investableCash = Math.max(0, balance - (monthlyExpenses * 3) - settings.savings_target);

    const prompt = `You are a financial advisor analyzing a user's cash flow. Provide actionable insights.

User's Financial Summary:
- Current Balance: $${balance.toFixed(2)}
- Total Income: $${incomeTotal.toFixed(2)}
- Total Expenses: $${expenseTotal.toFixed(2)}
- Average Monthly Expenses: $${monthlyExpenses.toFixed(2)}
- Potential Investable Cash: $${investableCash.toFixed(2)}
- Savings Target: $${settings.savings_target}

Recent Transactions (last 20):
${recentTransactions.map(t => `- ${t.date.substring(0, 10)} | ${t.type.toUpperCase()} | $${t.amount} | ${t.category} | ${t.description || ''}`).join('\n')}

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
