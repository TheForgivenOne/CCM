import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, createUser, createSettings } from '@/lib/db';
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

    const existingUser = getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);
    const user = createUser(email, hashedPassword, companyName);
    
    createSettings(user.id);

    const token = generateToken(user.id, user.email);
    const cookie = setAuthCookie(token);

    const response = NextResponse.json({
      user: { id: user.id, email: user.email, company_name: user.company_name },
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
