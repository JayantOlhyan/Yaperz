'use client';

import React from 'react';
import Link from 'next/link';
import productsData from '../../data/products.json';
import { Product } from '../../types';
import styles from './page.module.css';

export default function CollectionsPage() {
  const allProducts = productsData as Product[];

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
