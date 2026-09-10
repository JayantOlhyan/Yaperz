/**
 * @file customer.repository.ts
 * @description Customer and Address Data Access Layer.
 * Manages customer profiles, saved delivery destinations, and account history lookup.
 */

import { AddressInput } from '../../validation/checkout.schema';

export interface CustomerRecord {
  id: string;
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  marketingConsent: boolean;
  accountStatus: 'ACTIVE' | 'SUSPENDED' | 'GUEST';
  savedAddresses: Array<AddressInput & { id: string; isDefault: boolean }>;
  createdAt: Date;
  updatedAt: Date;
}

const customerStore = new Map<string, CustomerRecord>(); // email -> CustomerRecord

export class CustomerRepository {
  /**
   * Finds customer by email.
   */
  async findByEmail(email: string): Promise<CustomerRecord | null> {
    const key = email.toLowerCase().trim();
    return customerStore.get(key) || null;
  }

  /**
   * Finds customer by ID.
   */
  async findById(id: string): Promise<CustomerRecord | null> {
    for (const cust of customerStore.values()) {
      if (cust.id === id) return cust;
    }
    return null;
  }

  /**
   * Creates or updates a customer profile from checkout contact details.
   */
  async upsertFromCheckout(data: {
    email: string;
    phone: string;
    firstName: string;
    lastName: string;
    address?: AddressInput;
  }): Promise<CustomerRecord> {
    const key = data.email.toLowerCase().trim();
    const existing = customerStore.get(key);

    if (existing) {
      existing.phone = data.phone;
      existing.firstName = data.firstName;
      existing.lastName = data.lastName;
      existing.updatedAt = new Date();

      if (data.address) {
        const addressExists = existing.savedAddresses.some(
          (a) =>
            a.postalCode === data.address!.postalCode &&
            a.addressLine1.toLowerCase() === data.address!.addressLine1.toLowerCase()
        );
        if (!addressExists) {
          existing.savedAddresses.push({
            id: `addr-${Date.now()}`,
            ...data.address,
            isDefault: existing.savedAddresses.length === 0,
          });
        }
      }

      customerStore.set(key, existing);
      return existing;
    }

    const newCustomer: CustomerRecord = {
      id: `cust-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      email: key,
      phone: data.phone,
      firstName: data.firstName,
      lastName: data.lastName,
      marketingConsent: false,
      accountStatus: 'GUEST',
      savedAddresses: data.address
        ? [{ id: `addr-${Date.now()}`, ...data.address, isDefault: true }]
        : [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    customerStore.set(key, newCustomer);
    return newCustomer;
  }
}

export const customerRepository = new CustomerRepository();
