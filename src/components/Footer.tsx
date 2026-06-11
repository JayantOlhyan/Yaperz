'use client';

import React from 'react';
import Link from 'next/link';
import styles from './Footer.module.css';

export const Footer: React.FC = () => {
  const popularSearches = [
    'Oversized T-shirts',
    'Black Hoodies',
    'Acid Wash Tees',
    'Varsity Jackets',
    'Caps',
    'iPhone Cases',
    'Cargo Pants',
    'Knitted Polos',
    'Resort Shirts',
    'Basics',
    'Winter Collection',
    'Racing Club'
  ];

  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.grid}>
          {/* Column 1: SEO Tag Cloud */}
          <div>
            <h3 className={styles.columnTitle}>Popular Searches</h3>
            <div className={styles.tagCloud}>
              {popularSearches.map((tag) => (
                <Link
                  key={tag}
                  href={`/collections/all-products?search=${encodeURIComponent(tag)}`}
                  className={styles.seoTag}
                >
                  {tag}
                </Link>
              ))}
            </div>
          </div>

          {/* Column 2: Order Support */}
          <div>
            <h3 className={styles.columnTitle}>Order Support</h3>
            <ul className={styles.linksList}>
              <li className={styles.linkItem}>
                <Link href="/track-order">Track Order</Link>
              </li>
              <li className={styles.linkItem}>
                <Link href="/policies/returns">Returns & Exchange</Link>
              </li>
              <li className={styles.linkItem}>
                <Link href="/policies/shipping">Shipping Policy</Link>
              </li>
              <li className={styles.linkItem}>
                <Link href="/policies/refund">Refund Policy</Link>
              </li>
              <li className={styles.linkItem}>
                <Link href="/faq">FAQs</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Brand */}
          <div>
            <h3 className={styles.columnTitle}>We Are Yaperz</h3>
            <ul className={styles.linksList}>
              <li className={styles.linkItem}>
                <Link href="/about-us">Our Story</Link>
              </li>
              <li className={styles.linkItem}>
                <Link href="/collaborations">Collaborations</Link>
              </li>
              <li className={styles.linkItem}>
                <Link href="/careers">Careers</Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Connect */}
          <div>
            <h3 className={styles.columnTitle}>Connect With Us</h3>
            <ul className={styles.linksList}>
              <li className={styles.linkItem}>
                <a href="tel:+918285172372">+91 82851 72372</a>
              </li>
              <li className={styles.linkItem}>
                <a href="https://wa.me/918285172372" target="_blank" rel="noopener noreferrer">
                  WhatsApp Support
                </a>
              </li>
              <li className={styles.linkItem}>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                  Instagram
                </a>
              </li>
              <li className={styles.linkItem}>
                <a href="mailto:support@yaperz.com">support@yaperz.com</a>
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.bottom}>
          <p className={styles.copyright}>
            &copy; {new Date().getFullYear()} YAPERZ CLOTHING PVT. LTD. All rights reserved.
          </p>
          <ul className={styles.bottomLinks}>
            <li className={styles.bottomLink}>
              <Link href="/policies/privacy">Privacy Policy</Link>
            </li>
            <li className={styles.bottomLink}>
              <Link href="/policies/terms">Terms of Service</Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
};
