'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, User, ShoppingBag, MapPin, Menu, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { LocationModal } from './LocationModal';
import styles from './Header.module.css';

interface HeaderProps {
  onSearchOpen: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onSearchOpen }) => {
  const pathname = usePathname();
  const { openCart, cartCount } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCollectionsOpen, setIsCollectionsOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);

  // Load saved location from localStorage, default to Rest of the world (USD)
  const [selectedLocation, setSelectedLocation] = useState({
    code: 'INTL',
    currency: 'USD',
    symbol: '$',
    countryName: 'Rest of the world'
  });

  // Load saved location on mount to avoid hydration mismatch
  useEffect(() => {
    const saved = localStorage.getItem('yaperz_location');
    if (saved) {
      try {
        setSelectedLocation(JSON.parse(saved));
      } catch (e) {
        // Ignore
      }
    }
  }, []);

  const handleSelectLocation = (location: any) => {
    setSelectedLocation(location);
    localStorage.setItem('yaperz_location', JSON.stringify(location));
    setIsLocationOpen(false);
  };

  // Close menu drawer on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

  // Lock body scroll when menu drawer is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  // Auto-close menu when path changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <header className={styles.header}>
        <div className={styles.headerContainer}>
          {/* Mobile-Only: Hamburger Toggle Button */}
          <div className={styles.menuToggle}>
            <button
              onClick={() => setIsMenuOpen(true)}
              className={styles.actionButton}
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
          </div>

          {/* Logo (Aligned left on desktop, centered on mobile) */}
          <div className={styles.logoContainer}>
            <Link href="/" className={styles.logo}>
              Yaperz<span className={styles.logoAccent}>.</span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className={styles.nav}>
            <Link href="/collections/new-in" className={styles.navItem}>
              New In
            </Link>

            {/* MEN Mega Menu */}
            <div className={styles.navItemContainer}>
              <span className={styles.navItem}>
                Men <ChevronDown size={12} style={{ marginLeft: 2 }} />
              </span>
              <div className={styles.megaMenu}>
                <div className={styles.megaMenuContainer}>
                  <div className={styles.megaMenuLinks}>
                    <div className={styles.megaMenuColumn}>
                      <Link href="/collections/new-in" className={styles.megaLink}>NEW IN</Link>
                      <Link href="/collections/winter-collection" className={styles.megaLink}>Knitwear</Link>
                      <Link href="/collections/t-shirts" className={styles.megaLink}>Polo Shirts</Link>
                      <Link href="/collections/t-shirts" className={styles.megaLink}>Shirts</Link>
                      <Link href="/collections/t-shirts" className={styles.megaLink}>3 for 2 Tops</Link>
                      <Link href="/collections/summer-basics" className={styles.megaLink}>The Father's Day Edit</Link>
                    </div>
                    <div className={styles.megaMenuColumn}>
                      <Link href="/collections/summer-basics" className={styles.megaLink}>Linen Collection</Link>
                      <Link href="/collections/jackets" className={styles.megaLink}>Coats & Jackets</Link>
                      <Link href="/collections/summer-basics" className={styles.megaLink}>Trousers & Shorts</Link>
                      <Link href="/collections/t-shirts" className={styles.megaLink}>T-Shirts</Link>
                      <Link href="/collections/bluorng-racing-club" className={styles.megaLink}>Outfit Builder</Link>
                      <Link href="/collections/summer-basics" className={styles.megaLink}>Core Collection</Link>
                    </div>
                    <div className={styles.megaCtaContainer}>
                      <Link href="/collections/new-in" className={styles.megaCta}>
                        Shop All Menswear
                      </Link>
                    </div>
                  </div>
                  <div className={styles.megaMenuCards}>
                    <Link href="/collections/summer-basics" className={styles.megaCard}>
                      <img src="/images/menu/menswear_spring.png" alt="Explore Our Spring Collection" />
                      <div className={styles.megaCardOverlay}>
                        <span>Explore Our Spring Collection</span>
                      </div>
                    </Link>
                    <Link href="/collections/jackets" className={styles.megaCard}>
                      <img src="/images/menu/bexley_jacket.png" alt="Bexley Jacket: Made for Life" />
                      <div className={styles.megaCardOverlay}>
                        <span>Bexley Jacket: Made for Life</span>
                      </div>
                    </Link>
                    <Link href="/collections/summer-basics" className={styles.megaCard}>
                      <img src="/images/menu/summer_event.png" alt="Build your Summer Event Outfit" />
                      <div className={styles.megaCardOverlay}>
                        <span>Build your Summer Event Outfit</span>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* WOMEN Mega Menu */}
            <div className={styles.navItemContainer}>
              <span className={styles.navItem}>
                Women <ChevronDown size={12} style={{ marginLeft: 2 }} />
              </span>
              <div className={styles.megaMenu}>
                <div className={styles.megaMenuContainer}>
                  <div className={styles.megaMenuLinks}>
                    <div className={styles.megaMenuColumn}>
                      <Link href="/collections/new-in" className={styles.megaLink}>NEW IN</Link>
                      <Link href="/collections/jackets" className={styles.megaLink}>Coats & Jackets</Link>
                    </div>
                    <div className={styles.megaMenuColumn}>
                      <Link href="/collections/winter-collection" className={styles.megaLink}>Knitwear</Link>
                      <Link href="/collections/caps" className={styles.megaLink}>Accessories</Link>
                    </div>
                    <div className={styles.megaCtaContainer}>
                      <Link href="/collections/new-in" className={styles.megaCta}>
                        Shop All Womenswear
                      </Link>
                    </div>
                  </div>
                  <div className={styles.megaMenuCards}>
                    <Link href="/collections/winter-collection" className={styles.megaCard}>
                      <img src="/images/menu/womenswear_knitwear.png" alt="New In Knitwear" />
                      <div className={styles.megaCardOverlay}>
                        <span>New In Knitwear</span>
                      </div>
                    </Link>
                    <Link href="/collections/caps" className={styles.megaCard}>
                      <img src="/images/menu/wool_socks.png" alt="Wool Socks" />
                      <div className={styles.megaCardOverlay}>
                        <span>Wool Socks</span>
                      </div>
                    </Link>
                    <Link href="/collections/jackets" className={styles.megaCard}>
                      <img src="/images/menu/coats_jackets.png" alt="Shop Coats & Jackets" />
                      <div className={styles.megaCardOverlay}>
                        <span>Shop Coats & Jackets</span>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* ACCESSORIES Mega Menu */}
            <div className={styles.navItemContainer}>
              <span className={styles.navItem}>
                Accessories <ChevronDown size={12} style={{ marginLeft: 2 }} />
              </span>
              <div className={styles.megaMenu}>
                <div className={styles.megaMenuContainer}>
                  <div className={styles.megaMenuLinks}>
                    <div className={styles.megaMenuColumn}>
                      <Link href="/collections/caps" className={styles.megaLink}>Socks</Link>
                      <Link href="/collections/caps" className={styles.megaLink}>Beanies & Hoods</Link>
                      <Link href="/collections/winter-collection" className={styles.megaLink}>Wool Blankets</Link>
                      <Link href="/collections/caps" className={styles.megaLink}>Bexley Neck Straps</Link>
                      <Link href="/collections/caps" className={styles.megaLink}>Gift Cards</Link>
                    </div>
                    <div className={styles.megaMenuColumn}>
                      <Link href="/collections/summer-basics" className={styles.megaLink}>Garment Care</Link>
                      <Link href="/collections/winter-collection" className={styles.megaLink}>Scarves</Link>
                      <Link href="/collections/winter-collection" className={styles.megaLink}>Gloves</Link>
                      <Link href="/collections/winter-collection" className={styles.megaLink}>Dog Jumpers</Link>
                    </div>
                    <div className={styles.megaCtaContainer}>
                      <Link href="/collections/caps" className={styles.megaCta}>
                        Shop All Accessories
                      </Link>
                    </div>
                  </div>
                  <div className={styles.megaMenuCards}>
                    <Link href="/collections/caps" className={styles.megaCard}>
                      <img src="/images/menu/socks_menu.png" alt="Socks" />
                      <div className={styles.megaCardOverlay}>
                        <span>Socks</span>
                      </div>
                    </Link>
                    <Link href="/collections/summer-basics" className={styles.megaCard}>
                      <img src="/images/menu/garment_care.png" alt="Garment Care" />
                      <div className={styles.megaCardOverlay}>
                        <span>Garment Care</span>
                      </div>
                    </Link>
                    <Link href="/collections/winter-collection" className={styles.megaCard}>
                      <img src="/images/menu/dog_jumpers.png" alt="Dog Jumpers" />
                      <div className={styles.megaCardOverlay}>
                        <span>Dog Jumpers</span>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <Link href="/collections/new-in" className={styles.navItem} style={{ color: 'var(--color-accent)' }}>
              Last Chance
            </Link>

            {/* ABOUT US Mega Menu */}
            <div className={styles.navItemContainer}>
              <span className={styles.navItem}>
                About Us <ChevronDown size={12} style={{ marginLeft: 2 }} />
              </span>
              <div className={styles.megaMenu}>
                <div className={styles.aboutUsGrid}>
                  <Link href="/about-us" className={styles.megaCard}>
                    <img src="/images/menu/our_history.png" alt="Our History" />
                    <div className={styles.megaCardOverlay}>
                      <span>Our History</span>
                    </div>
                  </Link>
                  <Link href="/about-us" className={styles.megaCard}>
                    <img src="/images/menu/knitwear_factory.png" alt="Our Knitwear Factory" />
                    <div className={styles.megaCardOverlay}>
                      <span>Our Knitwear Factory</span>
                    </div>
                  </Link>
                  <Link href="/about-us" className={styles.megaCard}>
                    <img src="/images/menu/garment_care.png" alt="Our Suppliers" />
                    <div className={styles.megaCardOverlay}>
                      <span>Our Suppliers</span>
                    </div>
                  </Link>
                  <Link href="/about-us" className={styles.megaCard}>
                    <img src="/images/menu/wool_socks.png" alt="Traceability" />
                    <div className={styles.megaCardOverlay}>
                      <span>Traceability</span>
                    </div>
                  </Link>
                  <Link href="/about-us" className={styles.megaCard}>
                    <img src="/images/menu/socks_menu.png" alt="Shrunken Jumper Policy" />
                    <div className={styles.megaCardOverlay}>
                      <span>Shrunken Jumper Policy & Wool Care</span>
                    </div>
                  </Link>
                  <Link href="/about-us" className={styles.megaCard}>
                    <img src="/images/menu/bexley_jacket.png" alt="Wax Jacket Care" />
                    <div className={styles.megaCardOverlay}>
                      <span>Caring for a Wax Cotton Jacket</span>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </nav>

          {/* Right: Actions */}
          <div className={styles.actions}>
            <button
              onClick={() => setIsLocationOpen(true)}
              className={styles.currencyLabel}
              aria-label="Choose location"
            >
              {selectedLocation.code}/{selectedLocation.currency} <ChevronDown size={10} style={{ marginLeft: 1 }} />
            </button>
            <button
              onClick={onSearchOpen}
              className={styles.actionButton}
              aria-label="Search"
            >
              <Search size={20} />
            </button>
            <Link href="/account" className={styles.actionButton} aria-label="Account">
              <User size={20} />
            </Link>
            <Link href="/store" className={styles.actionButton} aria-label="Store locator">
              <MapPin size={20} />
            </Link>
            <button
              onClick={openCart}
              className={styles.actionButton}
              aria-label="Cart"
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && <span className={styles.badge}>{cartCount}</span>}
            </button>
          </div>
        </div>
      </header>

      {/* Slide-out Menu Drawer Backdrop (Mobile only) */}
      <div
        className={`${styles.drawerOverlay} ${isMenuOpen ? styles.drawerOverlayOpen : ''}`}
        onClick={() => setIsMenuOpen(false)}
      />

      {/* Slide-out Menu Drawer (Mobile only) */}
      <div className={`${styles.menuDrawer} ${isMenuOpen ? styles.menuDrawerOpen : ''}`}>
        <div className={styles.menuDrawerHeader}>
          <span className={styles.logo}>
            Yaperz<span className={styles.logoAccent}>.</span>
          </span>
          <button
            onClick={() => setIsMenuOpen(false)}
            className={styles.actionButton}
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </div>
        <div className={styles.menuDrawerContent}>
          <ul className={styles.menuNavList}>
            <li className={styles.menuNavItem}>
              <Link href="/">
                Home
              </Link>
            </li>
            <li className={styles.menuNavItem}>
              <Link href="/collections/new-in">
                New In
              </Link>
            </li>
            <li className={styles.menuNavItem}>
              <button
                className={styles.menuAccordionTitle}
                onClick={() => setIsCollectionsOpen(!isCollectionsOpen)}
              >
                Collections {isCollectionsOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {isCollectionsOpen && (
                <div className={styles.menuAccordionContent}>
                  <Link href="/collections/winter-collection" className={styles.menuSubLink}>
                    Winter Collection
                  </Link>
                  <Link href="/collections/summer-basics" className={styles.menuSubLink}>
                    Basics
                  </Link>
                  <Link href="/collections/bluorng-racing-club" className={styles.menuSubLink}>
                    Racing Club
                  </Link>
                  <Link href="/collections/t-shirts" className={styles.menuSubLink}>
                    T-Shirts
                  </Link>
                  <Link href="/collections/hoodies" className={styles.menuSubLink}>
                    Hoodies
                  </Link>
                  <Link href="/collections/jackets" className={styles.menuSubLink}>
                    Jackets
                  </Link>
                  <Link href="/collections/caps" className={styles.menuSubLink}>
                    Caps
                  </Link>
                  <Link href="/collections/iphone-case" className={styles.menuSubLink}>
                    iPhone Cases
                  </Link>
                </div>
              )}
            </li>
            <li className={styles.menuNavItem}>
              <Link href="/store">
                Store Locator
              </Link>
            </li>
            <li className={styles.menuNavItem}>
              <Link href="/about-us">
                Our Story
              </Link>
            </li>
            <li className={styles.menuNavItem}>
              <Link href="/collaborations">
                Collaborations
              </Link>
            </li>
            <li className={styles.menuNavItem}>
              <Link href="/account">
                My Account
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <LocationModal
        isOpen={isLocationOpen}
        onClose={() => setIsLocationOpen(false)}
        onSelect={handleSelectLocation}
        activeCode={selectedLocation.code}
      />
    </>
  );
};
