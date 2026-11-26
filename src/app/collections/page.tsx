/**
 * @page Collections
 * @description Category directory highlighting current seasons, capsules, and curated edits.
 */
'use client';

import React from 'react';
import Link from 'next/link';
import { ClothingRailSection } from '../../components/ClothingRailSection';
import productsData from '../../data/products.json';
import { Product } from '../../types';
import styles from './page.module.css';

export default function CollectionsPage() {
  const allProducts = productsData as Product[];

  const railTabs = [
    {
      id: 'all-apparel',
      label: 'All Apparel',
      products: allProducts,
      eyebrow: 'Yaperz Wardrobe · Interactive Clothing Rail',
      heading: 'Browse Every Garment On The Rail',
      ctaLabel: 'Shop All Products',
      ctaHref: '/collections/all-products',
    },
    {
      id: 'new-in',
      label: 'New In',
      products: allProducts.filter((p) => p.collections.includes('new-in')),
      eyebrow: 'Latest Drop',
      heading: 'New In Streetwear',
      ctaLabel: 'Open New In',
      ctaHref: '/collections/new-in',
    },
    {
      id: 'winter-collection',
      label: 'Winter',
      products: allProducts.filter((p) => p.collections.includes('winter-collection')),
      eyebrow: '450–500 GSM Loopback & Wool',
      heading: 'Winter Collection Rack',
      ctaLabel: 'Open Winter Collection',
      ctaHref: '/collections/winter-collection',
    },
    {
      id: 'bluorng-racing-club',
      label: 'Racing Club',
      products: allProducts.filter((p) => p.collections.includes('bluorng-racing-club')),
      eyebrow: 'Motorsport Capsule',
      heading: 'Racing Club Rack',
      ctaLabel: 'Open Racing Club',
      ctaHref: '/collections/bluorng-racing-club',
    },
    {
      id: 'summer-basics',
      label: 'Summer Basics',
      products: allProducts.filter((p) => p.collections.includes('summer-basics')),
      eyebrow: 'Core Collection',
      heading: 'Summer Basics Rack',
      ctaLabel: 'Open Summer Basics',
      ctaHref: '/collections/summer-basics',
    },
    {
      id: 'hoodies',
      label: 'Hoodies',
      products: allProducts.filter((p) => p.category === 'Hoodies'),
      eyebrow: 'Heavyweight Fleece',
      heading: 'Hoodies Rack',
      ctaLabel: 'Shop All Hoodies',
      ctaHref: '/collections/hoodies',
    },
    {
      id: 'jackets',
      label: 'Jackets',
      products: allProducts.filter((p) => p.category === 'Jackets'),
      eyebrow: 'Leather & Varsity',
      heading: 'Jackets Rack',
      ctaLabel: 'Shop All Jackets',
      ctaHref: '/collections/jackets',
    },
    {
      id: 't-shirts',
      label: 'T-Shirts',
      products: allProducts.filter((p) => p.category === 'T-shirts'),
      eyebrow: '260–280 GSM Combed Cotton',
      heading: 'Oversized T-Shirts Rack',
      ctaLabel: 'Shop All T-Shirts',
      ctaHref: '/collections/t-shirts',
    },
    {
      id: 'shirts',
      label: 'Shirts',
      products: allProducts.filter((p) => p.category === 'Shirts'),
      eyebrow: 'Linen & Resort',
      heading: 'Shirts Rack',
      ctaLabel: 'Shop All Shirts',
      ctaHref: '/collections/shirts',
    },
    {
      id: 'polos',
      label: 'Polos',
      products: allProducts.filter((p) => p.category === 'Polos'),
      eyebrow: 'Polo Club Knitwear',
      heading: 'Knitted Polos Rack',
      ctaLabel: 'Shop All Polos',
      ctaHref: '/collections/polos',
    },
  ];

  const collectionsList = [
    {
      title: 'Winter Collection',
      slug: 'winter-collection',
      image: '/images/products/hoodie-brown-1.jpg',
      count: allProducts.filter((p) => p.collections.includes('winter-collection')).length
    },
    {
      title: 'Racing Club',
      slug: 'bluorng-racing-club',
      image: '/images/products/jacket-racing-1.jpg',
      count: allProducts.filter((p) => p.collections.includes('bluorng-racing-club')).length
    },
    {
      title: 'Summer Basics',
      slug: 'summer-basics',
      image: '/images/products/tee-basics-white-1.jpg',
      count: allProducts.filter((p) => p.collections.includes('summer-basics')).length
    },
    {
      title: 'Hoodies',
      slug: 'hoodies',
      image: '/images/products/hoodie-cobalt-1.jpg',
      count: allProducts.filter((p) => p.category === 'Hoodies').length
    },
    {
      title: 'Jackets',
      slug: 'jackets',
      image: '/images/products/jacket-varsity-1.jpg',
      count: allProducts.filter((p) => p.category === 'Jackets').length
    },
    {
      title: 'T-Shirts',
      slug: 't-shirts',
      image: '/images/products/tee-racing-orange-1.jpg',
      count: allProducts.filter((p) => p.category === 'T-shirts').length
    },
    {
      title: 'Shirts',
      slug: 'shirts',
      image: '/images/products/shirt-yacht-1.jpg',
      count: allProducts.filter((p) => p.category === 'Shirts').length
    },
    {
      title: 'Knitted Polos',
      slug: 'polos',
      image: '/images/products/polo-knit-1.jpg',
      count: allProducts.filter((p) => p.category === 'Polos').length
    },
    {
      title: 'Caps',
      slug: 'caps',
      image: '/images/products/cap-racing-1.jpg',
      count: allProducts.filter((p) => p.collections.includes('caps')).length
    },
    {
      title: 'iPhone Cases',
      slug: 'iphone-case',
      image: '/images/products/case-denim-1.jpg',
      count: allProducts.filter((p) => p.collections.includes('iphone-case')).length
    },
    {
      title: 'All Products',
      slug: 'all-products',
      image: '/images/hero-desktop.png',
      count: allProducts.length
    }
  ];

  return (
    <div className={`${styles.container} container`}>
      <h1 className={styles.title}>Collections</h1>
      <ClothingRailSection
        tabs={railTabs}
        autoplay
        hanger="matte"
        className="mb-12"
      />
      <div className={styles.grid}>
        {collectionsList.map((col) => (
          <Link key={col.slug} href={`/collections/${col.slug}`} className={styles.card}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={col.image} alt={col.title} className={styles.image} />
            <div className={styles.overlay} />
            <div className={styles.content}>
              <h2 className={styles.cardTitle}>{col.title}</h2>
              <span className={styles.count}>{col.count} Products</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// Collections directory banner title
export const COLLECTIONS_PAGE_TITLE = 'All Collections & Drops';

// Default grid columns for collection cards
export const COLLECTIONS_GRID_COLUMNS = 'repeat(auto-fit, minmax(280px, 1fr))';
