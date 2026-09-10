/**
 * @file api/account/addresses/[id]/route.ts
 * @description Single Address Management API Route Handler.
 * Enforces ownership verification (address.customerId === session.customerId) for updates and deletions.
 */

import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { authService, AUTH_COOKIE_NAME } from '@/lib/services/auth/auth.service';
import { authRepository } from '@/lib/db/repositories/auth.repository';
import { addressSchema } from '@/lib/validation/auth.schema';
import { UnauthorizedError, ForbiddenError, NotFoundError, AppError } from '@/lib/errors';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const rawSessionToken = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (!rawSessionToken) {
      throw new UnauthorizedError();
    }

    const sessionData = await authService.validateSession(rawSessionToken);
    if (!sessionData) {
      throw new UnauthorizedError('Session expired or invalid');
    }

    const { id: addressId } = await context.params;
    const existing = await authRepository.findAddressById(addressId);
    if (!existing) {
      throw new NotFoundError('Address not found');
    }

    // Ownership check (IDOR protection)
    if (existing.customerId !== sessionData.customer.id) {
      throw new ForbiddenError('You are not authorized to update this address');
    }

    const body = await request.json();
    const validated = addressSchema.partial().parse(body);

    const updated = await authRepository.updateAddress(
      addressId,
      sessionData.customer.id,
      validated
    );

    return NextResponse.json({
      success: true,
      data: updated,
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
        { success: false, error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Error in PATCH /api/account/addresses/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update address' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const rawSessionToken = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (!rawSessionToken) {
      throw new UnauthorizedError();
    }

    const sessionData = await authService.validateSession(rawSessionToken);
    if (!sessionData) {
      throw new UnauthorizedError('Session expired or invalid');
    }

    const { id: addressId } = await context.params;
    const existing = await authRepository.findAddressById(addressId);
    if (!existing) {
      throw new NotFoundError('Address not found');
    }

    // Ownership check (IDOR protection)
    if (existing.customerId !== sessionData.customer.id) {
      throw new ForbiddenError('You are not authorized to delete this address');
    }

    const deleted = await authRepository.deleteAddress(addressId, sessionData.customer.id);
    if (!deleted) {
      throw new AppError('Failed to delete address', 'INTERNAL_ERROR', 500);
    }

    return NextResponse.json({
      success: true,
      message: 'Address successfully deleted',
    });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { success: false, error: error.message, code: error.code },
        { status: error.statusCode }
      );
    }
    console.error('Error in DELETE /api/account/addresses/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete address' },
      { status: 500 }
    );
  }
}
