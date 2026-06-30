'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './StoriesBar.module.css';

interface StoryItem {
  id: string;
  label: string;
  thumbnail: string;
  media: string;
  ctaText: string;
  ctaLink: string;
}

export const StoriesBar: React.FC = () => {
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);

  const stories: StoryItem[] = [
    {
      id: '1',
      label: 'Winter Drop',
      thumbnail: '/images/products/hoodie-brown-1.jpg',
      media: '/images/products/hoodie-brown-1.jpg',
      ctaText: 'Shop Winter',
      ctaLink: '/collections/winter-collection'
    },
    {
      id: '2',
      label: 'Racing Club',
      thumbnail: '/images/products/jacket-racing-1.jpg',
      media: '/images/products/jacket-racing-1.jpg',
      ctaText: 'Explore Racing',
      ctaLink: '/collections/bluorng-racing-club'
    },
    {
      id: '3',
      label: 'New Cases',
      thumbnail: '/images/products/case-denim-1.jpg',
      media: '/images/products/case-denim-1.jpg',
      ctaText: 'Shop Cases',
      ctaLink: '/collections/iphone-case'
    },
    {
      id: '4',
      label: 'Basics',
      thumbnail: '/images/products/tee-basics-white-1.jpg',
      media: '/images/products/tee-basics-white-1.jpg',
      ctaText: 'Shop Basics',
      ctaLink: '/collections/summer-basics'
    },
    {
      id: '5',
      label: 'New Caps',
      thumbnail: '/images/products/cap-racing-1.jpg',
      media: '/images/products/cap-racing-1.jpg',
      ctaText: 'Shop Caps',
      ctaLink: '/collections/caps'
    },
    {
      id: '6',
      label: 'Store Look',
      thumbnail: '/images/hero-desktop.png',
      media: '/images/hero-desktop.png',
      ctaText: 'Visit Stores',
      ctaLink: '/store'
    }
  ];

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (activeStoryIndex !== null) {
      if (activeStoryIndex < stories.length - 1) {
        setActiveStoryIndex(activeStoryIndex + 1);
      } else {
        setActiveStoryIndex(null); // Close at end
      }
    }
  };

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (activeStoryIndex !== null && activeStoryIndex > 0) {
      setActiveStoryIndex(activeStoryIndex - 1);
    }
  };

  // Keyboard navigation for stories
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeStoryIndex !== null) {
        if (e.key === 'Escape') setActiveStoryIndex(null);
        if (e.key === 'ArrowRight') handleNext();
        if (e.key === 'ArrowLeft') handlePrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStoryIndex]);

  return (
    <div className="container">
      <div className={styles.storiesBar}>
        {stories.map((story, index) => (
          <div
            key={story.id}
            className={styles.story}
            onClick={() => setActiveStoryIndex(index)}
          >
            <div className={styles.thumbnailWrapper}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={story.thumbnail}
                alt={story.label}
                className={styles.thumbnail}
              />
            </div>
            <span className={styles.label}>{story.label}</span>
          </div>
        ))}
      </div>

      {/* Full-Screen Stories Modal Overlay */}
      {activeStoryIndex !== null && (
        <div className={styles.modal} onClick={() => setActiveStoryIndex(null)}>
          <button
            onClick={() => setActiveStoryIndex(null)}
            className={styles.closeButton}
            aria-label="Close stories"
          >
            <X size={24} />
          </button>

          {activeStoryIndex > 0 && (
            <button
              onClick={handlePrev}
              className={`${styles.navButton} ${styles.prevButton}`}
              aria-label="Previous story"
            >
              <ChevronLeft size={24} />
            </button>
          )}

          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalImageWrapper}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={stories[activeStoryIndex].media}
                alt={stories[activeStoryIndex].label}
                className={styles.modalImage}
              />
            </div>

            <div className={styles.modalFooter}>
              <h3 className={styles.modalLabel}>{stories[activeStoryIndex].label}</h3>
              <Link
                href={stories[activeStoryIndex].ctaLink}
                onClick={() => setActiveStoryIndex(null)}
                className={styles.modalCTA}
              >
                {stories[activeStoryIndex].ctaText}
              </Link>
            </div>
          </div>

          {activeStoryIndex < stories.length - 1 && (
            <button
              onClick={handleNext}
              className={`${styles.navButton} ${styles.nextButton}`}
              aria-label="Next story"
            >
              <ChevronRight size={24} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
