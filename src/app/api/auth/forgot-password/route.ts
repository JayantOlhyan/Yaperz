/**
 * @file api/auth/forgot-password/route.ts
 * @description Password Reset Request API Route Handler.
 * Generates one-time reset token while returning generic success to prevent account enumeration.
 */

import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { forgotPasswordSchema } from '@/lib/validation/auth.schema';
import { authService } from '@/lib/services/auth/auth.service';
import { AppError } from '@/lib/errors';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = forgotPasswordSchema.parse(body);

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';

    const result = await authService.forgotPassword(validated, ip);

    return NextResponse.json(result);
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
    console.error('Error in POST /api/auth/forgot-password:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
