'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { X, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import styles from './CartDrawer.module.css';

export const CartDrawer: React.FC = () => {
  const router = useRouter();
  const {
    cartItems,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    cartSubtotal,
  } = useCart();

  const handleCheckout = () => {
    closeCart();
    router.push('/checkout');
  };

  return (
    <>
      {/* Background Overlay */}
      <div
        className={`${styles.overlay} ${isCartOpen ? styles.overlayOpen : ''}`}
        onClick={closeCart}
      />

      {/* Slide-out Drawer */}
      <div className={`${styles.drawer} ${isCartOpen ? styles.drawerOpen : ''}`}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            Your Bag ({cartItems.reduce((acc, item) => acc + item.quantity, 0)})
          </h2>
          <button onClick={closeCart} className={styles.closeButton} aria-label="Close cart">
            <X size={24} />
          </button>
        </div>

        <div className={styles.itemsContainer}>
          {cartItems.length === 0 ? (
            <div className={styles.emptyState}>
              <ShoppingBag size={48} style={{ marginBottom: 16, color: 'var(--color-text-muted)' }} />
              <h3 className={styles.emptyTitle}>Your bag is empty</h3>
              <p className={styles.emptySubtitle}>
                Add items to your bag to see them here.
              </p>
              <button onClick={closeCart} className={styles.shopButton}>
                Shop Now
              </button>
              
              <div className={styles.shortcuts}>
                <h4 className={styles.shortcutsTitle}>Quick Links</h4>
                <div className={styles.shortcutsGrid}>
                  <Link href="/collections/winter-collection" className={styles.shortcutLink} onClick={closeCart}>
                    Winter
                  </Link>
                  <Link href="/collections/bluorng-racing-club" className={styles.shortcutLink} onClick={closeCart}>
                    Racing
                  </Link>
                  <Link href="/collections/summer-basics" className={styles.shortcutLink} onClick={closeCart}>
                    Basics
                  </Link>
                  <Link href="/collections/caps" className={styles.shortcutLink} onClick={closeCart}>
                    Caps
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            cartItems.map((item) => (
              <div
                key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}`}
                className={styles.item}
              >
                <div className={styles.itemImage}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.product.images[0]}
                    alt={item.product.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div className={styles.itemDetails}>
                  <div>
                    <div className={styles.itemHeader}>
                      <h4 className={styles.itemTitle}>{item.product.title}</h4>
                      <span className={styles.itemPrice}>
                        ₹ {item.product.price.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className={styles.itemMeta}>
                      <span>Size: {item.selectedSize}</span>
                      <span>Color: {item.selectedColor}</span>
                    </div>
                  </div>
                  <div className={styles.itemActions}>
                    <div className={styles.quantityStepper}>
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.product.id,
                            item.selectedSize,
                            item.selectedColor,
                            item.quantity - 1
                          )
                        }
                        className={styles.stepperButton}
                        aria-label="Decrease quantity"
                      >
                        <Minus size={12} />
                      </button>
                      <span className={styles.stepperValue}>{item.quantity}</span>
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.product.id,
                            item.selectedSize,
                            item.selectedColor,
                            item.quantity + 1
                          )
                        }
                        className={styles.stepperButton}
                        aria-label="Increase quantity"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <button
                      onClick={() =>
                        removeFromCart(
                          item.product.id,
                          item.selectedSize,
                          item.selectedColor
                        )
                      }
                      className={styles.removeButton}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cartItems.length > 0 && (
          <div className={styles.footer}>
            <div className={styles.summaryRow}>
              <span className={styles.subtotalLabel}>Subtotal</span>
              <span className={styles.subtotalValue}>
                ₹ {cartSubtotal.toLocaleString('en-IN')}
              </span>
            </div>
            <p className={styles.note}>
              Shipping, duties, and discounts are calculated at checkout. Taxes included.
            </p>
            <button onClick={handleCheckout} className={styles.checkoutButton}>
              Check Out
            </button>
          </div>
        )}
      </div>
    </>
  );
};
