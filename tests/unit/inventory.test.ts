/**
 * @file inventory.test.ts
 * @description Unit Tests for Inventory Management and Stock Reservation Workflows.
 * Tests atomic stock decrements, reservation releases, and audit movement records.
 */

import { describe, it, expect } from 'vitest';
import { inventoryRepository } from '@/lib/db/repositories/inventory.repository';
import { inventoryService } from '@/lib/services/inventory/inventory.service';
import { InsufficientStockError, OutOfStockError } from '@/lib/errors';

describe('Inventory Repository & Service', () => {
  const testVariantId = 'var-2-blk-s'; // Racing Club Leather Bomber Jacket (S)

  it('retrieves initial stock levels for a valid variant', async () => {
    const stock = await inventoryRepository.getStock(testVariantId);
    expect(stock.inventory).toBeGreaterThanOrEqual(2);
    expect(stock.reserved).toBe(0);
    expect(stock.available).toBe(stock.inventory);
  });

  it('atomically reserves available stock and logs inventory movement', async () => {
    const initialStock = await inventoryRepository.getStock(testVariantId);
    const reserveQty = 1;

    const variant = await inventoryRepository.reserveStock(testVariantId, reserveQty, 'test-order-101');
    expect(variant.reservedQuantity).toBe(reserveQty);

    const postStock = await inventoryRepository.getStock(testVariantId);
    expect(postStock.available).toBe(initialStock.available - reserveQty);

    const movements = await inventoryRepository.getMovements(testVariantId);
    expect(movements.length).toBeGreaterThan(0);
    const lastMovement = movements[movements.length - 1];
    expect(lastMovement.movementType).toBe('ORDER_RESERVED');
    expect(lastMovement.referenceId).toBe('test-order-101');
  });

  it('releases reservation back to available inventory', async () => {
    const beforeRelease = await inventoryRepository.getStock(testVariantId);
    await inventoryRepository.releaseReservation(testVariantId, 1, 'test-order-101');

    const afterRelease = await inventoryRepository.getStock(testVariantId);
    expect(afterRelease.available).toBe(beforeRelease.available + 1);
    expect(afterRelease.reserved).toBe(beforeRelease.reserved - 1);
  });

  it('prevents overselling by throwing InsufficientStockError when requested > available', async () => {
    const stock = await inventoryRepository.getStock(testVariantId);
    const excessQuantity = stock.available + 999;

    await expect(
      inventoryRepository.reserveStock(testVariantId, excessQuantity)
    ).rejects.toThrow(InsufficientStockError);
  });

  it('throws OutOfStockError when variant ID does not exist', async () => {
    await expect(
      inventoryRepository.getStock('var-fake-nonexistent')
    ).rejects.toThrow(OutOfStockError);
  });

  it('coordinates multi-item reservations with atomic rollback on failure', async () => {
    // Attempting multi-item reservation where second item has impossible quantity
    await expect(
      inventoryService.reserveItems([
        { variantId: testVariantId, quantity: 1 },
        { variantId: 'var-fake-fail', quantity: 9999 },
      ])
    ).rejects.toThrow();

    // Verify first item reservation was rolled back
    const stock = await inventoryRepository.getStock(testVariantId);
    expect(stock.reserved).toBe(0);
  });
});
