/**
 * @file api/auth/register/route.ts
 * @description Customer Registration API Route Handler.
 * Validates registration input, creates customer credentials, sets HttpOnly session cookie,
 * and triggers guest-to-customer cart merging.
 */

import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { registerSchema } from '@/lib/validation/auth.schema';
import { authService, AUTH_COOKIE_NAME } from '@/lib/services/auth/auth.service';
import { AppError } from '@/lib/errors';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = registerSchema.parse(body);

    const guestSessionToken = request.cookies.get('yaperz_session')?.value;
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';

    const { customer, rawSessionToken } = await authService.register(
      validated,
      guestSessionToken,
      ip
    );

    const response = NextResponse.json(
      {
        success: true,
        data: { customer },
      },
      { status: 201 }
    );

    response.cookies.set(AUTH_COOKIE_NAME, rawSessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { success: false, error: error.message, code: error.code },
        { status: error.statusCode }
      );
    }
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error in POST /api/auth/register:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred during registration' },
      { status: 500 }
    );
  }
}
