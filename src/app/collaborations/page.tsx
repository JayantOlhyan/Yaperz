'use client';

import React from 'react';
import Link from 'next/link';
import styles from './page.module.css';

export default function CollaborationsPage() {
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
    </div>
  );
}
