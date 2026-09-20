import { describe, it, expect } from 'vitest';
import {
  getStories,
  saveStories,
  getSiteConfig,
  saveSiteConfig,
  getCatalogProducts,
  getAdminOrders,
} from '../../src/lib/data-store';
import { StoryItem, SiteConfig } from '../../src/types';

describe('Admin Data Store & Persistence Module', () => {
  it('should retrieve stories and maintain required video story fields', () => {
    const stories = getStories();
    expect(Array.isArray(stories)).toBe(true);
    expect(stories.length).toBeGreaterThan(0);

    const first = stories[0];
    expect(first).toHaveProperty('id');
    expect(first).toHaveProperty('label');
    expect(first).toHaveProperty('thumbnail');
    expect(first).toHaveProperty('media');
    expect(first).toHaveProperty('ctaText');
    expect(first).toHaveProperty('ctaLink');
  });

  it('should correctly save and read back site configuration', () => {
    const initialConfig = getSiteConfig();
    expect(initialConfig.brand.name).toBeDefined();
    expect(initialConfig.hero.title).toBeDefined();

    const testConfig: SiteConfig = {
      ...initialConfig,
      brand: {
        ...initialConfig.brand,
        name: 'Yaperz Test Brand',
      },
    };

    saveSiteConfig(testConfig);
    const updatedConfig = getSiteConfig();
    expect(updatedConfig.brand.name).toBe('Yaperz Test Brand');

    // Restore initial config
    saveSiteConfig(initialConfig);
  });

  it('should retrieve catalog products with valid pricing and stock', () => {
    const products = getCatalogProducts();
    expect(Array.isArray(products)).toBe(true);
    expect(products.length).toBeGreaterThan(0);

    products.forEach((p) => {
      expect(typeof p.price).toBe('number');
      expect(p.price).toBeGreaterThan(0);
      expect(typeof p.inventory).toBe('number');
    });
  });

  it('should load orders for admin fulfillment tracking', () => {
    const orders = getAdminOrders();
    expect(Array.isArray(orders)).toBe(true);
    if (orders.length > 0) {
      const ord = orders[0];
      expect(ord.orderNumber).toBeDefined();
      expect(ord.status).toBeDefined();
      expect(typeof ord.grandTotal).toBe('number');
    }
  });

  it('should support adding and filtering video stories', () => {
    const currentStories = getStories();
    const mockStory: StoryItem = {
      id: `test-story-${Date.now()}`,
      label: 'Test Video Reel',
      thumbnail: '/images/hero-desktop.png',
      media: '/uploads/test-video.mp4',
      mediaType: 'video',
      ctaText: 'Test CTA',
      ctaLink: '/collections/caps',
      duration: 8,
      isActive: true,
    };

    saveStories([mockStory, ...currentStories]);
    const refreshed = getStories();
    expect(refreshed[0].id).toBe(mockStory.id);
    expect(refreshed[0].mediaType).toBe('video');

    // Clean up test story
    saveStories(currentStories);
  });
});
