'use client';

import React, { useState, useEffect } from 'react';
import styles from './SkeletonLoader.module.css';

interface SkeletonLoaderProps {
  type: 'product-grid' | 'product-detail' | 'product-card';
  count?: number; // Number of product cards to render
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ type, count = 6 }) => {
  const [shouldRender, setShouldRender] = useState(false);

  // Mount delay of 300ms to prevent skeleton flash on fast connections
  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldRender(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  if (!shouldRender) {
    return null;
  }

  // Renders a single product card skeleton
  const renderProductCardSkeleton = (key: string | number) => (
    <div key={key} className={styles.cardSkeleton}>
      <div className={`${styles.skeletonBlock} ${styles.imageWrapperSkeleton}`} />
      <div className={styles.cardInfoSkeleton}>
        <div className={`${styles.skeletonBlock} ${styles.cardTitleSkeleton}`} />
        <div className={`${styles.skeletonBlock} ${styles.cardPriceSkeleton}`} />
      </div>
    </div>
  );

  if (type === 'product-card') {
    return renderProductCardSkeleton(0);
  }

  if (type === 'product-detail') {
    return (
      <div className={`${styles.pdpContainer} container`}>
        <div className={styles.pdpLayout}>
          {/* Gallery Skeleton */}
          <div className={styles.pdpGallerySkeleton}>
            <div className={styles.pdpThumbnailsSkeleton}>
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className={`${styles.skeletonBlock} ${styles.pdpThumbSkeleton}`} />
              ))}
            </div>
            <div className={`${styles.skeletonBlock} ${styles.pdpMainImageSkeleton}`} />
          </div>

          {/* Product Details Panel Skeleton */}
          <div className={styles.pdpInfoPanelSkeleton}>
            <div className={`${styles.skeletonBlock} ${styles.pdpMetaSkeleton}`} />
            <div className={`${styles.skeletonBlock} ${styles.pdpTitleSkeleton}`} />
            <div className={`${styles.skeletonBlock} ${styles.pdpPriceSkeleton}`} />

            {/* Colors Section */}
            <div className={styles.pdpVariantSectionSkeleton}>
              <div className={`${styles.skeletonBlock} ${styles.pdpVariantLabelSkeleton}`} />
              <div className={styles.pdpBtnGridSkeleton}>
                {Array.from({ length: 3 }).map((_, idx) => (
                  <div key={idx} className={`${styles.skeletonBlock} ${styles.pdpColorSwatchSkeleton}`} />
                ))}
              </div>
            </div>

            {/* Sizes Section */}
            <div className={styles.pdpVariantSectionSkeleton}>
              <div className={`${styles.skeletonBlock} ${styles.pdpVariantLabelSkeleton}`} />
              <div className={styles.pdpBtnGridSkeleton}>
                {Array.from({ length: 5 }).map((_, idx) => (
                  <div key={idx} className={`${styles.skeletonBlock} ${styles.pdpSizeBtnSkeleton}`} />
                ))}
              </div>
            </div>

            {/* Add to Bag CTA */}
            <div className={`${styles.skeletonBlock} ${styles.pdpCtaSkeleton}`} />

            {/* Accordions */}
            <div className={styles.pdpAccordionsSkeleton}>
              {Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className={`${styles.skeletonBlock} ${styles.pdpAccordionSkeleton}`} />
              ))}
            </div>
          </div>
        </div>

        {/* Related Products Skeleton */}
        <section className={styles.relatedSectionSkeleton}>
          <div className={`${styles.skeletonBlock} ${styles.relatedTitleSkeleton}`} />
          <div className={styles.relatedGridSkeleton}>
            {Array.from({ length: 4 }).map((_, idx) => renderProductCardSkeleton(idx))}
          </div>
        </section>
      </div>
    );
  }

  // Default: product-grid
  return (
    <div className={styles.gridContainer}>
      {/* Title & Count Header */}
      <div className={styles.headerSkeleton}>
        <div className={`${styles.skeletonBlock} ${styles.titleSkeleton}`} />
        <div className={`${styles.skeletonBlock} ${styles.countSkeleton}`} />
      </div>

      {/* Filter toolbar */}
      <div className={styles.toolbarSkeleton}>
        <div className={`${styles.skeletonBlock} ${styles.btnSkeleton}`} />
        <div className={`${styles.skeletonBlock} ${styles.btnSkeleton}`} />
      </div>

      {/* Main layout (Sidebar + Grid) */}
      <div className={styles.layoutSkeleton}>
        {/* Left Sidebar (Desktop Filters) */}
        <aside className={styles.sidebarSkeleton}>
          {/* Availability */}
          <div className={styles.filterBlockSkeleton}>
            <div className={`${styles.skeletonBlock} ${styles.filterTitleSkeleton}`} />
            <div className={`${styles.skeletonBlock} ${styles.filterItemSkeleton}`} />
          </div>

          {/* Size Button Grid */}
          <div className={styles.filterBlockSkeleton}>
            <div className={`${styles.skeletonBlock} ${styles.filterTitleSkeleton}`} />
            <div className={styles.sizeGridSkeleton}>
              {Array.from({ length: 8 }).map((_, idx) => (
                <div key={idx} className={`${styles.skeletonBlock} ${styles.sizeBtnSkeleton}`} />
              ))}
            </div>
          </div>

          {/* Colors Swatches */}
          <div className={styles.filterBlockSkeleton}>
            <div className={`${styles.skeletonBlock} ${styles.filterTitleSkeleton}`} />
            <div className={styles.colorGridSkeleton}>
              {Array.from({ length: 8 }).map((_, idx) => (
                <div key={idx} className={`${styles.skeletonBlock} ${styles.colorSwatchSkeleton}`} />
              ))}
            </div>
          </div>

          {/* Price Range Slider */}
          <div className={styles.filterBlockSkeleton}>
            <div className={`${styles.skeletonBlock} ${styles.filterTitleSkeleton}`} />
            <div className={`${styles.skeletonBlock} ${styles.filterItemSkeleton}`} />
          </div>
        </aside>

        {/* Product Grid Area */}
        <main className={styles.mainSkeleton}>
          <div className={styles.gridSkeleton}>
            {Array.from({ length: count }).map((_, idx) => renderProductCardSkeleton(idx))}
          </div>
        </main>
      </div>
    </div>
  );
};
