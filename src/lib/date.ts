/**
 * Formats ISO date string into readable human date.
 */
export function formatDate(isoDate: string): string {
  try {
    const date = new Date(isoDate);
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return isoDate;
  }
}

/**
 * Computes estimated delivery range (3-5 business days from current date).
 */
export function getEstimatedDeliveryRange(daysFromNowMin = 3, daysFromNowMax = 5): string {
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + daysFromNowMin);

  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + daysFromNowMax);

  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
  const minStr = new Intl.DateTimeFormat('en-IN', options).format(minDate);
  const maxStr = new Intl.DateTimeFormat('en-IN', options).format(maxDate);

  return `${minStr} - ${maxStr}`;
}
