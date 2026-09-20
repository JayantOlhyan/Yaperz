import fs from 'fs';
import path from 'path';
import { StoryItem, SiteConfig, Product, AdminOrder } from '../types';

const DATA_DIR = path.join(process.cwd(), 'src', 'data');

function readJsonFile<T>(fileName: string, fallback: T): T {
  try {
    const filePath = path.join(DATA_DIR, fileName);
    if (!fs.existsSync(filePath)) {
      return fallback;
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content) as T;
  } catch (error) {
    console.error(`Error reading ${fileName}:`, error);
    return fallback;
  }
}

function writeJsonFile<T>(fileName: string, data: T): boolean {
  try {
    const filePath = path.join(DATA_DIR, fileName);
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error(`Error writing ${fileName}:`, error);
    return false;
  }
}

// Stories
export function getStories(): StoryItem[] {
  return readJsonFile<StoryItem[]>('stories.json', []);
}

export function saveStories(stories: StoryItem[]): boolean {
  return writeJsonFile<StoryItem[]>('stories.json', stories);
}

// Site Configuration
export function getSiteConfig(): SiteConfig {
  const fallback: SiteConfig = {
    brand: {
      name: 'Yaperz',
      tagline: 'Premium Streetwear Redefined',
      displayPicture: '/images/hero-desktop.png',
      announcement: {
        enabled: true,
        text: 'COMPLIMENTARY DOMESTIC EXPRESS SHIPPING ACROSS INDIA',
        link: '/collections/new-in'
      }
    },
    hero: {
      title: 'Premium Streetwear\nRedefined.',
      subtitle: 'Discover artisanal oversized silhouettes engineered with heavyweight luxury cotton.',
      ctaText: 'Shop Now',
      ctaLink: '/collections/new-in',
      mediaType: 'image',
      desktopMedia: '/images/hero-desktop.png',
      mobileMedia: '/images/hero-mobile.png'
    },
    spotlights: []
  };
  return readJsonFile<SiteConfig>('site-config.json', fallback);
}

export function saveSiteConfig(config: SiteConfig): boolean {
  return writeJsonFile<SiteConfig>('site-config.json', config);
}

// Products
export function getCatalogProducts(): Product[] {
  return readJsonFile<Product[]>('products.json', []);
}

export function saveCatalogProducts(products: Product[]): boolean {
  return writeJsonFile<Product[]>('products.json', products);
}

// Orders
export function getAdminOrders(): AdminOrder[] {
  return readJsonFile<AdminOrder[]>('orders.json', []);
}

export function saveAdminOrders(orders: AdminOrder[]): boolean {
  return writeJsonFile<AdminOrder[]>('orders.json', orders);
}
