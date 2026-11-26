/**
 * @page Collaborations
 * @description Brand partnership inquiry portal and gallery of creator capsules.
 */
'use client';

import React from 'react';
import Link from 'next/link';
import { ClothingRailSection } from '../../components/ClothingRailSection';
import productsData from '../../data/products.json';
import { Product } from '../../types';
import styles from './page.module.css';

export default function CollaborationsPage() {
  const allProducts = productsData as Product[];
  const basicsCapsule = allProducts.filter((p) => p.collections.includes('summer-basics'));
  const racingCapsule = allProducts.filter((p) => p.collections.includes('bluorng-racing-club'));
  const allCollabApparel = allProducts.filter(
    (p) =>
      p.collections.includes('summer-basics') ||
      p.collections.includes('bluorng-racing-club')
  );

  const collabs = [
    {
      title: 'Yaperz x Samay Raina',
      desc: 'An exclusive oversized basics capsule engineered in collaboration with stand-up comedian Samay Raina. Featuring custom gaming and chessboard inspired heavy embroidery details.',
      image: '/images/hero-desktop.png',
      link: '/collections/summer-basics'
    },
    {
      title: 'Motorsport Racing Club Drop',
      desc: 'Partnering with local track day organizations to bring track-ready aesthetics to the streets. Features chenille patches, vintage wash denims, and classic racing flags embroidery.',
      image: '/images/products/jacket-racing-1.jpg',
      link: '/collections/bluorng-racing-club'
    }
  ];

  return (
    <div className={`${styles.container} container`}>
      <h1 className={styles.title}>Collaborations</h1>
      <p className={styles.subtitle}>
        Explore our partner drops, lookbooks, and custom associations built with artists, creators, and community leaders.
      </p>

      <div className={styles.grid}>
        {collabs.map((col, idx) => (
          <div key={idx} className={styles.collabCard}>
            <div className={styles.imageWrapper}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={col.image} alt={col.title} className={styles.image} />
            </div>
            <div className={styles.details}>
              <h2 className={styles.collabTitle}>{col.title}</h2>
              <p className={styles.desc}>{col.desc}</p>
              <Link href={col.link} className={styles.link}>
                Shop the Drop
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-14">
        <ClothingRailSection
          hanger="matte"
          tabs={[
            {
              id: 'all-collabs',
              label: 'All Collab Pieces',
              products: allCollabApparel,
              eyebrow: 'Limited Edition Capsules',
              heading: 'Collaboration Drops On The Rail',
              ctaLabel: 'Browse All Collections',
              ctaHref: '/collections',
            },
            {
              id: 'samay-basics',
              label: 'Yaperz × Samay Raina',
              products: basicsCapsule,
              eyebrow: 'Oversized Basics Capsule',
              heading: 'Yaperz × Samay Raina Rack',
              ctaLabel: 'Shop Basics Capsule',
              ctaHref: '/collections/summer-basics',
            },
            {
              id: 'motorsport-racing',
              label: 'Motorsport Racing Club',
              products: racingCapsule,
              eyebrow: 'Track-Ready Streetwear',
              heading: 'Motorsport Racing Club Rack',
              ctaLabel: 'Shop Racing Club',
              ctaHref: '/collections/bluorng-racing-club',
            },
          ]}
        />
      </div>
    </div>
  );
}

// Collaboration application email endpoint
export const COLLAB_INQUIRY_EMAIL = 'collabs@yaperz.com';

// Maximum file size for lookbook uploads in MB
export const MAX_LOOKBOOK_UPLOAD_MB = 15;
