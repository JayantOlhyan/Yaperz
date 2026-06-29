'use client';

import React from 'react';
import Link from 'next/link';
import styles from './page.module.css';

export default function SitemapPage() {
  const directory = [
    {
      title: 'Shop & Collections',
      links: [
        { label: 'All Products', href: '/collections/all-products' },
        { label: 'New Arrivals', href: '/collections/new-in' },
        { label: 'Winter Collection', href: '/collections/winter-collection' },
        { label: 'Racing Club', href: '/collections/bluorng-racing-club' },
        { label: 'Signature Caps', href: '/collections/caps' },
        { label: 'iPhone Cases', href: '/collections/iphone-case' },
        { label: 'Summer Basics', href: '/collections/summer-basics' }
      ]
    },
    {
      title: 'Customer Account',
      links: [
        { label: 'My Account Portal', href: '/account' },
        { label: 'Track Active Order', href: '/track-order' },
        { label: 'Checkout Terminal', href: '/checkout' }
      ]
    },
    {
      title: 'Order Support',
      links: [
        { label: 'Help & FAQs', href: '/faq' },
        { label: 'Returns & Exchange Policy', href: '/policies/returns' },
        { label: 'Shipping Policy Details', href: '/policies/shipping' },
        { label: 'Refund Policy & Timelines', href: '/policies/refund' }
      ]
    },
    {
      title: 'Our Company',
      links: [
        { label: 'Our Story (Founder Narrative)', href: '/about-us' },
        { label: 'Creative Collaborations', href: '/collaborations' }
      ]
    },
    {
      title: 'Legal & Policies',
      links: [
        { label: 'Privacy & Cookie Policy', href: '/policies/privacy' },
        { label: 'Terms of Service', href: '/policies/terms' }
      ]
    }
  ];

  return (
    <div className={`${styles.container} container`}>
      {/* Breadcrumbs */}
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <Link href="/" className={styles.breadcrumbLink}>
          Home
        </Link>
        <span className={styles.separator}>/</span>
        <span className={styles.activePage}>Sitemap</span>
      </nav>

      {/* Page Header */}
      <header className={styles.header}>
        <h1 className={styles.title}>Sitemap</h1>
        <p className={styles.subtitle}>
          A comprehensive directory of pages, collections, account tools, and customer resources on Yaperz.
        </p>
      </header>

      {/* Directory Grid */}
      <main className={styles.grid}>
        {directory.map((section) => (
          <div key={section.title} className={styles.column}>
            <h2 className={section.title === 'Shop & Collections' ? `${styles.columnTitle} font-display` : styles.columnTitle}>
              {section.title}
            </h2>
            <ul className={styles.linksList}>
              {section.links.map((link) => (
                <li key={link.href} className={styles.linkItem}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </main>
    </div>
  );
}
