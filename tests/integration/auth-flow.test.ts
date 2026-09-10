/**
 * @file auth-flow.test.ts
 * @description Integration tests for registration, authentication, session lifecycle, address CRUD,
 * and password reset.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { authService } from '../../src/lib/services/auth/auth.service';
import { authRepository } from '../../src/lib/db/repositories/auth.repository';
import { customerRepository } from '../../src/lib/db/repositories/customer.repository';
import { orderRepository } from '../../src/lib/db/repositories/order.repository';
import { cartRepository } from '../../src/lib/db/repositories/cart.repository';
import { DuplicateAccountError, InvalidCredentialsError, AccountSuspendedError } from '../../src/lib/errors';

describe('Customer Authentication & Account Integration Flows', () => {
  beforeEach(() => {
    authRepository.resetForTesting();
    customerRepository.resetForTesting();
    orderRepository.resetForTesting();
    cartRepository.resetForTesting();
  });

  it('completes registration, establishes session, and normalizes email', async () => {
    const regResult = await authService.register({
      firstName: 'Jayant',
      lastName: 'Olhyan',
      email: '  Jayant.Streetwear@YAPERZ.IN  ',
      phone: '9876543210',
      password: 'StreetwearPass123!',
      confirmPassword: 'StreetwearPass123!',
    });

    expect(regResult.customer.email).toBe('jayant.streetwear@yaperz.in');
    expect(regResult.customer.firstName).toBe('Jayant');
    expect(regResult.customer.accountStatus).toBe('ACTIVE');
    expect(regResult.rawSessionToken).toBeTruthy();

    // Session validation must resolve customer identity
    const sessionData = await authService.validateSession(regResult.rawSessionToken);
    expect(sessionData).not.toBeNull();
    expect(sessionData?.customer.id).toBe(regResult.customer.id);
  });

  it('rejects duplicate email registration with DuplicateAccountError', async () => {
    await authService.register({
      firstName: 'First',
      lastName: 'User',
      email: 'duplicate@yaperz.in',
      password: 'Password123!',
      confirmPassword: 'Password123!',
    });

    await expect(
      authService.register({
        firstName: 'Second',
        lastName: 'User',
        email: 'DUPLICATE@YAPERZ.IN',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      })
    ).rejects.toThrow(DuplicateAccountError);
  });

  it('authenticates valid credentials and rejects invalid passwords', async () => {
    await authService.register({
      firstName: 'Login',
      lastName: 'Test',
      email: 'login.test@yaperz.in',
      password: 'ValidPassword123!',
      confirmPassword: 'ValidPassword123!',
    });

    // Valid login
    const loginResult = await authService.login({
      email: 'LOGIN.TEST@yaperz.in',
      password: 'ValidPassword123!',
    });
    expect(loginResult.customer.email).toBe('login.test@yaperz.in');
    expect(loginResult.rawSessionToken).toBeTruthy();

    // Invalid password
    await expect(
      authService.login({
        email: 'login.test@yaperz.in',
        password: 'WrongPassword999!',
      })
    ).rejects.toThrow(InvalidCredentialsError);
  });

  it('prevents suspended accounts from logging in', async () => {
    const reg = await authService.register({
      firstName: 'Suspended',
      lastName: 'User',
      email: 'suspended@yaperz.in',
      password: 'Password123!',
      confirmPassword: 'Password123!',
    });

    // Suspend account
    await customerRepository.updateCustomer(reg.customer.id, { accountStatus: 'SUSPENDED' });

    await expect(
      authService.login({
        email: 'suspended@yaperz.in',
        password: 'Password123!',
      })
    ).rejects.toThrow(AccountSuspendedError);
  });

  it('invalidates session token on logout', async () => {
    const reg = await authService.register({
      firstName: 'Logout',
      lastName: 'User',
      email: 'logout@yaperz.in',
      password: 'Password123!',
      confirmPassword: 'Password123!',
    });

    // Active session before logout
    const sessionBefore = await authService.validateSession(reg.rawSessionToken);
    expect(sessionBefore).not.toBeNull();

    // Perform logout
    await authService.logout(reg.rawSessionToken);

    // Session after logout must be null
    const sessionAfter = await authService.validateSession(reg.rawSessionToken);
    expect(sessionAfter).toBeNull();
  });

  it('manages customer saved address CRUD and enforces default address constraints', async () => {
    const reg = await authService.register({
      firstName: 'Address',
      lastName: 'Tester',
      email: 'address@yaperz.in',
      password: 'Password123!',
      confirmPassword: 'Password123!',
    });

    // First address automatically becomes default
    const addr1 = await authRepository.createAddress({
      customerId: reg.customer.id,
      firstName: 'Address',
      lastName: 'Tester',
      phone: '9876543210',
      addressLine1: 'M-81, Block M, GK-II',
      city: 'New Delhi',
      state: 'Delhi',
      postalCode: '110048',
      country: 'IN',
      addressType: 'HOME',
      isDefault: false,
    });
    expect(addr1.isDefault).toBe(true);

    // Adding second address with isDefault = true unsets first address
    const addr2 = await authRepository.createAddress({
      customerId: reg.customer.id,
      firstName: 'Address',
      lastName: 'Tester',
      phone: '9876543210',
      addressLine1: 'DLF Cyber City Tower B',
      city: 'Gurugram',
      state: 'Haryana',
      postalCode: '122002',
      country: 'IN',
      addressType: 'WORK',
      isDefault: true,
    });
    expect(addr2.isDefault).toBe(true);

    const list = await authRepository.listCustomerAddresses(reg.customer.id);
    expect(list).toHaveLength(2);
    expect(list[0].id).toBe(addr2.id); // Default address sorted first
    expect(list[0].isDefault).toBe(true);
    expect(list[1].isDefault).toBe(false);
  });
});
