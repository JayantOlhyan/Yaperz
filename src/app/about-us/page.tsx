'use client';

import React from 'react';
import styles from './page.module.css';

export default function AboutUsPage() {
  return (
    <div className={`${styles.container} container`}>
      <h1 className={styles.title}>Our Story</h1>
      
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/hero-desktop.png"
        alt="Yaperz Editorial Brand Shot"
        className={styles.image}
      />

      <div className={styles.content}>
        <p>
          Founded in 2020 in New Delhi, India, Yaperz was born out of a desire to create high-quality,
          gender-neutral streetwear that challenges traditional fashion boundaries. We blend global
          streetwear sensibilities with Indian craftsmanship to create unique drops that stand the test
          of time.
        </p>

        <h2 className={styles.quote}>
          "We don't make clothes for genders. We make clothes for the community."
        </h2>

        <p>
          Every piece in our catalog is engineered starting from the yarn. We prioritize fabrics with substantial
          heft, mock-neck ribs that don't stretch out, dropped shoulders that drape naturally, and detailed
          graphics executed with premium puff print and heavy thread embroideries.
        </p>

        <p>
          By adopting a limited drop model, we ensure that every collection remains exclusive and reduce
          unnecessary fashion waste. Today, we serve thousands of streetwear enthusiasts across the globe, with
          physical walk-in stores in major Indian urban hubs.
        </p>

        <div className={styles.milestone}>
          <h3 className={styles.milestoneTitle}>Milestones</h3>
          <div className={styles.timeline}>
            <div className={styles.timelineRow}>
              <span className={styles.year}>2020</span>
              <p className={styles.desc}>
                Yaperz is founded in New Delhi with a simple 3-piece basic tee capsule.
              </p>
            </div>
            <div className={styles.timelineRow}>
              <span className={styles.year}>2022</span>
              <p className={styles.desc}>
                Launched the first 'Racing Club' collection, establishing our signature heavyweight silhouettes.
              </p>
            </div>
            <div className={styles.timelineRow}>
              <span className={styles.year}>2023</span>
              <p className={styles.desc}>
                Opened flagship walk-in retail stores in Greater Kailash, Delhi and Khar West, Mumbai.
              </p>
            </div>
            <div className={styles.timelineRow}>
              <span className={styles.year}>2026</span>
              <p className={styles.desc}>
                Expanding flagships to Hyderabad and Gurugram, scaling our gender-neutral mission.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
