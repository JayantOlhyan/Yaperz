'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import styles from './LocationModal.module.css';

interface Location {
  code: string;
  currency: string;
  symbol: string;
  countryName: string;
  language: string;
}

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (location: Location) => void;
  activeCode: string;
}

// SVG Flag Components - Styled in 40x40 circle clip paths
const UKFlag = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" style={{ display: 'block' }}>
    <defs>
      <clipPath id="uk-clip">
        <circle cx="20" cy="20" r="20" />
      </clipPath>
    </defs>
    <g clipPath="url(#uk-clip)">
      <rect width="40" height="40" fill="#012169" />
      <path d="M0 0 L40 40 M0 40 L40 0" stroke="#fff" strokeWidth="4" />
      <path d="M0 0 L40 40 M0 40 L40 0" stroke="#C8102E" strokeWidth="2" />
      <path d="M20 0 L20 40 M0 20 L40 20" stroke="#fff" strokeWidth="8" />
      <path d="M20 0 L20 40 M0 20 L40 20" stroke="#C8102E" strokeWidth="5" />
    </g>
  </svg>
);

const EUFlag = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" style={{ display: 'block' }}>
    <defs>
      <clipPath id="eu-clip">
        <circle cx="20" cy="20" r="20" />
      </clipPath>
    </defs>
    <g clipPath="url(#eu-clip)">
      <rect width="40" height="40" fill="#003399" />
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i * 30 * Math.PI) / 180;
        return (
          <circle
            key={i}
            cx={20 + 11 * Math.sin(angle)}
            cy={20 - 11 * Math.cos(angle)}
            r="1.5"
            fill="#FFCC00"
          />
        );
      })}
    </g>
  </svg>
);

const USFlag = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" style={{ display: 'block' }}>
    <defs>
      <clipPath id="us-clip">
        <circle cx="20" cy="20" r="20" />
      </clipPath>
    </defs>
    <g clipPath="url(#us-clip)">
      <rect width="40" height="40" fill="#B22234" />
      {Array.from({ length: 7 }).map((_, i) => (
        <rect
          key={i}
          x="0"
          y={i * 5.71 + 2.85}
          width="40"
          height="2.85"
          fill="#fff"
        />
      ))}
      <rect x="0" y="0" width="20" height="20" fill="#3C3B6E" />
      {/* Stars grid */}
      <circle cx="4" cy="4" r="0.8" fill="#fff" />
      <circle cx="9" cy="4" r="0.8" fill="#fff" />
      <circle cx="14" cy="4" r="0.8" fill="#fff" />
      <circle cx="6.5" cy="8" r="0.8" fill="#fff" />
      <circle cx="11.5" cy="8" r="0.8" fill="#fff" />
      <circle cx="4" cy="12" r="0.8" fill="#fff" />
      <circle cx="9" cy="12" r="0.8" fill="#fff" />
      <circle cx="14" cy="12" r="0.8" fill="#fff" />
      <circle cx="6.5" cy="16" r="0.8" fill="#fff" />
      <circle cx="11.5" cy="16" r="0.8" fill="#fff" />
    </g>
  </svg>
);

const CAFlag = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" style={{ display: 'block' }}>
    <defs>
      <clipPath id="ca-clip">
        <circle cx="20" cy="20" r="20" />
      </clipPath>
    </defs>
    <g clipPath="url(#ca-clip)">
      <rect width="40" height="40" fill="#FF0000" />
      <rect x="10" y="0" width="20" height="40" fill="#ffffff" />
      {/* Maple Leaf */}
      <path
        d="M20 10 L21.5 14.5 L24.5 13.5 L23.5 17 L27 18.5 L23.5 20 L25 23.5 L21.5 22.5 L20 27 L18.5 22.5 L15 23.5 L16.5 20 L13 18.5 L16.5 17 L15.5 13.5 L18.5 14.5 Z"
        fill="#FF0000"
      />
      <rect x="19.2" y="25" width="1.6" height="6" fill="#FF0000" />
    </g>
  </svg>
);

const INFlag = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" style={{ display: 'block' }}>
    <defs>
      <clipPath id="in-clip">
        <circle cx="20" cy="20" r="20" />
      </clipPath>
    </defs>
    <g clipPath="url(#in-clip)">
      <rect x="0" y="0" width="40" height="13.33" fill="#FF9933" />
      <rect x="0" y="13.33" width="40" height="13.33" fill="#FFFFFF" />
      <rect x="0" y="26.66" width="40" height="13.34" fill="#138808" />
      {/* Ashoka Chakra */}
      <circle cx="20" cy="20" r="4.5" stroke="#000080" strokeWidth="0.8" fill="none" />
      <circle cx="20" cy="20" r="0.8" fill="#000080" />
      <line x1="20" y1="15.5" x2="20" y2="24.5" stroke="#000080" strokeWidth="0.4" />
      <line x1="15.5" y1="20" x2="24.5" y2="20" stroke="#000080" strokeWidth="0.4" />
      <line x1="16.8" y1="16.8" x2="23.2" y2="23.2" stroke="#000080" strokeWidth="0.4" />
      <line x1="16.8" y1="23.2" x2="23.2" y2="16.8" stroke="#000080" strokeWidth="0.4" />
      <line x1="18.3" y1="15.8" x2="21.7" y2="24.2" stroke="#000080" strokeWidth="0.4" />
      <line x1="15.8" y1="18.3" x2="24.2" y2="21.7" stroke="#000080" strokeWidth="0.4" />
      <line x1="21.7" y1="15.8" x2="18.3" y2="24.2" stroke="#000080" strokeWidth="0.4" />
      <line x1="15.8" y1="21.7" x2="24.2" y2="18.3" stroke="#000080" strokeWidth="0.4" />
    </g>
  </svg>
);

const GlobeIcon = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" style={{ display: 'block' }}>
    <circle cx="20" cy="20" r="20" fill="#0070f3" />
    <circle cx="20" cy="20" r="17.5" stroke="rgba(255,255,255,0.85)" strokeWidth="1.2" fill="none" />
    <line x1="2.5" y1="20" x2="37.5" y2="20" stroke="rgba(255,255,255,0.85)" strokeWidth="1.2" />
    <line x1="20" y1="2.5" x2="20" y2="37.5" stroke="rgba(255,255,255,0.85)" strokeWidth="1.2" />
    <path d="M 5 13 A 17.5 17.5 0 0 0 35 13" stroke="rgba(255,255,255,0.85)" strokeWidth="1.2" fill="none" opacity="0.8" />
    <path d="M 5 27 A 17.5 17.5 0 0 1 35 27" stroke="rgba(255,255,255,0.85)" strokeWidth="1.2" fill="none" opacity="0.8" />
    <path d="M 13 5 A 17.5 17.5 0 0 0 13 35" stroke="rgba(255,255,255,0.85)" strokeWidth="1.2" fill="none" opacity="0.8" />
    <path d="M 27 5 A 17.5 17.5 0 0 1 27 35" stroke="rgba(255,255,255,0.85)" strokeWidth="1.2" fill="none" opacity="0.8" />
  </svg>
);

export const LOCATIONS: Location[] = [
  { code: 'UK', currency: 'GBP', symbol: '£', countryName: 'United Kingdom', language: 'English' },
  { code: 'EU', currency: 'EUR', symbol: '€', countryName: 'Europe', language: 'English' },
  { code: 'US', currency: 'USD', symbol: '$', countryName: 'United States', language: 'English' },
  { code: 'CA', currency: 'CAD', symbol: '$', countryName: 'Canada', language: 'English' },
  { code: 'IND', currency: 'INR', symbol: '₹', countryName: 'India', language: 'English' },
  { code: 'INTL', currency: 'USD', symbol: '$', countryName: 'Rest of the world', language: 'English' },
];

export const LocationModal: React.FC<LocationModalProps> = ({ isOpen, onClose, onSelect, activeCode }) => {
  // Listen for Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getFlag = (code: string) => {
    switch (code) {
      case 'UK': return <UKFlag />;
      case 'EU': return <EUFlag />;
      case 'US': return <USFlag />;
      case 'CA': return <CAFlag />;
      case 'IND': return <INFlag />;
      default: return <GlobeIcon />;
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose} aria-label="Close modal">
          <X size={20} />
        </button>

        <h3 className={styles.modalTitle}>Choose your location:</h3>

        <div className={styles.locationGrid}>
          {LOCATIONS.map((loc) => (
            <div
              key={loc.code}
              className={`${styles.locationItem} ${activeCode === loc.code ? styles.locationItemActive : ''}`}
              onClick={() => onSelect(loc)}
            >
              <div className={styles.flagContainer}>
                {getFlag(loc.code)}
              </div>
              <div className={styles.locationInfo}>
                <span className={styles.countryName}>{loc.countryName}</span>
                <span className={styles.countryDetails}>{loc.language} / {loc.currency} {loc.symbol}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
