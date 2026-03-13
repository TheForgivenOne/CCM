import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getTokenFromCookies } from '@/lib/auth';
import { convex } from '@/lib/convex';
import { api } from '../../../../../convex/_generated/api';
import { Id } from '../../../../../convex/_generated/dataModel';

async function getUserFromToken() {
  const token = await getTokenFromCookies();
  if (!token) return null;
  return verifyToken(token);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const payload = await getUserFromToken();
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const transactionId = id as Id<"transactions">;
    
    const transaction = await convex.query(
      api.transactions.getById,
      { id: transactionId }
    );
    
    if (!transaction || transaction.userId !== payload.userId) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    const body = await request.json();
    const { amount, type, category, description, date } = body;

    if (!amount || !type || !category || !date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const dateTimestamp = new Date(date).getTime();

    await convex.mutation(
      api.transactions.update,
      {
        id: transactionId,
        amount: parseFloat(amount),
        type,
        category,
        description: description || '',
        date: dateTimestamp,
      }
    );

    const updated = await convex.query(
      api.transactions.getById,
      { id: transactionId }
    );

    return NextResponse.json({ transaction: updated, message: 'Transaction updated' });
  } catch (error) {
    console.error('Update transaction error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const payload = await getUserFromToken();
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const transactionId = id as Id<"transactions">;
    
    const transaction = await convex.query(
      api.transactions.getById,
      { id: transactionId }
    );
    
    if (!transaction || transaction.userId !== payload.userId) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    await convex.mutation(
      api.transactions.remove,
      { id: transactionId }
    );

    return NextResponse.json({ message: 'Transaction deleted' });
  } catch (error) {
    console.error('Delete transaction error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
