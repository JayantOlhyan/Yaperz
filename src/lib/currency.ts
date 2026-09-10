/**
 * @file currency.ts
 * @description Monetary calculation utilities supporting both standard INR rupees and integer paise (minor units).
 * Enforces integer arithmetic for financial safety and GST calculations across server services.
 */

/**
 * Converts integer minor units (paise) to major INR units (rupees).
 * @param paise - Integer amount in paise (e.g. 1850000)
 * @returns Numeric rupee value (e.g. 18500)
 */
export function paiseToInr(paise: number): number {
  if (typeof paise !== 'number' || isNaN(paise)) return 0;
  return Math.round(paise) / 100;
}

/**
 * Converts major INR units (rupees) to integer minor units (paise).
 * @param inr - Numeric rupee value (e.g. 18500)
 * @returns Integer amount in paise (e.g. 1850000)
 */
export function inrToPaise(inr: number): number {
  if (typeof inr !== 'number' || isNaN(inr)) return 0;
  return Math.round(inr * 100);
}

/**
 * Formats integer paise into standard Indian Rupee (INR) representation.
 * @param paise - Amount in paise (e.g. 1850000)
 * @returns Formatted currency string (e.g. "₹18,500")
 */
export function formatPaise(paise: number): string {
  const inr = paiseToInr(paise);
  return formatINR(inr);
}

/**
 * Formats a numeric price in rupees into standard Indian Rupee (INR) representation.
 * @param amount - Price amount in rupees
 * @returns Formatted currency string with ₹ symbol
 */
export function formatINR(amount: number): string {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '₹0';
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Computes discount percentage savings between base and discounted price.
 */
export function calculateDiscountPercentage(price: number, comparePrice: number | null): number {
  if (!comparePrice || comparePrice <= price) return 0;
  return Math.round(((comparePrice - price) / comparePrice) * 100);
}

/**
 * Parses numeric price from formatted currency string.
 */
export function parseINR(formattedStr: string): number {
  const cleaned = formattedStr.replace(/[^0-9.-]+/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}
