/**
 * @file api/account/addresses/route.ts
 * @description Customer Address Book List and Creation API Route Handler.
 * Enforces authenticated customer session authorization and default address constraints.
 */

import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { authService, AUTH_COOKIE_NAME } from '@/lib/services/auth/auth.service';
import { authRepository } from '@/lib/db/repositories/auth.repository';
import { addressSchema } from '@/lib/validation/auth.schema';
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
      data: addresses,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { success: false, error: error.message, code: error.code },
        { status: error.statusCode }
      );
    }
    console.error('Error in GET /api/account/addresses:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve customer addresses' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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
    const validated = addressSchema.parse(body);

    const address = await authRepository.createAddress({
      customerId: sessionData.customer.id,
      ...validated,
    });

    return NextResponse.json(
      {
        success: true,
        data: address,
      },
      { status: 201 }
    );
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
    console.error('Error in POST /api/account/addresses:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create address' },
      { status: 500 }
    );
  }
}
