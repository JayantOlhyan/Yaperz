/**
 * @page Home
 * @description Storefront homepage featuring dynamic hero banner (video/image),
 * stories reel, seasonal collections, spotlight features, and trending products.
 */
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { StoriesBar } from '../components/StoriesBar';
import { ProductCard } from '../components/ProductCard';
import { ClothingRailSection } from '../components/ClothingRailSection';
import productsData from '../data/products.json';
import { Product, SiteConfig } from '../types';
import styles from './page.module.css';

const DEFAULT_CONFIG: SiteConfig = {
  brand: {
    name: 'Yaperz',
    tagline: 'Premium Streetwear Redefined',
    displayPicture: '/images/hero-desktop.png',
    announcement: {
      enabled: true,
      text: 'COMPLIMENTARY DOMESTIC EXPRESS SHIPPING ACROSS INDIA | NEW IN: BLUORNG RACING DROP',
      link: '/collections/new-in',
    },
  },
  hero: {
    title: 'Premium Streetwear\nRedefined.',
    subtitle: 'Discover artisanal oversized silhouettes engineered with heavyweight luxury cotton.',
    ctaText: 'Shop Now',
    ctaLink: '/collections/new-in',
    mediaType: 'image',
    desktopMedia: '/images/hero-desktop.png',
    mobileMedia: '/images/hero-mobile.png',
  },
  spotlights: [
    {
      id: 'spotlight-1',
      title: 'Winter Collection',
      subtitle: 'Heavyweight French Terry Hoodies & Outerwear',
      image: '/images/products/hoodie-brown-1.jpg',
      link: '/collections/winter-collection',
      cta: 'Shop Collection',
    },
    {
      id: 'spotlight-2',
      title: 'Racing Club',
      subtitle: 'Satin Bombers & High-Octane Streetwear',
      image: '/images/products/jacket-racing-1.jpg',
      link: '/collections/bluorng-racing-club',
      cta: 'Shop Collection',
    },
  ],
};

export default function Home() {
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(DEFAULT_CONFIG);
  const [isSeoExpanded, setIsSeoExpanded] = useState(false);

  // Fetch dynamic site config
  useEffect(() => {
    fetch('/api/site-config')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setSiteConfig(data.data);
        }
      })
      .catch(() => {
        // Keep default config
      });
  }, []);

  // Filter products for various sections
  const allProducts = productsData as Product[];
  const latestDrops = allProducts.filter((p) => p.collections.includes('new-in')).slice(0, 6);
  const hoodieProducts = allProducts.filter((p) => p.category === 'Hoodies');
  const jacketProducts = allProducts.filter((p) => p.category === 'Jackets');
  const outerwearProducts = allProducts.filter(
    (p) => p.category === 'Hoodies' || p.category === 'Jackets'
  );
  const racingProducts = allProducts.filter((p) =>
    p.collections.includes('bluorng-racing-club')
  );
  const teeProducts = allProducts.filter((p) => p.category === 'T-shirts');
  const shirtProducts = allProducts.filter((p) => p.category === 'Shirts');
  const poloProducts = allProducts.filter((p) => p.category === 'Polos');
  const coreTopsProducts = allProducts.filter(
    (p) =>
      p.category === 'T-shirts' ||
      p.category === 'Shirts' ||
      p.category === 'Polos'
  );
  const capProducts = allProducts.filter((p) => p.category === 'Caps').slice(0, 4);
  const caseProducts = allProducts.filter((p) => p.category === 'Cases').slice(0, 4);

  const isHeroVideo =
    siteConfig.hero.mediaType === 'video' ||
    siteConfig.hero.desktopMedia.match(/\.(mp4|webm|mov)$/i);

  return (
    <>
      {/* 1. Stories Highlights Bar */}
      <StoriesBar />

      {/* 2. Hero Banner (Supports Video & Editorial Image) */}
      <section className={styles.heroSection}>
        {isHeroVideo ? (
          <video
            src={siteConfig.hero.desktopMedia}
            autoPlay
            loop
            muted
            playsInline
            className={styles.heroVideo}
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={siteConfig.hero.desktopMedia || '/images/hero-desktop.png'}
            alt="Yaperz Premium Streetwear Editorial"
            className={styles.heroImage}
          />
        )}
        <div className={styles.heroOverlay}>
          <h1 className={styles.heroTitle}>
            {siteConfig.hero.title.split('\n').map((line, idx) => (
              <React.Fragment key={idx}>
                {line}
                {idx < siteConfig.hero.title.split('\n').length - 1 && <br />}
              </React.Fragment>
            ))}
          </h1>
          <Link href={siteConfig.hero.ctaLink || '/collections/new-in'} className={styles.heroCTA}>
            {siteConfig.hero.ctaText || 'Shop Now'}
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
          <ClothingRailSection
            products={latestDrops}
            eyebrow="New Season · Latest Drop"
            heading="Handle The Latest Drop"
            caption="Brush along the rail, slide a hanger, or lift any piece to inspect front & back."
            ctaLabel="Shop Latest Drop"
            ctaHref="/collections/new-in"
            autoplay
            hanger="matte"
            className="mb-10"
          />
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
            {(siteConfig.spotlights && siteConfig.spotlights.length > 0
              ? siteConfig.spotlights
              : DEFAULT_CONFIG.spotlights
            ).map((spotlight) => (
              <Link key={spotlight.id} href={spotlight.link} className={styles.spotlightCard}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={spotlight.image}
                  alt={spotlight.title}
                  className={styles.spotlightImage}
                />
                <div className={styles.spotlightOverlay} />
                <div className={styles.spotlightContent}>
                  <h3 className={styles.spotlightTitle}>{spotlight.title}</h3>
                  <span className={styles.spotlightCTA}>{spotlight.cta || 'Shop Collection'}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4b. Heavyweight Outerwear & Hoodies Clothing Rail */}
      <section className={styles.section}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Hoodies &amp; Outerwear</h2>
            <Link href="/collections/winter-collection" className={styles.discoverLink}>
              Shop Winter Edit
            </Link>
          </div>
          <ClothingRailSection
            hanger="matte"
            tabs={[
              {
                id: 'all-outerwear',
                label: 'All Outerwear',
                products: outerwearProducts,
                eyebrow: 'Heavyweight Streetwear · 450–500 GSM & Full-Grain Leather',
                heading: 'Winter Hoodies & Statement Jackets',
                ctaLabel: 'Shop Winter Collection',
                ctaHref: '/collections/winter-collection',
              },
              {
                id: 'hoodies',
                label: 'Hoodies',
                products: hoodieProducts,
                eyebrow: 'Loopback French Terry · Oversized Silhouette',
                heading: 'Heavyweight Hoodies On The Rail',
                ctaLabel: 'Shop All Hoodies',
                ctaHref: '/collections/hoodies',
              },
              {
                id: 'jackets',
                label: 'Jackets',
                products: jacketProducts,
                eyebrow: 'Nappa Leather & Collegiate Wool',
                heading: 'Bombers & Varsity Jackets',
                ctaLabel: 'Shop All Jackets',
                ctaHref: '/collections/jackets',
              },
              {
                id: 'racing-club',
                label: 'Racing Club',
                products: racingProducts,
                eyebrow: 'Motorsport Capsule · Limited Edition',
                heading: 'Bluorng Racing Club Edit',
                ctaLabel: 'Explore Racing Club',
                ctaHref: '/collections/bluorng-racing-club',
              },
            ]}
          />
        </div>
      </section>

      {/* 4c. Tees, Shirts & Knitted Polos Clothing Rail */}
      <section className={styles.section}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Tees, Shirts &amp; Knitwear</h2>
            <Link href="/collections/summer-basics" className={styles.discoverLink}>
              Shop Core Apparel
            </Link>
          </div>
          <ClothingRailSection
            hanger="wood"
            tabs={[
              {
                id: 'all-tops',
                label: 'All Tops',
                products: coreTopsProducts,
                eyebrow: 'Ready To Wear · 260–280 GSM Cotton, Linen & Knit',
                heading: 'Core Tees, Resort Shirts & Knit Polos',
                ctaLabel: 'Shop All Apparel',
                ctaHref: '/collections/all-products',
              },
              {
                id: 'tees',
                label: 'Oversized Tees',
                products: teeProducts,
                eyebrow: 'Boxy Drop-Shoulder · Heavy Combed Cotton',
                heading: 'Oversized Graphic & Essential Tees',
                ctaLabel: 'Shop All T-Shirts',
                ctaHref: '/collections/t-shirts',
              },
              {
                id: 'shirts',
                label: 'Shirts',
                products: shirtProducts,
                eyebrow: 'Yacht Summer · Pure Linen & Tencel',
                heading: 'Resort & Casual Linen Shirts',
                ctaLabel: 'Shop All Shirts',
                ctaHref: '/collections/shirts',
              },
              {
                id: 'polos',
                label: 'Knitted Polos',
                products: poloProducts,
                eyebrow: 'Polo Club · Long-Staple Ribbed Knit',
                heading: 'Knitted Ribbed Polos',
                ctaLabel: 'Shop All Polos',
                ctaHref: '/collections/polos',
              },
            ]}
          />
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

      {/* 7. SEO Copy Block */}
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
                Welcome to Yaperz, India&apos;s premier high-end unisex streetwear destination. Designed
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

export const HOMEPAGE_HERO_SECTION_ID = 'hero-banner';
export const HOMEPAGE_FEATURED_LIMIT = 8;
