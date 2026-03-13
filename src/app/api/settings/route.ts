import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getTokenFromCookies } from '@/lib/auth';
import { convex } from '@/lib/convex';
import { api } from '../../../../convex/_generated/api';
import { Id } from '../../../../convex/_generated/dataModel';

async function getUserFromToken() {
  const token = await getTokenFromCookies();
  if (!token) return null;
  return verifyToken(token);
}

export async function GET() {
  try {
    const payload = await getUserFromToken();
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = payload.userId as Id<"users">;
    let settings = await convex.query(
      api.settings.getByUser,
      { userId }
    );

    if (!settings) {
      await convex.mutation(
        api.settings.create,
        { userId }
      );
      settings = await convex.query(
        api.settings.getByUser,
        { userId }
      );
    }

    const user = await convex.query(
      api.users.getById,
      { id: userId }
    );

    return NextResponse.json({
      settings: {
        ...settings,
        income_categories: settings?.incomeCategories || [],
        expense_categories: settings?.expenseCategories || [],
        reinvestment_rules: settings?.reinvestmentRules || [],
      },
      company_name: user?.companyName
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

    const userId = payload.userId as Id<"users">;
    const settings = await convex.mutation(
      api.settings.update,
      {
        userId,
        incomeCategories: incomeCategories || [],
        expenseCategories: expenseCategories || [],
        savingsTarget: savingsTarget || 0,
        warningThreshold: warningThreshold || 0,
        reinvestmentRules: reinvestmentRules || [],
      }
    );

    if (companyName) {
      await convex.mutation(
        api.users.updateCompanyName,
        { id: userId, companyName }
      );
    }

    return NextResponse.json({ 
      settings: {
        ...settings,
        income_categories: settings?.incomeCategories || [],
        expense_categories: settings?.expenseCategories || [],
        reinvestment_rules: settings?.reinvestmentRules || [],
      },
      message: 'Settings updated' 
    });
  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
