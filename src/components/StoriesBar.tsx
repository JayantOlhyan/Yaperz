/**
 * @component StoriesBar
 * @description Dynamic horizontal story & video reel with fullscreen modal, progress timers, and video playback.
 */
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { X, ChevronLeft, ChevronRight, Volume2, VolumeX } from 'lucide-react';
import { StoryItem } from '../types';
import styles from './StoriesBar.module.css';

const DEFAULT_STORIES: StoryItem[] = [
  {
    id: '1',
    label: 'Winter Drop',
    thumbnail: '/images/products/hoodie-brown-1.jpg',
    media: '/images/products/hoodie-brown-1.jpg',
    mediaType: 'image',
    ctaText: 'Shop Winter',
    ctaLink: '/collections/winter-collection',
    duration: 5,
  },
  {
    id: '2',
    label: 'Racing Club',
    thumbnail: '/images/products/jacket-racing-1.jpg',
    media: '/images/products/jacket-racing-1.jpg',
    mediaType: 'image',
    ctaText: 'Explore Racing',
    ctaLink: '/collections/bluorng-racing-club',
    duration: 5,
  },
  {
    id: '3',
    label: 'New Cases',
    thumbnail: '/images/products/case-denim-1.jpg',
    media: '/images/products/case-denim-1.jpg',
    mediaType: 'image',
    ctaText: 'Shop Cases',
    ctaLink: '/collections/iphone-case',
    duration: 5,
  },
  {
    id: '4',
    label: 'Basics',
    thumbnail: '/images/products/tee-basics-white-1.jpg',
    media: '/images/products/tee-basics-white-1.jpg',
    mediaType: 'image',
    ctaText: 'Shop Basics',
    ctaLink: '/collections/summer-basics',
    duration: 5,
  },
  {
    id: '5',
    label: 'New Caps',
    thumbnail: '/images/products/cap-racing-1.jpg',
    media: '/images/products/cap-racing-1.jpg',
    mediaType: 'image',
    ctaText: 'Shop Caps',
    ctaLink: '/collections/caps',
    duration: 5,
  },
  {
    id: '6',
    label: 'Editorial Look',
    thumbnail: '/images/hero-desktop.png',
    media: '/images/hero-desktop.png',
    mediaType: 'image',
    ctaText: 'Our Story',
    ctaLink: '/about-us',
    duration: 6,
  },
];

export const StoriesBar: React.FC = () => {
  const [stories, setStories] = useState<StoryItem[]>(DEFAULT_STORIES);
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch dynamic stories from server
  useEffect(() => {
    fetch('/api/stories')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setStories(data.data);
        }
      })
      .catch(() => {
        // Fallback to defaults
      });
  }, []);

  const handleNext = useCallback(() => {
    if (activeStoryIndex !== null) {
      if (activeStoryIndex < stories.length - 1) {
        setActiveStoryIndex((prev) => (prev !== null ? prev + 1 : null));
        setProgress(0);
      } else {
        setActiveStoryIndex(null); // Finished all stories
        setProgress(0);
      }
    }
  }, [activeStoryIndex, stories.length]);

  const handlePrev = useCallback(() => {
    if (activeStoryIndex !== null && activeStoryIndex > 0) {
      setActiveStoryIndex((prev) => (prev !== null ? prev - 1 : null));
      setProgress(0);
    }
  }, [activeStoryIndex]);

  // Handle auto-advance timer and progress bar
  useEffect(() => {
    if (activeStoryIndex === null) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const currentStory = stories[activeStoryIndex];
    const durationMs = (currentStory?.duration || 5) * 1000;
    const intervalMs = 50;
    const step = (intervalMs / durationMs) * 100;

    timerRef.current = setInterval(() => {
      setProgress((old) => {
        if (old + step >= 100) {
          handleNext();
          return 0;
        }
        return old + step;
      });
    }, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeStoryIndex, stories, handleNext]);

  // Keyboard navigation
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
  }, [activeStoryIndex, handleNext, handlePrev]);

  return (
    <div className="container">
      <div className={styles.storiesBar}>
        {stories.map((story, index) => (
          <div
            key={story.id}
            className={styles.story}
            onClick={() => {
              setActiveStoryIndex(index);
              setProgress(0);
            }}
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
      {activeStoryIndex !== null && stories[activeStoryIndex] && (
        <div className={styles.modal} onClick={() => setActiveStoryIndex(null)}>
          {/* Progress Bars Header */}
          <div className={styles.progressContainer}>
            {stories.map((s, idx) => (
              <div key={s.id} className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{
                    width:
                      idx < activeStoryIndex
                        ? '100%'
                        : idx === activeStoryIndex
                        ? `${progress}%`
                        : '0%',
                  }}
                />
              </div>
            ))}
          </div>

          {/* Sound Toggle Button (for video stories) */}
          {stories[activeStoryIndex].mediaType === 'video' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMuted(!isMuted);
                if (videoRef.current) {
                  videoRef.current.muted = !isMuted;
                }
              }}
              className={styles.muteButton}
              aria-label={isMuted ? 'Unmute video' : 'Mute video'}
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
          )}

          {/* Close Button */}
          <button
            onClick={() => setActiveStoryIndex(null)}
            className={styles.closeButton}
            aria-label="Close stories"
          >
            <X size={24} />
          </button>

          {/* Desktop Left/Right Navigation Buttons */}
          {activeStoryIndex > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className={`${styles.navButton} ${styles.prevButton}`}
              aria-label="Previous story"
            >
              <ChevronLeft size={24} />
            </button>
          )}

          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            {/* Touch Zones for Mobile/Tablet Story Navigation */}
            <div
              className={styles.touchZoneLeft}
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
            />
            <div
              className={styles.touchZoneRight}
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
            />

            <div className={styles.modalImageWrapper}>
              {stories[activeStoryIndex].mediaType === 'video' ? (
                <video
                  ref={videoRef}
                  src={stories[activeStoryIndex].media}
                  poster={stories[activeStoryIndex].thumbnail}
                  className={styles.videoElement}
                  autoPlay
                  playsInline
                  muted={isMuted}
                  loop
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={stories[activeStoryIndex].media}
                  alt={stories[activeStoryIndex].label}
                  className={styles.modalImage}
                />
              )}
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
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
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

export const STORY_SLIDE_DURATION_MS = 5000;
export const STORY_RING_GRADIENT =
  'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)';
export const STORY_AVATAR_SIZE_PX = 72;
