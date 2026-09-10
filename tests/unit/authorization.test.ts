/**
 * @file authorization.test.ts
 * @description Security and Authorization Unit Tests (IDOR Defense, Address Ownership, Order Isolation).
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { authRepository } from '../../src/lib/db/repositories/auth.repository';
import { orderRepository } from '../../src/lib/db/repositories/order.repository';
import { customerRepository } from '../../src/lib/db/repositories/customer.repository';

describe('Authorization & Resource Isolation (IDOR Defense)', () => {
  beforeEach(() => {
    authRepository.resetForTesting();
    customerRepository.resetForTesting();
    orderRepository.resetForTesting();
  });

  it('prevents Customer A from viewing or updating Customer B saved address', async () => {
    const custA = await customerRepository.createCustomer({
      email: 'customera@yaperz.in',
      firstName: 'Customer',
      lastName: 'A',
    });

    const custB = await customerRepository.createCustomer({
      email: 'customerb@yaperz.in',
      firstName: 'Customer',
      lastName: 'B',
    });

    const addrB = await authRepository.createAddress({
      customerId: custB.id,
      firstName: 'Customer',
      lastName: 'B',
      phone: '9876543210',
      addressLine1: 'B Block Suite 100',
      city: 'Delhi',
      state: 'Delhi',
      postalCode: '110001',
      country: 'IN',
      addressType: 'HOME',
      isDefault: true,
    });

    // Attempting to update Cust B's address using Cust A's identity must return null
    const updateResult = await authRepository.updateAddress(addrB.id, custA.id, {
      addressLine1: 'Hacked Address',
    });

    expect(updateResult).toBeNull();

    // Verify address was unchanged
    const originalAddr = await authRepository.findAddressById(addrB.id);
    expect(originalAddr?.addressLine1).toBe('B Block Suite 100');
  });

  it('prevents Customer A from deleting Customer B saved address', async () => {
    const custA = await customerRepository.createCustomer({
      email: 'customera@yaperz.in',
      firstName: 'Customer',
      lastName: 'A',
    });

    const custB = await customerRepository.createCustomer({
      email: 'customerb@yaperz.in',
      firstName: 'Customer',
      lastName: 'B',
    });

    const addrB = await authRepository.createAddress({
      customerId: custB.id,
      firstName: 'Customer',
      lastName: 'B',
      phone: '9876543210',
      addressLine1: 'B Block Suite 100',
      city: 'Delhi',
      state: 'Delhi',
      postalCode: '110001',
      country: 'IN',
      addressType: 'HOME',
      isDefault: true,
    });

    // Attempt deletion with wrong customerId
    const deleteSuccess = await authRepository.deleteAddress(addrB.id, custA.id);
    expect(deleteSuccess).toBe(false);

    // Verify address still exists
    const addrStillExists = await authRepository.findAddressById(addrB.id);
    expect(addrStillExists).not.toBeNull();
  });

  it('isolates order history lookups strictly to authenticated customer identity', async () => {
    const custA = await customerRepository.createCustomer({
      email: 'customera@yaperz.in',
      firstName: 'Customer',
      lastName: 'A',
    });

    const custB = await customerRepository.createCustomer({
      email: 'customerb@yaperz.in',
      firstName: 'Customer',
      lastName: 'B',
    });

    await orderRepository.create({
      customerId: custA.id,
      guestEmail: 'customera@yaperz.in',
      guestPhone: '9876543210',
      subtotal: 1850000,
      discountTotal: 0,
      shippingFee: 0,
      shippingMethod: 'standard',
      taxTotal: 222000,
      grandTotal: 1850000,
      shippingAddress: {
        firstName: 'Customer',
        lastName: 'A',
        phone: '9876543210',
        addressLine1: 'Line A',
        city: 'Delhi',
        state: 'Delhi',
        postalCode: '110001',
        country: 'IN',
      },
      items: [
        {
          productId: 'hoodie-01',
          variantId: 'v-hoodie-m',
          productTitle: 'Heavyweight Hoodie',
          variantSku: 'YP-HD-BRN-M',
          size: 'M',
          color: 'Brown',
          unitPrice: 1850000,
          quantity: 1,
          discountAmount: 0,
          taxAmount: 222000,
          lineTotal: 1850000,
        },
      ],
    });

    // Querying for Cust B must return 0 orders
    const ordersB = await orderRepository.findByCustomerId(custB.id, custB.email);
    expect(ordersB).toHaveLength(0);

    // Querying for Cust A returns 1 order
    const ordersA = await orderRepository.findByCustomerId(custA.id, custA.email);
    expect(ordersA).toHaveLength(1);
    expect(ordersA[0].customerId).toBe(custA.id);
  });
});
