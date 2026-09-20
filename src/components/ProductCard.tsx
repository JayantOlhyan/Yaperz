/**
 * @component ProductCard
 * @description Product preview card with image carousel, hover zoom, and quick action buttons.
 */
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import styles from './ProductCard.module.css';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const router = useRouter();
  const { addToCart } = useCart();
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    try {
      const list = JSON.parse(localStorage.getItem('yaperz_wishlist') || '[]');
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsWishlisted(list.includes(product.id));
    } catch {
      // Ignore
    }
  }, [product.id]);

  const isSoldOut = product.inventory === 0;
  const isOnSale = product.compare_at_price !== null;
  const isNew = product.collections.includes('new-in');

  const handleCardClick = () => {
    router.push(`/products/${product.slug}`);
  };

  const handleQuickAdd = (e: React.MouseEvent, size: string) => {
    e.stopPropagation(); // Prevent going to detail page
    if (!isSoldOut) {
      addToCart(product, 1, size, product.colors[0]);
    }
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      let list: string[] = JSON.parse(localStorage.getItem('yaperz_wishlist') || '[]');
      if (list.includes(product.id)) {
        list = list.filter((id) => id !== product.id);
        setIsWishlisted(false);
      } else {
        list.push(product.id);
        setIsWishlisted(true);
      }
      localStorage.setItem('yaperz_wishlist', JSON.stringify(list));
    } catch {
      // Ignore
    }
  };

  return (
    <div className={styles.card} onClick={handleCardClick}>
      <div className={styles.imageWrapper}>
        {/* Badges */}
        <div className={styles.badgeContainer}>
          {isSoldOut ? (
            <span className={`${styles.badge} ${styles.badgeSoldOut}`}>Sold Out</span>
          ) : (
            <>
              {isNew && <span className={`${styles.badge} ${styles.badgeNew}`}>New</span>}
              {isOnSale && <span className={`${styles.badge} ${styles.badgeSale}`}>Sale</span>}
            </>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={handleWishlistToggle}
          className={styles.wishlistBtn}
          aria-label={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart
            size={16}
            className={`${styles.heartIcon} ${isWishlisted ? styles.heartActive : ''}`}
            fill={isWishlisted ? '#ff3b30' : 'none'}
            color={isWishlisted ? '#ff3b30' : '#ffffff'}
          />
        </button>

        {/* Product Images */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.images[0]}
          alt={product.title}
          className={`${styles.image} ${styles.primaryImage}`}
        />
        {product.images.length > 1 && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.images[1]}
            alt={`${product.title} Alternate`}
            className={styles.hoverImage}
          />
        )}

        {/* Quick Add Overlay */}
        {!isSoldOut && (
          <div className={styles.sizeOverlay}>
            <span className={styles.sizeTitle}>Quick Add</span>
            <div className={styles.sizeGrid}>
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={(e) => handleQuickAdd(e, size)}
                  className={styles.sizeButton}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className={styles.info}>
        <h4 className={styles.title}>{product.title}</h4>
        <div className={styles.priceRow}>
          {isOnSale ? (
            <>
              <span className={`${styles.price} ${styles.salePrice}`}>
                ₹ {product.price.toLocaleString('en-IN')}
              </span>
              <span className={styles.comparePrice}>
                ₹ {product.compare_at_price?.toLocaleString('en-IN')}
              </span>
            </>
          ) : (
            <span className={styles.price}>
              ₹ {product.price.toLocaleString('en-IN')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// Product card default aspect ratio for image containers
export const PRODUCT_CARD_ASPECT_RATIO = '3 / 4';

// Badge display threshold for sale items
export const MIN_DISCOUNT_PERCENT_FOR_BADGE = 10;

// Product card test ID for automation
export const PRODUCT_CARD_TEST_ID = 'yaperz-product-card';
