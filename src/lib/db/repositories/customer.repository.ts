/**
 * @file customer.repository.ts
 * @description Customer Data Access Layer.
 * Manages customer profiles, registration persistence, and account status updates.
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
  externalAuthId?: string;
  savedAddresses: Array<AddressInput & { id: string; isDefault: boolean }>;
  createdAt: Date;
  updatedAt: Date;
}

const customerStore = new Map<string, CustomerRecord>(); // customerId -> CustomerRecord
const emailIndex = new Map<string, string>(); // normalized email -> customerId

export class CustomerRepository {
  /**
   * Finds customer by email (deterministic normalization).
   */
  async findByEmail(email: string): Promise<CustomerRecord | null> {
    const key = email.toLowerCase().trim();
    const id = emailIndex.get(key);
    if (!id) return null;
    return customerStore.get(id) || null;
  }

  /**
   * Finds customer by ID.
   */
  async findById(id: string): Promise<CustomerRecord | null> {
    return customerStore.get(id) || null;
  }

  /**
   * Creates a new registered customer record.
   */
  async createCustomer(data: {
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    marketingConsent?: boolean;
    accountStatus?: 'ACTIVE' | 'SUSPENDED' | 'GUEST';
  }): Promise<CustomerRecord> {
    const key = data.email.toLowerCase().trim();
    if (emailIndex.has(key)) {
      throw new Error('Customer with this email already exists');
    }

    const id = `cust-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const record: CustomerRecord = {
      id,
      email: key,
      phone: data.phone,
      firstName: data.firstName,
      lastName: data.lastName,
      marketingConsent: data.marketingConsent || false,
      accountStatus: data.accountStatus || 'ACTIVE',
      savedAddresses: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    customerStore.set(id, record);
    emailIndex.set(key, id);
    return record;
  }

  /**
   * Updates an existing customer profile.
   */
  async updateCustomer(
    id: string,
    data: Partial<Pick<CustomerRecord, 'firstName' | 'lastName' | 'phone' | 'marketingConsent' | 'accountStatus'>>
  ): Promise<CustomerRecord | null> {
    const record = customerStore.get(id);
    if (!record) return null;

    if (data.firstName !== undefined) record.firstName = data.firstName;
    if (data.lastName !== undefined) record.lastName = data.lastName;
    if (data.phone !== undefined) record.phone = data.phone;
    if (data.marketingConsent !== undefined) record.marketingConsent = data.marketingConsent;
    if (data.accountStatus !== undefined) record.accountStatus = data.accountStatus;
    record.updatedAt = new Date();

    customerStore.set(id, record);
    return record;
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
    const existing = await this.findByEmail(key);

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

      customerStore.set(existing.id, existing);
      return existing;
    }

    const newCustomer = await this.createCustomer({
      email: key,
      phone: data.phone,
      firstName: data.firstName,
      lastName: data.lastName,
      accountStatus: 'GUEST',
    });

    if (data.address) {
      newCustomer.savedAddresses.push({
        id: `addr-${Date.now()}`,
        ...data.address,
        isDefault: true,
      });
    }

    customerStore.set(newCustomer.id, newCustomer);
    return newCustomer;
  }

  /**
   * Resets customer store for testing.
   */
  public resetForTesting() {
    customerStore.clear();
    emailIndex.clear();
  }
}

export const customerRepository = new CustomerRepository();
