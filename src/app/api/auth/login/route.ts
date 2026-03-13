import { NextRequest, NextResponse } from 'next/server';
import { convex } from '@/lib/convex';
import { api } from '@/convex/_generated/api';
import { verifyPassword, generateToken, setAuthCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const user = await convex.query(api.users.getByEmail, { email });
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const token = generateToken(user._id, user.email);
    const cookie = setAuthCookie(token);

    const response = NextResponse.json({
      user: { id: user._id, email: user.email, company_name: user.companyName },
      message: 'Login successful'
    });

    response.cookies.set(cookie);

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
