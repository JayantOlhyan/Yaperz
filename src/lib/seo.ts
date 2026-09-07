import { Metadata } from 'next';
import { APP_NAME, APP_DESCRIPTION } from './constants';

/**
 * Builds standard OpenGraph and Twitter card metadata for Next.js pages.
 */
export function buildMetaTags(title: string, description = APP_DESCRIPTION, slug = ''): Metadata {
  const fullTitle = `${title} | ${APP_NAME}`;
  const url = `https://yaperz.com${slug}`;

  return {
    title: fullTitle,
    description,
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: APP_NAME,
      locale: 'en_IN',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
    },
  };
}
