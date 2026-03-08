import { NextRequest, NextResponse } from 'next/server';
import { getSettingsByUserId, updateSettings, createSettings, getUserById } from '@/lib/db';
import { verifyToken, getTokenFromCookies } from '@/lib/auth';

async function getUserFromToken() {
  const token = await getTokenFromCookies();
  if (!token) return null;
  return verifyToken(token);
}

export async function GET(request: NextRequest) {
  try {
    const payload = await getUserFromToken();
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let settings = getSettingsByUserId(payload.userId);
    if (!settings) {
      settings = createSettings(payload.userId);
    }

    const user = getUserById(payload.userId);

    return NextResponse.json({
      settings: {
        ...settings,
        income_categories: JSON.parse(settings.income_categories),
        expense_categories: JSON.parse(settings.expense_categories),
        reinvestment_rules: JSON.parse(settings.reinvestment_rules),
      },
      company_name: user?.company_name
    });
  } catch (error) {
    console.error('Get settings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const payload = await getUserFromToken();
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { incomeCategories, expenseCategories, savingsTarget, warningThreshold, reinvestmentRules, companyName } = body;

    const settings = updateSettings(
      payload.userId,
      incomeCategories || [],
      expenseCategories || [],
      savingsTarget || 0,
      warningThreshold || 0,
      reinvestmentRules || [],
      companyName
    );

    return NextResponse.json({ 
      settings: {
        ...settings,
        income_categories: JSON.parse(settings!.income_categories),
        expense_categories: JSON.parse(settings!.expense_categories),
        reinvestment_rules: JSON.parse(settings!.reinvestment_rules),
      },
      message: 'Settings updated' 
    });
  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
