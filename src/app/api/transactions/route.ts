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
    await convex.mutation(
      api.transactions.generateRecurring,
      { userId }
    );

    const transactions = await convex.query(
      api.transactions.getByUser,
      { userId }
    );

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

    const dateTimestamp = new Date(date).getTime();
    const recurringEndTimestamp = recurring_end ? new Date(recurring_end).getTime() : undefined;

    const transactionData: {
      userId: Id<"users">;
      amount: number;
      type: "income" | "expense";
      category: string;
      description: string;
      date: number;
      recurring?: "daily" | "weekly" | "biweekly" | "monthly" | "yearly" | null;
      recurringEnd?: number;
    } = {
      userId: payload.userId as Id<"users">,
      amount: parseFloat(amount),
      type: type as "income" | "expense",
      category,
      description: description || '',
      date: dateTimestamp,
    };

    if (recurring) {
      transactionData.recurring = recurring;
    }
    if (recurringEndTimestamp) {
      transactionData.recurringEnd = recurringEndTimestamp;
    }

    const transactionId = await convex.mutation(
      api.transactions.create,
      transactionData
    );

    const transaction = await convex.query(
      api.transactions.getById,
      { id: transactionId as Id<"transactions"> }
    );

    return NextResponse.json({ transaction, message: 'Transaction created' });
  } catch (error) {
    console.error('Create transaction error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
