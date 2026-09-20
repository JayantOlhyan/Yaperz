/**
 * @component MobileBottomNav
 * @description Modern app-like bottom navigation dock for mobile devices.
 */
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, ShoppingBag, User, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import styles from './MobileBottomNav.module.css';

export const MobileBottomNav: React.FC = () => {
  const pathname = usePathname();
  const { openCart, cartCount } = useCart();

  // Do not display on admin pages
  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <nav className={styles.bottomNav} aria-label="Mobile Bottom Navigation">
      <Link
        href="/"
        className={`${styles.navItem} ${pathname === '/' ? styles.navItemActive : ''}`}
      >
        <Home size={20} strokeWidth={pathname === '/' ? 2.5 : 1.8} />
        <span>Home</span>
      </Link>

      <Link
        href="/collections"
        className={`${styles.navItem} ${pathname.startsWith('/collections') ? styles.navItemActive : ''}`}
      >
        <Compass size={20} strokeWidth={pathname.startsWith('/collections') ? 2.5 : 1.8} />
        <span>Drops</span>
      </Link>

      <Link
        href="/collaborations"
        className={`${styles.navItem} ${pathname === '/collaborations' ? styles.navItemActive : ''}`}
      >
        <Sparkles size={20} strokeWidth={pathname === '/collaborations' ? 2.5 : 1.8} />
        <span>Collabs</span>
      </Link>

      <button
        onClick={openCart}
        className={styles.navItem}
        aria-label={`Open shopping cart with ${cartCount} items`}
      >
        <ShoppingBag size={20} strokeWidth={1.8} />
        <span>Bag</span>
        {cartCount > 0 && <span className={styles.badge}>{cartCount}</span>}
      </button>

      <Link
        href="/account"
        className={`${styles.navItem} ${pathname.startsWith('/account') ? styles.navItemActive : ''}`}
      >
        <User size={20} strokeWidth={pathname.startsWith('/account') ? 2.5 : 1.8} />
        <span>Account</span>
      </Link>
    </nav>
  );
};
