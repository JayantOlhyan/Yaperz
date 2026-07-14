'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp, AlertCircle, X, Ruler, Tag, Truck } from 'lucide-react';
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
  const [quantity, setQuantity] = useState<number>(1);
  const [pincode, setPincode] = useState('');

  // Accordion state
  const [accordions, setAccordions] = useState({
    shipping: false,
    fabric: false,
    more: false
  });

  // Init color once product is found
  React.useEffect(() => {
    if (product) {
      setSelectedColor(product.colors[0]);
      setSelectedSize(null);
      setActiveImageIndex(0);
      setSizeError(false);
      setQuantity(1);
    }
  }, [product]);

  if (!product) {
    return (
      <div className="container" style={{ padding: '100px 0', textAlign: 'center' }}>
        <AlertCircle size={48} style={{ color: 'var(--color-error)', margin: '0 auto 16px' }} />
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
    addToCart(product, quantity, selectedSize, selectedColor);
  };

  const toggleAccordion = (section: 'shipping' | 'fabric' | 'more') => {
    setAccordions((prev) => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Get related products
  const relatedProducts = (productsData as Product[])
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  // All possible sizes to match standard row look
  const allSizes = ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

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
          <h1 className={styles.title}>{product.title}</h1>

          <div className={styles.priceRow}>
            <span className={styles.price}>
              Rs. {product.price.toLocaleString('en-IN')}
            </span>
            {product.compare_at_price && (
              <>
                <span className={styles.comparePrice}>
                  Rs. {product.compare_at_price.toLocaleString('en-IN')}
                </span>
                <span className={styles.discount}>
                  {Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)}% OFF
                </span>
              </>
            )}
          </div>
          <div className={styles.taxLabel}>(MRP incl. of all taxes)</div>

          <div className={styles.divider} />

          {/* Size Selection */}
          <div className={styles.variantSection}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionLabel}>Select Size</span>
              <button
                onClick={() => setIsSizeGuideOpen(true)}
                className={styles.sizeGuideLink}
              >
                <Ruler size={14} /> size guide
              </button>
            </div>
            <div className={styles.sizeGrid}>
              {allSizes.map((size) => {
                const isAvailable = product.sizes.includes(size);
                return (
                  <button
                    key={size}
                    onClick={() => {
                      if (isAvailable) {
                        setSelectedSize(size);
                        setSizeError(false);
                      }
                    }}
                    disabled={!isAvailable}
                    className={`${styles.sizeButton} ${
                      selectedSize === size ? styles.sizeButtonActive : ''
                    } ${!isAvailable ? styles.sizeButtonDisabled : ''}`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          <div className={styles.divider} />

          {/* Quantity Selection */}
          <div className={styles.variantSection}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionLabel}>Select Quantity</span>
            </div>
            <div className={styles.quantityWrapper}>
              <div className={styles.quantitySelector}>
                <button 
                  className={styles.quantityBtn} 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <div className={styles.quantityValue}>{quantity}</div>
                <button 
                  className={styles.quantityBtn} 
                  onClick={() => setQuantity(quantity + 1)}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Validation Warnings */}
          {sizeError && (
            <div className={styles.errorAlert} style={{ marginTop: 16 }}>
              Please select a size before adding to bag.
            </div>
          )}

          <div className={styles.divider} />

          {/* CTA Add to bag */}
          <button
            onClick={handleAddToBag}
            disabled={isSoldOut}
            className={`${styles.addToBagBtn} ${isSoldOut ? styles.addToBagBtnDisabled : ''}`}
          >
            {isSoldOut ? 'SOLD OUT' : 'ADD TO CART'}
          </button>

          <div className={styles.divider} />

          {/* Delivery Options */}
          <div className={styles.deliveryBlock}>
            <div className={styles.deliveryTitle}>
              Delivery Options <Truck size={18} />
            </div>
            <div className={styles.pincodeInputWrapper}>
              <input 
                type="text" 
                placeholder="Enter Pincode" 
                className={styles.pincodeInput}
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
              />
              <button className={styles.pincodeBtn}>CHECK</button>
            </div>
            <div className={styles.deliverySubtext}>
              Please enter PIN code to check delivery time & Pay on Delivery Availability
            </div>
            <div className={styles.perkText}>Cash on Delivery (COD) available</div>
            <div className={styles.perkText}>Easy return & exchange</div>
          </div>

          {/* Offers Block */}
          <div className={styles.offersBlock}>
            <div className={styles.offersHeader}>
              <span className={styles.offersTitle}>3 Offers</span>
              <span className={styles.offersViewAll}>VIEW ALL</span>
            </div>
            <div className={styles.offerItem}>
              <Tag size={16} className={styles.offerIcon} />
              <div className={styles.offerText}>
                Buy 2 and get additional 15% off on selected styles.<br />
                Use Code : BUY2EXTRA15
              </div>
            </div>
            <div className={styles.offerItem}>
              <Tag size={16} className={styles.offerIcon} />
              <div className={styles.offerText}>
                Buy 2 and get additional 12% off on selected styles.<br />
                Use Code : BUY2EXTRA12
              </div>
            </div>
          </div>

          {/* Details Accordions */}
          <div className={styles.accordions}>
            {/* Shipping & Returns */}
            <div className={styles.accordion}>
              <button
                className={styles.accordionHeader}
                onClick={() => toggleAccordion('shipping')}
              >
                <span className={styles.accordionTitle}>Shipping & Return</span>
                {accordions.shipping ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
              {accordions.shipping && (
                <div className={styles.accordionContent}>
                  <p>
                    Free shipping on orders above ₹ 5,000 across India. Regular delivery takes 3 to 5
                    business days.
                  </p>
                  <p style={{ marginTop: 8 }}>
                    Easy 7-day returns and exchanges handled directly through our returns portal.
                  </p>
                </div>
              )}
            </div>

            {/* Fabric and Care */}
            <div className={styles.accordion}>
              <button
                className={styles.accordionHeader}
                onClick={() => toggleAccordion('fabric')}
              >
                <span className={styles.accordionTitle}>Fabric and Care</span>
                {accordions.fabric ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
              {accordions.fabric && (
                <div className={styles.accordionContent}>
                  <p>{product.care || 'Machine wash cold. Do not bleach. Tumble dry low.'}</p>
                </div>
              )}
            </div>
            
            {/* More Information */}
            <div className={styles.accordion}>
              <button
                className={styles.accordionHeader}
                onClick={() => toggleAccordion('more')}
              >
                <span className={styles.accordionTitle}>More Information</span>
                {accordions.more ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
              {accordions.more && (
                <div className={styles.accordionContent}>
                  <p>{product.description}</p>
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
