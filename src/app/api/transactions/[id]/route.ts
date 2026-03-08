import { NextRequest, NextResponse } from 'next/server';
import { getTransactionsByUserId, updateTransaction, deleteTransaction } from '@/lib/db';
import { verifyToken, getTokenFromCookies } from '@/lib/auth';

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
    const transactionId = parseInt(id);
    
    const transactions = getTransactionsByUserId(payload.userId);
    const transaction = transactions.find(t => t.id === transactionId);
    
    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    const body = await request.json();
    const { amount, type, category, description, date } = body;

    if (!amount || !type || !category || !date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const updated = updateTransaction(
      transactionId,
      parseFloat(amount),
      type,
      category,
      description || '',
      date
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
    const transactionId = parseInt(id);
    
    const transactions = getTransactionsByUserId(payload.userId);
    const transaction = transactions.find(t => t.id === transactionId);
    
    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    deleteTransaction(transactionId);

    return NextResponse.json({ message: 'Transaction deleted' });
  } catch (error) {
    console.error('Delete transaction error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
