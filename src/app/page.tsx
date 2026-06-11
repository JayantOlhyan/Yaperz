'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { StoriesBar } from '../components/StoriesBar';
import { ProductCard } from '../components/ProductCard';
import productsData from '../data/products.json';
import { Product } from '../types';
import styles from './page.module.css';

export default function Home() {
  const [isSeoExpanded, setIsSeoExpanded] = useState(false);

  // Filter products for various sections
  const allProducts = productsData as Product[];
  const latestDrops = allProducts.filter((p) => p.collections.includes('new-in')).slice(0, 6);
  const capProducts = allProducts.filter((p) => p.category === 'Caps').slice(0, 4);
  const caseProducts = allProducts.filter((p) => p.category === 'Cases').slice(0, 4);

  return (
    <>
      {/* 1. Stories Highlights Bar */}
      <StoriesBar />

      {/* 2. Hero Banner */}
      <section className={styles.heroSection}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/hero-desktop.png"
          alt="Yaperz Premium Streetwear Editorial"
          className={styles.heroImage}
        />
        <div className={styles.heroOverlay}>
          <h1 className={styles.heroTitle}>
            Premium Streetwear<br />
            Redefined.
          </h1>
          <Link href="/collections/new-in" className={styles.heroCTA}>
            Shop Now
          </Link>
        </div>
      </section>

      {/* 3. Latest Drop / New In Section */}
      <section className={styles.section}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Latest Drop</h2>
            <Link href="/collections/new-in" className={styles.discoverLink}>
              Discover More
            </Link>
          </div>
          <div className={styles.scrollGrid}>
            {latestDrops.map((product) => (
              <div key={product.id} className={styles.scrollGridItem}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Collection Spotlight Banner Grid */}
      <section className={styles.section}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Spotlight</h2>
          </div>
          <div className={styles.spotlightGrid}>
            <Link href="/collections/winter-collection" className={styles.spotlightCard}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/products/hoodie-brown-1.jpg"
                alt="Winter Collection"
                className={styles.spotlightImage}
              />
              <div className={styles.spotlightOverlay} />
              <div className={styles.spotlightContent}>
                <h3 className={styles.spotlightTitle}>Winter Collection</h3>
                <span className={styles.spotlightCTA}>Shop Collection</span>
              </div>
            </Link>
            <Link href="/collections/bluorng-racing-club" className={styles.spotlightCard}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/products/jacket-racing-1.jpg"
                alt="Racing Club"
                className={styles.spotlightImage}
              />
              <div className={styles.spotlightOverlay} />
              <div className={styles.spotlightContent}>
                <h3 className={styles.spotlightTitle}>Racing Club</h3>
                <span className={styles.spotlightCTA}>Shop Collection</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* 5. Caps Section */}
      <section className={styles.section}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Signature Caps</h2>
            <Link href="/collections/caps" className={styles.discoverLink}>
              Shop All Caps
            </Link>
          </div>
          <div className={styles.scrollGrid}>
            {capProducts.map((product) => (
              <div key={product.id} className={styles.scrollGridItem}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. iPhone Cases Section */}
      <section className={styles.section}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>iPhone Cases</h2>
            <Link href="/collections/iphone-case" className={styles.discoverLink}>
              View All Cases
            </Link>
          </div>
          <div className={styles.scrollGrid}>
            {caseProducts.map((product) => (
              <div key={product.id} className={styles.scrollGridItem}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. SEO Copy Block */}
      <section className={styles.seoCopySection}>
        <div className="container">
          <div
            className={styles.seoHeader}
            onClick={() => setIsSeoExpanded(!isSeoExpanded)}
          >
            <h3 className={styles.seoTitle}>About Yaperz Streetwear India</h3>
            {isSeoExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
          {isSeoExpanded && (
            <div className={styles.seoContent}>
              <p>
                Welcome to Yaperz, India's premier high-end unisex streetwear destination. Designed
                for Gen-Z and urban streetwear enthusiasts in Delhi, Mumbai, Bangalore, and across India,
                our drops feature oversized t-shirts, heavy combed cotton hoodies, statement jackets,
                racing club inspired caps, and premium custom accessories.
              </p>
              <h4>Why Choose Yaperz?</h4>
              <p>
                We believe in creating high-quality garments that balance form and functionality. Every piece
                is constructed from heavy-weight fabrics (up to 500GSM loopback cotton for our hoodies and
                280GSM combed cotton for our graphic tees). We focus on unisex sizing, dropped shoulder yokes,
                high-density screen prints, and premium embroidery details.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
