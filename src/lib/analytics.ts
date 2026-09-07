/**
 * Dispatches a client-side analytics event to console or provider.
 */
export function trackEvent(eventName: string, params?: Record<string, unknown>): void {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.log(`[Analytics] ${eventName}`, params);
  }
}

/**
 * Tracks route or page navigation views.
 */
export function trackPageView(path: string): void {
  trackEvent('page_view', { path });
}
