import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  
  const isAuthPage = request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/register';
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard') || 
                           request.nextUrl.pathname.startsWith('/transactions') ||
                           request.nextUrl.pathname.startsWith('/settings') ||
                           request.nextUrl.pathname.startsWith('/insights') ||
                           request.nextUrl.pathname.startsWith('/profile');

  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/transactions/:path*',
    '/settings/:path*',
    '/insights/:path*',
    '/profile/:path*',
    '/login',
    '/register',
  ],
};
