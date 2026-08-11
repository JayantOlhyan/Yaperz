'use client';

import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';
import styles from './offline.module.css';

export const dynamic = 'force-static';

export default function OfflinePage() {
  const [checking, setChecking] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Handle checking network status when Try Again is clicked
  const handleTryAgain = () => {
    setChecking(true);
    setStatusMessage('');

    // Check navigator.onLine status
    if (navigator.onLine) {
      // Reconnection success, reload the requested page URL
      window.location.reload();
    } else {
      // Still offline, display a message and stop spinner
      setTimeout(() => {
        setChecking(false);
        setStatusMessage('Still offline. Please check your network connection.');
      }, 800);
    }
  };

  // Add event listener to automatically reload when connection returns
  useEffect(() => {
    const handleOnline = () => {
      window.location.reload();
    };

    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.logo}>
        Yaperz<span className={styles.logoAccent}>.</span>
      </div>

      <div className={styles.card}>
        <div className={styles.iconWrapper}>
          <WifiOff size={48} strokeWidth={1.5} />
        </div>

        <h1 className={styles.title}>You&apos;re Offline</h1>
        <p className={styles.message}>
          It looks like your device isn&apos;t connected to the internet right now.
          Some features may be temporarily unavailable.
        </p>

        <button 
          onClick={handleTryAgain} 
          disabled={checking}
          className={styles.button}
        >
          {checking ? 'Checking...' : 'Try Again'}
        </button>

        <div className={styles.statusText}>
          {statusMessage}
        </div>
      </div>

      <p className={styles.footerNote}>
        Connection will resume automatically when you&apos;re back online.
      </p>
    </div>
  );
}
