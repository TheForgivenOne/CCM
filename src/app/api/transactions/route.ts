import { NextRequest, NextResponse } from 'next/server';
import { getTransactionsByUserId, createTransaction, getUserById, generateRecurringTransactions } from '@/lib/db';
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

    generateRecurringTransactions(payload.userId);
    const transactions = getTransactionsByUserId(payload.userId);
    return NextResponse.json({ transactions });
  } catch (error) {
    console.error('Get transactions error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await getUserFromToken();
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { amount, type, category, description, date, recurring, recurring_end } = body;

    if (!amount || !type || !category || !date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const transaction = createTransaction(
      payload.userId,
      parseFloat(amount),
      type,
      category,
      description || '',
      date,
      recurring || null,
      recurring_end || null
    );

    return NextResponse.json({ transaction, message: 'Transaction created' });
  } catch (error) {
    console.error('Create transaction error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
