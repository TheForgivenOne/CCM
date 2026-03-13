import { NextResponse } from 'next/server';
import { convex } from '@/lib/convex';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { verifyToken, getTokenFromCookies } from '@/lib/auth';

export async function GET() {
  try {
    const token = await getTokenFromCookies();
    
    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const userId = payload.userId as Id<"users">;
    const user = await convex.query(api.users.getById, { id: userId });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user: { id: user._id, email: user.email, company_name: user.companyName }
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
