'use client';

import React, { useState, use, useRef } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp, AlertCircle, ShoppingBag, X, RotateCcw } from 'lucide-react';
import productsData from '../../../data/products.json';
import { Product } from '../../../types';
import { useCart } from '../../../context/CartContext';
import { ProductCard } from '../../../components/ProductCard';
import styles from './page.module.css';

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = use(params);
  const { addToCart } = useCart();

  // Find product by slug
  const product = (productsData as Product[]).find((p) => p.slug === slug);

  // States
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [sizeError, setSizeError] = useState(false);

  // Accordion state
  const [accordions, setAccordions] = useState({
    description: true,
    care: false,
    shipping: false
  });

  // Init color once product is found
  React.useEffect(() => {
    if (product) {
      setSelectedColor(product.colors[0]);
      setSelectedSize(null);
      setActiveImageIndex(0);
      setSizeError(false);
    }
  }, [product]);

  if (!product) {
    return (
      <div className="container" style={{ padding: '100px 0', textAlign: 'center' }}>
        <AlertCircle size={48} style={{ color: 'var(--color-error)', marginBottom: 16 }} />
        <h2 style={{ fontSize: 24, marginBottom: 16 }}>Product Not Found</h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: 32 }}>
          The product you are looking for does not exist or has been removed.
        </p>
        <Link href="/collections/all-products" style={{ background: 'var(--color-text-primary)', color: '#fff', padding: '12px 32px' }}>
          Back to Shop
        </Link>
      </div>
    );
  }

  const isSoldOut = product.inventory === 0;
  const isLowStock = product.inventory > 0 && product.inventory < 5;

  // Zoom positioning trigger
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  const handleAddToBag = () => {
    if (!selectedSize) {
      setSizeError(true);
      return;
    }
    setSizeError(false);
    addToCart(product, 1, selectedSize, selectedColor);
  };

  const toggleAccordion = (section: 'description' | 'care' | 'shipping') => {
    setAccordions((prev) => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Get related products
  const relatedProducts = (productsData as Product[])
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className={`${styles.container} container`}>
      <div className={styles.layout}>
        {/* Left Side: Images Gallery */}
        <div>
          {/* Desktop Gallery */}
          <div className={styles.galleryContainer}>
            <div className={styles.thumbnails}>
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`${styles.thumbButton} ${activeImageIndex === idx ? styles.thumbButtonActive : ''}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt={`Thumbnail ${idx}`} className={styles.thumbImage} />
                </button>
              ))}
            </div>
            <div
              className={styles.mainImageWrapper}
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
              onMouseMove={handleMouseMove}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.images[activeImageIndex]}
                alt={product.title}
                className={`${styles.mainImage} ${isZoomed ? styles.zoomedImage : ''}`}
                style={
                  isZoomed
                    ? { transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` }
                    : undefined
                }
              />
            </div>
          </div>

          {/* Mobile Image Carousel */}
          <div className={styles.mobileCarousel}>
            {product.images.map((img, idx) => (
              <div key={idx} className={styles.mobileCarouselItem}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img} alt={`${product.title} carousel ${idx}`} />
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Product Details */}
        <div className={styles.infoPanel}>
          <span className={styles.category}>{product.category}</span>
          <h1 className={styles.title}>{product.title}</h1>

          <div className={styles.priceRow}>
            {product.compare_at_price ? (
              <>
                <span className={`${styles.price} ${styles.salePrice}`}>
                  ₹ {product.price.toLocaleString('en-IN')}
                </span>
                <span className={styles.comparePrice}>
                  ₹ {product.compare_at_price.toLocaleString('en-IN')}
                </span>
              </>
            ) : (
              <span className={styles.price}>
                ₹ {product.price.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          {/* Color Selection */}
          <div className={styles.variantSection}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionLabel}>Color: {selectedColor}</span>
            </div>
            <div className={styles.colorGrid}>
              {product.colors.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`${styles.colorButton} ${selectedColor === color ? styles.colorButtonActive : ''}`}
                  style={{
                    backgroundColor:
                      color.toLowerCase() === 'brown'
                        ? '#5c4033'
                        : color.toLowerCase() === 'cobalt blue'
                        ? '#3b82f6'
                        : color.toLowerCase() === 'bright orange'
                        ? '#e65c00'
                        : color.toLowerCase() === 'vintage black' || color.toLowerCase() === 'carbon black' || color.toLowerCase() === 'charcoal grey'
                        ? '#1a1a1a'
                        : color.toLowerCase() === 'off-white' || color.toLowerCase() === 'cream'
                        ? '#fcfcfc'
                        : color.toLowerCase() === 'emerald green' || color.toLowerCase() === 'forest green'
                        ? '#006400'
                        : '#ccc'
                  }}
                  title={color}
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>
          </div>

          {/* Size Selection */}
          <div className={styles.variantSection}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionLabel}>
                Size: {selectedSize || 'Select Size'}
              </span>
              <button
                onClick={() => setIsSizeGuideOpen(true)}
                className={styles.sizeGuideLink}
              >
                Size Guide
              </button>
            </div>
            <div className={styles.sizeGrid}>
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => {
                    setSelectedSize(size);
                    setSizeError(false);
                  }}
                  className={`${styles.sizeButton} ${selectedSize === size ? styles.sizeButtonActive : ''}`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Validation Warnings */}
          {sizeError && (
            <div className={styles.errorAlert}>
              Please select a size before adding to bag.
            </div>
          )}

          {/* Inventory warning */}
          {isLowStock && (
            <div className={styles.inventoryAlert}>
              Running low! Only {product.inventory} units left.
            </div>
          )}

          {/* CTA Add to bag */}
          <button
            onClick={handleAddToBag}
            disabled={isSoldOut}
            className={`${styles.addToBagBtn} ${isSoldOut ? styles.addToBagBtnDisabled : ''}`}
          >
            {isSoldOut ? 'Sold Out' : 'Add to Bag'}
          </button>

          {/* Details Accordions */}
          <div className={styles.accordions}>
            {/* Description */}
            <div className={styles.accordion}>
              <button
                className={styles.accordionHeader}
                onClick={() => toggleAccordion('description')}
              >
                <span className={styles.accordionTitle}>Description</span>
                {accordions.description ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {accordions.description && (
                <div className={styles.accordionContent}>
                  <p>{product.description}</p>
                </div>
              )}
            </div>

            {/* Care instructions */}
            <div className={styles.accordion}>
              <button
                className={styles.accordionHeader}
                onClick={() => toggleAccordion('care')}
              >
                <span className={styles.accordionTitle}>Care Details</span>
                {accordions.care ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {accordions.care && (
                <div className={styles.accordionContent}>
                  <p>{product.care}</p>
                </div>
              )}
            </div>

            {/* Shipping & Returns */}
            <div className={styles.accordion}>
              <button
                className={styles.accordionHeader}
                onClick={() => toggleAccordion('shipping')}
              >
                <span className={styles.accordionTitle}>Shipping & Returns</span>
                {accordions.shipping ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {accordions.shipping && (
                <div className={styles.accordionContent}>
                  <p>
                    Free shipping on orders above ₹ 5,000 across India. Regular delivery takes 3 to 5
                    business days. Express shipping (1 to 2 business days) available at checkout.
                  </p>
                  <p style={{ marginTop: 8 }}>
                    Easy 7-day returns and exchanges handled directly through our returns portal.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Related Products ("You May Also Like") */}
      {relatedProducts.length > 0 && (
        <section className={styles.relatedSection}>
          <h2 className={styles.relatedTitle}>You May Also Like</h2>
          <div className={styles.relatedGrid}>
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Size Guide Modal Overlay */}
      {isSizeGuideOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsSizeGuideOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setIsSizeGuideOpen(false)}
              className={styles.modalClose}
              aria-label="Close size guide"
            >
              <X size={20} />
            </button>
            <h3 className={styles.modalTitle}>Size Guide</h3>
            <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
              All measurements are in inches. Our products are designed for a relaxed, oversized fit.
            </p>
            <table className={styles.modalTable}>
              <thead>
                <tr>
                  <th>Size</th>
                  <th>Chest</th>
                  <th>Length</th>
                  <th>Shoulder</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>XS</td>
                  <td>42</td>
                  <td>27</td>
                  <td>20</td>
                </tr>
                <tr>
                  <td>S</td>
                  <td>44</td>
                  <td>28</td>
                  <td>21</td>
                </tr>
                <tr>
                  <td>M</td>
                  <td>46</td>
                  <td>29</td>
                  <td>22</td>
                </tr>
                <tr>
                  <td>L</td>
                  <td>48</td>
                  <td>30</td>
                  <td>23</td>
                </tr>
                <tr>
                  <td>XL</td>
                  <td>50</td>
                  <td>31</td>
                  <td>24</td>
                </tr>
                <tr>
                  <td>XXL</td>
                  <td>52</td>
                  <td>32</td>
                  <td>25</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
