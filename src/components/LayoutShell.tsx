/**
 * @component LayoutShell
 * @description Common wrapper composing Header, main content area, Footer, and CartDrawer.
 */
'use client';

import React, { useState } from 'react';
import { CartProvider } from '../context/CartContext';
import { Header } from './Header';
import { CartDrawer } from './CartDrawer';
import { SearchOverlay } from './SearchOverlay';
import { Footer } from './Footer';
import { MobileBottomNav } from './MobileBottomNav';

interface LayoutShellProps {
  children: React.ReactNode;
}

export const LayoutShell: React.FC<LayoutShellProps> = ({ children }) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <CartProvider>
      <Header onSearchOpen={() => setIsSearchOpen(true)} />
      
      <main style={{ minHeight: 'calc(100vh - var(--header-height) - 400px)' }}>
        {children}
      </main>
      
      <Footer />
      <MobileBottomNav />
      
      <CartDrawer />
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </CartProvider>
  );
};
export default LayoutShell;
