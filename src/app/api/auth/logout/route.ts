/**
 * @file api/auth/logout/route.ts
 * @description Customer Logout API Route Handler.
 * Invalidates server-side session token and clears HttpOnly auth session cookie.
 */

import { NextRequest, NextResponse } from 'next/server';
import { authService, AUTH_COOKIE_NAME } from '@/lib/services/auth/auth.service';

export async function POST(request: NextRequest) {
  try {
    const rawSessionToken = request.cookies.get(AUTH_COOKIE_NAME)?.value;

    if (rawSessionToken) {
      await authService.logout(rawSessionToken);
    }

    const response = NextResponse.json({
      success: true,
      message: 'Successfully logged out',
    });

    response.cookies.set(AUTH_COOKIE_NAME, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error('Error in POST /api/auth/logout:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to complete logout' },
      { status: 500 }
    );
  }
}
