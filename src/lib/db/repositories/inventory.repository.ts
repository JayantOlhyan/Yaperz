/**
 * @file inventory.repository.ts
 * @description Inventory Repository managing atomic SKU stock reservations and audit movements.
 * Enforces transactional consistency to eliminate overselling and race conditions.
 */

import { normalizedCatalog, NormalizedVariant } from '../catalog-data';
import { InsufficientStockError, OutOfStockError } from '../../errors';

export interface InventoryMovementRecord {
  id: string;
  variantId: string;
  movementType:
    | 'INITIAL_SEED'
    | 'ORDER_RESERVED'
    | 'ORDER_COMMITTED'
    | 'RESERVATION_RELEASED'
    | 'ORDER_CANCELLED'
    | 'RETURN_RESTOCKED'
    | 'DAMAGE_WRITEOFF'
    | 'MANUAL_ADJUSTMENT';
  quantity: number;
  referenceId?: string;
  reason?: string;
  createdAt: Date;
}

// In-memory movement audit ledger
const movementLog: InventoryMovementRecord[] = [];

export class InventoryRepository {
  /**
   * Retrieves current stock and reservation levels for a variant.
   */
  async getStock(variantId: string): Promise<{
    available: number;
    inventory: number;
    reserved: number;
  }> {
    for (const prod of normalizedCatalog.products) {
      const v = prod.variants.find((item) => item.id === variantId);
      if (v) {
        return {
          inventory: v.inventoryQuantity,
          reserved: v.reservedQuantity,
          available: Math.max(0, v.inventoryQuantity - v.reservedQuantity),
        };
      }
    }
    throw new OutOfStockError(`Variant not found: ${variantId}`);
  }

  /**
   * Atomically reserves inventory for an order checkout session.
   */
  async reserveStock(
    variantId: string,
    quantity: number,
    orderId?: string
  ): Promise<NormalizedVariant> {
    for (const prod of normalizedCatalog.products) {
      const v = prod.variants.find((item) => item.id === variantId);
      if (v) {
        const available = v.inventoryQuantity - v.reservedQuantity;
        if (available < quantity) {
          throw new InsufficientStockError(
            `Insufficient stock for SKU ${v.sku}. Available: ${available}, requested: ${quantity}`
          );
        }

        v.reservedQuantity += quantity;

        movementLog.push({
          id: `mov-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          variantId,
          movementType: 'ORDER_RESERVED',
          quantity: -quantity,
          referenceId: orderId,
          reason: `Reserved for order ${orderId || 'in-progress'}`,
          createdAt: new Date(),
        });

        return { ...v };
      }
    }
    throw new OutOfStockError(`Variant not found: ${variantId}`);
  }

  /**
   * Commits reserved stock upon confirmed payment capture.
   */
  async commitStock(
    variantId: string,
    quantity: number,
    orderId: string
  ): Promise<NormalizedVariant> {
    for (const prod of normalizedCatalog.products) {
      const v = prod.variants.find((item) => item.id === variantId);
      if (v) {
        v.reservedQuantity = Math.max(0, v.reservedQuantity - quantity);
        v.inventoryQuantity = Math.max(0, v.inventoryQuantity - quantity);

        movementLog.push({
          id: `mov-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          variantId,
          movementType: 'ORDER_COMMITTED',
          quantity: -quantity,
          referenceId: orderId,
          reason: `Committed payment for order ${orderId}`,
          createdAt: new Date(),
        });

        return { ...v };
      }
    }
    throw new OutOfStockError(`Variant not found: ${variantId}`);
  }

  /**
   * Releases reserved stock when an order checkout fails or times out.
   */
  async releaseReservation(
    variantId: string,
    quantity: number,
    orderId?: string
  ): Promise<void> {
    for (const prod of normalizedCatalog.products) {
      const v = prod.variants.find((item) => item.id === variantId);
      if (v) {
        v.reservedQuantity = Math.max(0, v.reservedQuantity - quantity);

        movementLog.push({
          id: `mov-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          variantId,
          movementType: 'RESERVATION_RELEASED',
          quantity: quantity,
          referenceId: orderId,
          reason: `Reservation released for order ${orderId || 'cancelled'}`,
          createdAt: new Date(),
        });
        return;
      }
    }
  }

  /**
   * Restores inventory when a completed order is cancelled or item returned.
   */
  async restoreInventory(
    variantId: string,
    quantity: number,
    referenceId: string,
    reason: string
  ): Promise<void> {
    for (const prod of normalizedCatalog.products) {
      const v = prod.variants.find((item) => item.id === variantId);
      if (v) {
        v.inventoryQuantity += quantity;

        movementLog.push({
          id: `mov-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          variantId,
          movementType: 'ORDER_CANCELLED',
          quantity,
          referenceId,
          reason,
          createdAt: new Date(),
        });
        return;
      }
    }
  }

  /**
   * Retrieves the movement history for a given SKU variant.
   */
  async getMovements(variantId: string): Promise<InventoryMovementRecord[]> {
    return movementLog.filter((m) => m.variantId === variantId);
  }
}

export const inventoryRepository = new InventoryRepository();
