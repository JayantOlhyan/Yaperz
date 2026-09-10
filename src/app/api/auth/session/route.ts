/**
 * @file api/auth/session/route.ts
 * @description Authenticated Session Validation API Route Handler.
 * Returns the currently authenticated customer profile if session cookie is valid.
 */

import { NextRequest, NextResponse } from 'next/server';
import { authService, AUTH_COOKIE_NAME } from '@/lib/services/auth/auth.service';

export async function GET(request: NextRequest) {
  try {
    const rawSessionToken = request.cookies.get(AUTH_COOKIE_NAME)?.value;

    if (!rawSessionToken) {
      return NextResponse.json({
        authenticated: false,
        customer: null,
      });
    }

    const sessionData = await authService.validateSession(rawSessionToken);

    if (!sessionData) {
      const response = NextResponse.json({
        authenticated: false,
        customer: null,
      });

      // Clear stale cookie
      response.cookies.set(AUTH_COOKIE_NAME, '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 0,
      });

      return response;
    }

    return NextResponse.json({
      authenticated: true,
      customer: sessionData.customer,
    });
  } catch (error) {
    console.error('Error in GET /api/auth/session:', error);
    return NextResponse.json(
      { authenticated: false, customer: null, error: 'Session validation failed' },
      { status: 500 }
    );
  }
}
