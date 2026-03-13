import { NextRequest, NextResponse } from 'next/server';
import { convex } from '@/lib/convex';
import { api } from '@/convex/_generated/api';
import { hashPassword, generateToken, setAuthCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, companyName } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const existingUser = await convex.query(api.users.getByEmail, { email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);
    const userId = await convex.mutation(api.auth.createUserWithSettings, {
      email,
      password: hashedPassword,
      companyName
    });

    const user = await convex.query(api.users.getById, { id: userId });
    
    if (!user) {
      throw new Error("Failed to create user");
    }

    const token = generateToken(userId, user.email);
    const cookie = setAuthCookie(token);

    const response = NextResponse.json({
      user: { id: user._id, email: user.email, company_name: user.companyName },
      message: 'Registration successful'
    });

    response.cookies.set(cookie);

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
