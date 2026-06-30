'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import styles from './ProductCard.module.css';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const router = useRouter();
  const { addToCart } = useCart();

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
