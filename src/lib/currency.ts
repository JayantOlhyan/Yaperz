/**
 * Formats a numeric price into standard Indian Rupee (INR) representation.
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
