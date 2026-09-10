/**
 * @file cart.service.ts
 * @description Server-Side Cart Service.
 * Coordinates session binding, stock availability verification, and server-side cart line pricing.
 */

import { cartRepository } from '../../db/repositories/cart.repository';
import { productRepository } from '../../db/repositories/product.repository';
import { inventoryService } from '../inventory/inventory.service';
import { InsufficientStockError } from '../../errors';
import { formatPaise } from '../../currency';

export interface CartLineItemDetailed {
  variantId: string;
  productId: string;
  title: string;
  sku: string;
  size: string;
  color: string;
  imageUrl: string;
  unitPricePaise: number;
  unitPriceFormatted: string;
  quantity: number;
  lineTotalPaise: number;
  lineTotalFormatted: string;
}

export interface DetailedServerCart {
  id: string;
  sessionToken: string;
  items: CartLineItemDetailed[];
  itemCount: number;
  subtotalPaise: number;
  subtotalFormatted: string;
}

export class CartService {
  /**
   * Retrieves enriched server cart with full product details, image, and line totals.
   */
  async getDetailedCart(sessionToken: string): Promise<DetailedServerCart> {
    const cart = await cartRepository.getOrCreate(sessionToken);
    const detailedItems: CartLineItemDetailed[] = [];
    let subtotalPaise = 0;
    let itemCount = 0;

    for (const item of cart.items) {
      const variant = await productRepository.findVariantById(item.variantId);
      if (!variant) continue;

      const product = await productRepository.findById(variant.productId);
      const lineTotalPaise = variant.price * item.quantity;
      subtotalPaise += lineTotalPaise;
      itemCount += item.quantity;

      detailedItems.push({
        variantId: variant.id,
        productId: variant.productId,
        title: product?.title || 'Yaperz Product',
        sku: variant.sku,
        size: variant.size,
        color: variant.colorName,
        imageUrl: product?.images[0]?.url || '/images/products/placeholder.jpg',
        unitPricePaise: variant.price,
        unitPriceFormatted: formatPaise(variant.price),
        quantity: item.quantity,
        lineTotalPaise,
        lineTotalFormatted: formatPaise(lineTotalPaise),
      });
    }

    return {
      id: cart.id,
      sessionToken: cart.sessionToken,
      items: detailedItems,
      itemCount,
      subtotalPaise,
      subtotalFormatted: formatPaise(subtotalPaise),
    };
  }

  /**
   * Adds an item to the server-side cart with inventory check.
   */
  async addItem(sessionToken: string, variantId: string, quantity: number): Promise<DetailedServerCart> {
    const isAvailable = await inventoryService.verifyAvailability(variantId, quantity);
    if (!isAvailable) {
      throw new InsufficientStockError('Requested quantity exceeds available inventory');
    }

    await cartRepository.addItem(sessionToken, variantId, quantity);
    return this.getDetailedCart(sessionToken);
  }

  /**
   * Updates quantity of an item in the cart.
   */
  async updateQuantity(sessionToken: string, variantId: string, quantity: number): Promise<DetailedServerCart> {
    if (quantity > 0) {
      const isAvailable = await inventoryService.verifyAvailability(variantId, quantity);
      if (!isAvailable) {
        throw new InsufficientStockError('Requested quantity exceeds available inventory');
      }
    }

    await cartRepository.updateItemQuantity(sessionToken, variantId, quantity);
    return this.getDetailedCart(sessionToken);
  }

  /**
   * Removes an item from the cart.
   */
  async removeItem(sessionToken: string, variantId: string): Promise<DetailedServerCart> {
    await cartRepository.removeItem(sessionToken, variantId);
    return this.getDetailedCart(sessionToken);
  }

  /**
   * Clears all items in the cart.
   */
  async clear(sessionToken: string): Promise<DetailedServerCart> {
    await cartRepository.clear(sessionToken);
    return this.getDetailedCart(sessionToken);
  }
}

export const cartService = new CartService();
