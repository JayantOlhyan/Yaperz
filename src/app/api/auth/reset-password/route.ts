/**
 * @file api/auth/reset-password/route.ts
 * @description Password Reset Execution API Route Handler.
 * Consumes one-time token, updates scrypt password hash, and invalidates active sessions.
 */

import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { resetPasswordSchema } from '@/lib/validation/auth.schema';
import { authService } from '@/lib/services/auth/auth.service';
import { AppError } from '@/lib/errors';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = resetPasswordSchema.parse(body);

    const result = await authService.resetPassword(validated);

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
    console.error('Error in POST /api/auth/reset-password:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred during password reset' },
      { status: 500 }
    );
  }
}
