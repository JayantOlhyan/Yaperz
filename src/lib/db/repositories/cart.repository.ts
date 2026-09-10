/**
 * @file cart.repository.ts
 * @description Server-Side Cart Repository.
 * Manages persistent user sessions, line-item quantities, variant associations, and customer cart lookup.
 */

export interface PersistedCartItem {
  id: string;
  cartId: string;
  variantId: string;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PersistedCart {
  id: string;
  sessionToken: string;
  customerId?: string;
  items: PersistedCartItem[];
  createdAt: Date;
  updatedAt: Date;
}

// In-memory cart persistence store
const cartsStore = new Map<string, PersistedCart>(); // sessionToken -> PersistedCart

export class CartRepository {
  /**
   * Retrieves or creates a server-side cart associated with a session token.
   */
  async getOrCreate(sessionToken: string, customerId?: string): Promise<PersistedCart> {
    if (cartsStore.has(sessionToken)) {
      const cart = cartsStore.get(sessionToken)!;
      if (customerId && !cart.customerId) {
        cart.customerId = customerId;
      }
      return cart;
    }

    const newCart: PersistedCart = {
      id: `cart-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      sessionToken,
      customerId,
      items: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    cartsStore.set(sessionToken, newCart);
    return newCart;
  }

  /**
   * Finds a cart by customer ID.
   */
  async findByCustomerId(customerId: string): Promise<PersistedCart | null> {
    for (const cart of cartsStore.values()) {
      if (cart.customerId === customerId) {
        return cart;
      }
    }
    return null;
  }

  /**
   * Adds or increments a variant item in the server cart.
   */
  async addItem(sessionToken: string, variantId: string, quantity: number): Promise<PersistedCart> {
    const cart = await this.getOrCreate(sessionToken);
    const existing = cart.items.find((item) => item.variantId === variantId);

    if (existing) {
      existing.quantity = Math.min(10, existing.quantity + quantity);
      existing.updatedAt = new Date();
    } else {
      cart.items.push({
        id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        cartId: cart.id,
        variantId,
        quantity: Math.min(10, quantity),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    cart.updatedAt = new Date();
    cartsStore.set(sessionToken, cart);
    return cart;
  }

  /**
   * Updates quantity for an existing variant in the cart.
   */
  async updateItemQuantity(sessionToken: string, variantId: string, quantity: number): Promise<PersistedCart> {
    const cart = await this.getOrCreate(sessionToken);

    if (quantity <= 0) {
      return this.removeItem(sessionToken, variantId);
    }

    const item = cart.items.find((i) => i.variantId === variantId);
    if (item) {
      item.quantity = Math.min(10, quantity);
      item.updatedAt = new Date();
    }

    cart.updatedAt = new Date();
    cartsStore.set(sessionToken, cart);
    return cart;
  }

  /**
   * Removes a variant from the cart.
   */
  async removeItem(sessionToken: string, variantId: string): Promise<PersistedCart> {
    const cart = await this.getOrCreate(sessionToken);
    cart.items = cart.items.filter((i) => i.variantId !== variantId);
    cart.updatedAt = new Date();
    cartsStore.set(sessionToken, cart);
    return cart;
  }

  /**
   * Empties the cart upon checkout completion.
   */
  async clear(sessionToken: string): Promise<PersistedCart> {
    const cart = await this.getOrCreate(sessionToken);
    cart.items = [];
    cart.updatedAt = new Date();
    cartsStore.set(sessionToken, cart);
    return cart;
  }

  /**
   * Deletes a cart completely (e.g. after merging guest cart).
   */
  async deleteCart(sessionToken: string): Promise<void> {
    cartsStore.delete(sessionToken);
  }

  /**
   * Resets carts store for testing.
   */
  public resetForTesting() {
    cartsStore.clear();
  }
}

export const cartRepository = new CartRepository();
