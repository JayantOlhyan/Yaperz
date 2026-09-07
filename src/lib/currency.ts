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
