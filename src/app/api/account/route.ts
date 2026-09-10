/**
 * @file api/account/route.ts
 * @description Customer Profile Management API Route Handler.
 * Returns authenticated customer profile details or updates profile information safely.
 */

import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { authService, AUTH_COOKIE_NAME } from '@/lib/services/auth/auth.service';
import { customerRepository } from '@/lib/db/repositories/customer.repository';
import { authRepository } from '@/lib/db/repositories/auth.repository';
import { updateAccountSchema } from '@/lib/validation/auth.schema';
import { UnauthorizedError, AppError } from '@/lib/errors';

export async function GET(request: NextRequest) {
  try {
    const rawSessionToken = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (!rawSessionToken) {
      throw new UnauthorizedError();
    }

    const sessionData = await authService.validateSession(rawSessionToken);
    if (!sessionData) {
      throw new UnauthorizedError('Session expired or invalid');
    }

    const addresses = await authRepository.listCustomerAddresses(sessionData.customer.id);

    return NextResponse.json({
      success: true,
      data: {
        customer: sessionData.customer,
        addresses,
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { success: false, error: error.message, code: error.code },
        { status: error.statusCode }
      );
    }
    console.error('Error in GET /api/account:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve account details' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const rawSessionToken = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (!rawSessionToken) {
      throw new UnauthorizedError();
    }

    const sessionData = await authService.validateSession(rawSessionToken);
    if (!sessionData) {
      throw new UnauthorizedError('Session expired or invalid');
    }

    const body = await request.json();
    const validated = updateAccountSchema.parse(body);

    const updated = await customerRepository.updateCustomer(sessionData.customer.id, validated);
    if (!updated) {
      throw new AppError('Customer profile update failed', 'INTERNAL_ERROR', 500);
    }

    return NextResponse.json({
      success: true,
      data: { customer: authService.toSafeCustomer(updated) },
    });
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
    console.error('Error in PATCH /api/account:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update account details' },
      { status: 500 }
    );
  }
}
