'use client';

import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, X } from 'lucide-react';
import styles from './PWAProvider.module.css';

interface PWAProviderProps {
  children: React.ReactNode;
}

// Typing the browser standard BeforeInstallPromptEvent
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const PWAProvider: React.FC<PWAProviderProps> = ({ children }) => {
  // Use lazy state initialization to avoid synchronous state updates in useEffect
  const [showOfflineToast, setShowOfflineToast] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return !navigator.onLine;
    }
    return false;
  });
  const [showOnlineToast, setShowOnlineToast] = useState<boolean>(false);
  const [onlineClosing, setOnlineClosing] = useState<boolean>(false);
  
  // Install Prompt State
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBtn, setShowInstallBtn] = useState<boolean>(false);

  useEffect(() => {
    // 1. Service Worker Registration
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('[PWA] Service Worker registered with scope:', registration.scope);
        })
        .catch((error) => {
          console.error('[PWA] Service Worker registration failed:', error);
        });
    }

    // 2. Connectivity Event Listeners
    const handleOnline = () => {
      setShowOfflineToast(false);
      setShowOnlineToast(true);
      setOnlineClosing(false);

      // Auto-hide the "Back Online" toast after 3 seconds
      const timer = setTimeout(() => {
        setOnlineClosing(true);
        setTimeout(() => {
          setShowOnlineToast(false);
          setOnlineClosing(false);
        }, 300); // match transition duration
      }, 3000);

      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setShowOnlineToast(false);
      setShowOfflineToast(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 3. PWA Install Prompt Handler
    const handleInstallPrompt = (e: Event) => {
      // Prevent browser's default prompt
      e.preventDefault();
      // Store event
      setInstallPrompt(e as BeforeInstallPromptEvent);
      setShowInstallBtn(true);
    };

    window.addEventListener('beforeinstallprompt', handleInstallPrompt as EventListener);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt as EventListener);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    
    // Show prompt
    await installPrompt.prompt();
    
    // Wait for response
    const { outcome } = await installPrompt.userChoice;
    console.log(`[PWA] Install prompt outcome: ${outcome}`);
    
    // Clear prompt state
    setInstallPrompt(null);
    setShowInstallBtn(false);
  };

  return (
    <>
      {children}

      {/* Floating Status Banners */}
      <div className={styles.bannerContainer}>
        {/* Offline Warning Banner */}
        {showOfflineToast && (
          <div className={`${styles.toast} ${styles.toastOffline}`}>
            <div className={styles.content}>
              <WifiOff size={18} className={styles.iconOffline} />
              <div className={styles.text}>
                You&apos;re offline. Some features may be unavailable.
              </div>
            </div>
            {showInstallBtn && (
              <button onClick={handleInstallClick} className={styles.installBtn}>
                Install App
              </button>
            )}
            <button onClick={() => setShowOfflineToast(false)} className={styles.closeBtn} aria-label="Close message">
              <X size={16} />
            </button>
          </div>
        )}

        {/* Back Online Success Banner */}
        {showOnlineToast && (
          <div className={`${styles.toast} ${styles.toastOnline} ${onlineClosing ? styles.fadeOut : ''}`}>
            <div className={styles.content}>
              <Wifi size={18} className={styles.iconOnline} />
              <div className={styles.text}>
                You&apos;re back online.
              </div>
            </div>
            {showInstallBtn && (
              <button onClick={handleInstallClick} className={styles.installBtn}>
                Install App
              </button>
            )}
            <button onClick={() => setShowOnlineToast(false)} className={styles.closeBtn} aria-label="Close message">
              <X size={16} />
            </button>
          </div>
        )}

        {/* Unobtrusive Install Banner (Only if online and not showing any connectivity toast) */}
        {!showOfflineToast && !showOnlineToast && showInstallBtn && (
          <div className={styles.toast}>
            <div className={styles.content}>
              <div className={styles.text}>
                Install Yaperz on your home screen for an app-like experience.
              </div>
            </div>
            <button onClick={handleInstallClick} className={styles.installBtn}>
              Install
            </button>
            <button onClick={() => setShowInstallBtn(false)} className={styles.closeBtn} aria-label="Close message">
              <X size={16} />
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default PWAProvider;

