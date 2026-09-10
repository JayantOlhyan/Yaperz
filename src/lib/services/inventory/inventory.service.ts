/**
 * @file inventory.service.ts
 * @description Inventory Management Business Service.
 * Manages atomic inventory checks, stock reservation workflows, and restock actions.
 */

import { inventoryRepository } from '../../db/repositories/inventory.repository';

export class InventoryService {
  /**
   * Asserts whether a given SKU variant has sufficient stock for purchase.
   */
  async verifyAvailability(variantId: string, quantity: number): Promise<boolean> {
    const stock = await inventoryRepository.getStock(variantId);
    return stock.available >= quantity;
  }

  /**
   * Reserves items atomically during checkout.
   */
  async reserveItems(
    items: Array<{ variantId: string; quantity: number }>,
    orderId?: string
  ) {
    const reserved: Array<{ variantId: string; quantity: number }> = [];

    try {
      for (const item of items) {
        await inventoryRepository.reserveStock(item.variantId, item.quantity, orderId);
        reserved.push(item);
      }
    } catch (err) {
      // Rollback any items already reserved in this transaction
      for (const item of reserved) {
        await inventoryRepository.releaseReservation(item.variantId, item.quantity, orderId);
      }
      throw err;
    }
  }

  /**
   * Commits reserved stock upon verified payment.
   */
  async commitItems(
    items: Array<{ variantId: string; quantity: number }>,
    orderId: string
  ) {
    for (const item of items) {
      await inventoryRepository.commitStock(item.variantId, item.quantity, orderId);
    }
  }

  /**
   * Releases stock reservations if checkout is abandoned or payment rejected.
   */
  async releaseItems(
    items: Array<{ variantId: string; quantity: number }>,
    orderId?: string
  ) {
    for (const item of items) {
      await inventoryRepository.releaseReservation(item.variantId, item.quantity, orderId);
    }
  }

  /**
   * Restores inventory for returned or cancelled order items.
   */
  async restoreItems(
    items: Array<{ variantId: string; quantity: number }>,
    referenceId: string,
    reason: string
  ) {
    for (const item of items) {
      await inventoryRepository.restoreInventory(item.variantId, item.quantity, referenceId, reason);
    }
  }
}

export const inventoryService = new InventoryService();
