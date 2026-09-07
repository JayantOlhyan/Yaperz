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
