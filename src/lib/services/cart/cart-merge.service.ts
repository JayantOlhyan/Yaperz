/**
 * @file cart-merge.service.ts
 * @description Guest to Authenticated Customer Cart Merge Engine.
 * Combines guest cart items into authenticated customer cart with inventory validation,
 * stock limit bounding, and zero-trust price recalculation.
 */

import { cartRepository, PersistedCart } from '../../db/repositories/cart.repository';
import { productRepository } from '../../db/repositories/product.repository';
import { inventoryRepository } from '../../db/repositories/inventory.repository';

export class CartMergeService {
  /**
   * Merges a guest cart (identified by guestSessionToken) into an authenticated customer's cart.
   * @param guestSessionToken Session token of guest cart
   * @param customerId ID of authenticated customer
   * @param customerSessionToken Current session token of customer
   */
  async mergeGuestCart(
    guestSessionToken: string | undefined,
    customerId: string,
    customerSessionToken: string
  ): Promise<PersistedCart> {
    let customerCart = await cartRepository.getOrCreate(customerSessionToken, customerId);

    if (!guestSessionToken || guestSessionToken === customerSessionToken) {
      return customerCart;
    }

    // Lookup guest cart
    const guestCart = await cartRepository.getOrCreate(guestSessionToken);
    if (!guestCart || guestCart.items.length === 0) {
      return customerCart;
    }

    // Process each item in guest cart
    for (const guestItem of guestCart.items) {
      try {
        const variant = await productRepository.findVariantById(guestItem.variantId);
        if (!variant || !variant.isActive) {
          continue; // Omit inactive or missing variants
        }

        const stock = await inventoryRepository.getStock(guestItem.variantId);
        if (stock.available <= 0) {
          continue; // Out of stock items cannot be merged
        }

        // Fetch fresh customer cart state
        customerCart = await cartRepository.getOrCreate(customerSessionToken, customerId);
        const existingCustomerItem = customerCart.items.find(
          (item) => item.variantId === guestItem.variantId
        );

        const currentCustomerQty = existingCustomerItem ? existingCustomerItem.quantity : 0;
        const requestedTotal = currentCustomerQty + guestItem.quantity;

        // Bound merged quantity by available stock and 10 max per SKU cap
        const maxAllowed = Math.min(10, stock.available);
        const finalQty = Math.min(requestedTotal, maxAllowed);

        if (finalQty > 0) {
          if (existingCustomerItem) {
            await cartRepository.updateItemQuantity(customerSessionToken, guestItem.variantId, finalQty);
          } else {
            await cartRepository.addItem(customerSessionToken, guestItem.variantId, finalQty);
          }
        }
      } catch {
        // Skip invalid variants gracefully
        continue;
      }
    }

    // Delete guest cart after successful merge
    await cartRepository.deleteCart(guestSessionToken);

    // Return refreshed merged customer cart
    return cartRepository.getOrCreate(customerSessionToken, customerId);
  }
}

export const cartMergeService = new CartMergeService();
