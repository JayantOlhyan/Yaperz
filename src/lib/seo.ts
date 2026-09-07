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

/**
 * Generates JSON-LD structured schema script object for products.
 */
export function generateStructuredProductData(product: {
  title: string;
  description: string;
  price: number;
  images: string[];
  slug: string;
}) {
  return {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.title,
    image: product.images,
    description: product.description,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'INR',
      price: product.price,
      availability: 'https://schema.org/InStock',
      url: `https://yaperz.com/products/${product.slug}`,
    },
  };
}

/**
 * Generates JSON-LD BreadcrumbList schema.
 */
export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
