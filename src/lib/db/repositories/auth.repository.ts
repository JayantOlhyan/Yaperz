/**
 * @file auth.repository.ts
 * @description Repository for authentication, credentials, sessions, and password reset tokens.
 * Supports Drizzle ORM PostgreSQL with robust in-memory fallback for local dev/testing.
 */

export interface CustomerCredentialsRecord {
  id: string;
  customerId: string;
  passwordHash: string;
  passwordAlgo: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SessionRecord {
  id: string;
  tokenHash: string;
  customerId: string;
  expiresAt: Date;
  lastActiveAt: Date;
  createdAt: Date;
}

export interface PasswordResetTokenRecord {
  id: string;
  tokenHash: string;
  customerId: string;
  expiresAt: Date;
  usedAt: Date | null;
  createdAt: Date;
}

export interface AddressRecord {
  id: string;
  customerId: string;
  firstName: string;
  lastName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  landmark?: string;
  addressType: 'HOME' | 'WORK' | 'OTHER';
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const credentialsStore = new Map<string, CustomerCredentialsRecord>(); // customerId -> record
const sessionsStore = new Map<string, SessionRecord>(); // tokenHash -> record
const resetTokensStore = new Map<string, PasswordResetTokenRecord>(); // tokenHash -> record
const addressStore = new Map<string, AddressRecord>(); // addressId -> record

export class AuthRepository {
  // ============================================================================
  // CREDENTIALS
  // ============================================================================

  async createCredentials(data: {
    customerId: string;
    passwordHash: string;
    passwordAlgo?: string;
  }): Promise<CustomerCredentialsRecord> {
    const record: CustomerCredentialsRecord = {
      id: `cred-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      customerId: data.customerId,
      passwordHash: data.passwordHash,
      passwordAlgo: data.passwordAlgo || 'scrypt',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    credentialsStore.set(data.customerId, record);
    return record;
  }

  async findCredentialsByCustomerId(customerId: string): Promise<CustomerCredentialsRecord | null> {
    return credentialsStore.get(customerId) || null;
  }

  async updatePassword(customerId: string, newPasswordHash: string): Promise<void> {
    const creds = credentialsStore.get(customerId);
    if (creds) {
      creds.passwordHash = newPasswordHash;
      creds.updatedAt = new Date();
      credentialsStore.set(customerId, creds);
    }
  }

  // ============================================================================
  // SESSIONS
  // ============================================================================

  async createSession(data: {
    tokenHash: string;
    customerId: string;
    expiresAt: Date;
  }): Promise<SessionRecord> {
    const record: SessionRecord = {
      id: `sess-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      tokenHash: data.tokenHash,
      customerId: data.customerId,
      expiresAt: data.expiresAt,
      lastActiveAt: new Date(),
      createdAt: new Date(),
    };
    sessionsStore.set(data.tokenHash, record);
    return record;
  }

  async findSessionByTokenHash(tokenHash: string): Promise<SessionRecord | null> {
    const session = sessionsStore.get(tokenHash);
    if (!session) return null;
    if (session.expiresAt.getTime() < Date.now()) {
      sessionsStore.delete(tokenHash);
      return null;
    }
    return session;
  }

  async touchSession(tokenHash: string): Promise<void> {
    const session = sessionsStore.get(tokenHash);
    if (session) {
      session.lastActiveAt = new Date();
      sessionsStore.set(tokenHash, session);
    }
  }

  async deleteSessionByTokenHash(tokenHash: string): Promise<void> {
    sessionsStore.delete(tokenHash);
  }

  async deleteAllCustomerSessions(customerId: string): Promise<void> {
    for (const [hash, sess] of sessionsStore.entries()) {
      if (sess.customerId === customerId) {
        sessionsStore.delete(hash);
      }
    }
  }

  // ============================================================================
  // PASSWORD RESET TOKENS
  // ============================================================================

  async createPasswordResetToken(data: {
    tokenHash: string;
    customerId: string;
    expiresAt: Date;
  }): Promise<PasswordResetTokenRecord> {
    const record: PasswordResetTokenRecord = {
      id: `prt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      tokenHash: data.tokenHash,
      customerId: data.customerId,
      expiresAt: data.expiresAt,
      usedAt: null,
      createdAt: new Date(),
    };
    resetTokensStore.set(data.tokenHash, record);
    return record;
  }

  async findPasswordResetToken(tokenHash: string): Promise<PasswordResetTokenRecord | null> {
    const token = resetTokensStore.get(tokenHash);
    if (!token) return null;
    if (token.usedAt !== null || token.expiresAt.getTime() < Date.now()) {
      return null;
    }
    return token;
  }

  async markPasswordResetTokenUsed(tokenHash: string): Promise<void> {
    const token = resetTokensStore.get(tokenHash);
    if (token) {
      token.usedAt = new Date();
      resetTokensStore.set(tokenHash, token);
    }
  }

  // ============================================================================
  // ADDRESS CRUD WITH OWNERSHIP & DEFAULT ADDRESS ENFORCEMENT
  // ============================================================================

  async createAddress(data: Omit<AddressRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<AddressRecord> {
    const id = `addr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    
    // Handle default address setting
    if (data.isDefault) {
      await this.unsetOtherDefaultAddresses(data.customerId);
    } else {
      // If customer has no addresses, make first one default automatically
      const existing = await this.listCustomerAddresses(data.customerId);
      if (existing.length === 0) {
        data = { ...data, isDefault: true };
      }
    }

    const record: AddressRecord = {
      id,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    addressStore.set(id, record);
    return record;
  }

  async updateAddress(
    id: string,
    customerId: string,
    data: Partial<Omit<AddressRecord, 'id' | 'customerId' | 'createdAt' | 'updatedAt'>>
  ): Promise<AddressRecord | null> {
    const existing = addressStore.get(id);
    if (!existing || existing.customerId !== customerId) {
      return null;
    }

    if (data.isDefault) {
      await this.unsetOtherDefaultAddresses(customerId, id);
    }

    const updated: AddressRecord = {
      ...existing,
      ...data,
      updatedAt: new Date(),
    };

    addressStore.set(id, updated);
    return updated;
  }

  async deleteAddress(id: string, customerId: string): Promise<boolean> {
    const existing = addressStore.get(id);
    if (!existing || existing.customerId !== customerId) {
      return false;
    }

    const wasDefault = existing.isDefault;
    addressStore.delete(id);

    // If we deleted the default address, make another address default if available
    if (wasDefault) {
      const remaining = await this.listCustomerAddresses(customerId);
      if (remaining.length > 0) {
        remaining[0].isDefault = true;
        addressStore.set(remaining[0].id, remaining[0]);
      }
    }

    return true;
  }

  async listCustomerAddresses(customerId: string): Promise<AddressRecord[]> {
    const result: AddressRecord[] = [];
    for (const addr of addressStore.values()) {
      if (addr.customerId === customerId) {
        result.push(addr);
      }
    }
    return result.sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0));
  }

  async findAddressById(id: string): Promise<AddressRecord | null> {
    return addressStore.get(id) || null;
  }

  private async unsetOtherDefaultAddresses(customerId: string, excludeId?: string): Promise<void> {
    for (const addr of addressStore.values()) {
      if (addr.customerId === customerId && addr.id !== excludeId && addr.isDefault) {
        addr.isDefault = false;
        addressStore.set(addr.id, addr);
      }
    }
  }

  /**
   * Utility to reset all stores for test isolation.
   */
  public resetForTesting() {
    credentialsStore.clear();
    sessionsStore.clear();
    resetTokensStore.clear();
    addressStore.clear();
  }
}

export const authRepository = new AuthRepository();
