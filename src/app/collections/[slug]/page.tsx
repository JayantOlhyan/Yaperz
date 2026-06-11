'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Filter, X, RotateCcw } from 'lucide-react';
import { ProductCard } from '../../../components/ProductCard';
import { SkeletonLoader } from '../../../components/SkeletonLoader';
import productsData from '../../../data/products.json';
import { Product } from '../../../types';
import styles from './page.module.css';

interface CollectionPageProps {
  params: Promise<{ slug: string }>;
}

export default function CollectionDetailPage({ params }: CollectionPageProps) {
  const { slug } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();

  // State for skeleton loading simulation
  const [isLoading, setIsLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(true);

  // State triggers for filters
  const [inStockOnly, setInStockOnly] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(40000);
  const [sortOption, setSortOption] = useState<string>('featured');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Simulated API loading duration of 800ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      const fadeTimer = setTimeout(() => {
        setIsTransitioning(false);
      }, 400); // matches the 400ms CSS crossfade duration
      return () => clearTimeout(fadeTimer);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Constants
  const colorsList = [
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Brown', value: '#5c4033' },
    { name: 'White', value: '#ffffff' },
    { name: 'Black', value: '#000000' },
    { name: 'Red', value: '#b22222' },
    { name: 'Grey', value: '#808080' },
    { name: 'Green', value: '#006400' },
    { name: 'Orange', value: '#e65c00' },
    { name: 'Beige', value: '#f5f5dc' },
    { name: 'Sand', value: '#e2cac0' }
  ];

  const sizesList = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36'];

  const categoriesList = ['Hoodies', 'Jackets', 'T-shirts', 'Shirts', 'Polos', 'Caps', 'Cases', 'Cargos'];
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // 1. Synchronize State with URL Query Params on Mount/Update
  useEffect(() => {
    const sizeParam = searchParams.get('size');
    const colorParam = searchParams.get('color');
    const stockParam = searchParams.get('inStock');
    const priceParam = searchParams.get('price');
    const sortParam = searchParams.get('sort');
    const queryParam = searchParams.get('search');
    const categoryParam = searchParams.get('category');

    if (sizeParam) setSelectedSizes(sizeParam.split(','));
    else setSelectedSizes([]);

    if (colorParam) setSelectedColors(colorParam.split(','));
    else setSelectedColors([]);

    if (stockParam === 'true') setInStockOnly(true);
    else setInStockOnly(false);

    if (priceParam) setMaxPrice(parseInt(priceParam));
    else setMaxPrice(40000);

    if (sortParam) setSortOption(sortParam);
    else setSortOption('featured');

    if (queryParam) setSearchQuery(queryParam);
    else setSearchQuery('');

    if (categoryParam) setSelectedCategories(categoryParam.split(','));
    else setSelectedCategories([]);
  }, [searchParams]);

  // 2. Helper to push updated states to URL
  const updateURL = (filters: {
    sizes: string[];
    colors: string[];
    inStock: boolean;
    price: number;
    sort: string;
    categories: string[];
  }) => {
    const paramsObj = new URLSearchParams();

    if (filters.sizes.length > 0) paramsObj.set('size', filters.sizes.join(','));
    if (filters.colors.length > 0) paramsObj.set('color', filters.colors.join(','));
    if (filters.inStock) paramsObj.set('inStock', 'true');
    if (filters.price !== 40000) paramsObj.set('price', filters.price.toString());
    if (filters.sort !== 'featured') paramsObj.set('sort', filters.sort);
    if (filters.categories.length > 0) paramsObj.set('category', filters.categories.join(','));
    if (searchQuery) paramsObj.set('search', searchQuery);

    const queryString = paramsObj.toString();
    router.push(`/collections/${slug}${queryString ? `?${queryString}` : ''}`);
  };

  // 3. Toggle filters
  const toggleSize = (size: string) => {
    const updated = selectedSizes.includes(size)
      ? selectedSizes.filter((s) => s !== size)
      : [...selectedSizes, size];
    setSelectedSizes(updated);
    updateURL({ sizes: updated, colors: selectedColors, inStock: inStockOnly, price: maxPrice, sort: sortOption, categories: selectedCategories });
  };

  const toggleColor = (color: string) => {
    const updated = selectedColors.includes(color)
      ? selectedColors.filter((c) => c !== color)
      : [...selectedColors, color];
    setSelectedColors(updated);
    updateURL({ sizes: selectedSizes, colors: updated, inStock: inStockOnly, price: maxPrice, sort: sortOption, categories: selectedCategories });
  };

  const toggleCategory = (cat: string) => {
    const updated = selectedCategories.includes(cat)
      ? selectedCategories.filter((c) => c !== cat)
      : [...selectedCategories, cat];
    setSelectedCategories(updated);
    updateURL({ sizes: selectedSizes, colors: selectedColors, inStock: inStockOnly, price: maxPrice, sort: sortOption, categories: updated });
  };

  const handlePriceChange = (val: number) => {
    setMaxPrice(val);
  };

  const handlePriceMouseUp = () => {
    updateURL({ sizes: selectedSizes, colors: selectedColors, inStock: inStockOnly, price: maxPrice, sort: sortOption, categories: selectedCategories });
  };

  const handleStockToggle = () => {
    const updated = !inStockOnly;
    setInStockOnly(updated);
    updateURL({ sizes: selectedSizes, colors: selectedColors, inStock: updated, price: maxPrice, sort: sortOption, categories: selectedCategories });
  };

  const handleSortChange = (val: string) => {
    setSortOption(val);
    updateURL({ sizes: selectedSizes, colors: selectedColors, inStock: inStockOnly, price: maxPrice, sort: val, categories: selectedCategories });
  };

  const clearAllFilters = () => {
    setSelectedSizes([]);
    setSelectedColors([]);
    setInStockOnly(false);
    setMaxPrice(40000);
    setSelectedCategories([]);
    router.push(`/collections/${slug}${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ''}`);
  };

  // 4. Filtering & Sorting Logic
  const allProducts = productsData as Product[];

  // Collection boundary check
  const collectionProducts = slug === 'all-products'
    ? allProducts
    : allProducts.filter((p) => p.collections.includes(slug) || p.category.toLowerCase() === slug.toLowerCase() || p.slug.includes(slug));

  const filteredProducts = collectionProducts.filter((p) => {
    // Search query check
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)) ||
        p.description.toLowerCase().includes(q);
      if (!matchesSearch) return false;
    }

    // Availability filter
    if (inStockOnly && p.inventory === 0) return false;

    // Size filter
    if (selectedSizes.length > 0 && !p.sizes.some((s) => selectedSizes.includes(s))) return false;

    // Color filter
    if (selectedColors.length > 0 && !p.tags.some((t) => selectedColors.map(c => c.toLowerCase()).includes(t.toLowerCase()))) return false;

    // Category filter
    if (selectedCategories.length > 0 && !selectedCategories.includes(p.category)) return false;

    // Price range filter
    if (p.price > maxPrice) return false;

    return true;
  });

  // Sorting
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortOption === 'price-asc') return a.price - b.price;
    if (sortOption === 'price-desc') return b.price - a.price;
    if (sortOption === 'newest') return parseInt(b.id) - parseInt(a.id); // Simulated newest
    return 0; // Default Featured (manual)
  });

  // Collection Title Mapping
  const getCollectionTitle = () => {
    if (searchQuery) return `Search Results for "${searchQuery}"`;
    if (slug === 'all-products') return 'All Products';
    return slug
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <div className={`${styles.container} container`}>
      <div className={styles.loadingContainer}>
        {isTransitioning && (
          <div className={`${styles.skeletonWrapper} ${isLoading ? styles.skeletonWrapperActive : styles.skeletonWrapperFade}`}>
            <SkeletonLoader type="product-grid" count={sortedProducts.length || 6} />
          </div>
        )}

        <div className={`${styles.contentWrapper} ${!isLoading ? styles.contentWrapperActive : ''}`}>
          {/* Page Header */}
          <div className={styles.header}>
            <h1 className={styles.title}>{getCollectionTitle()}</h1>
            <p className={styles.count}>{filteredProducts.length} Products found</p>
          </div>

          {/* Filter toolbar */}
          <div className={styles.toolbar}>
            <button onClick={() => setIsMobileFiltersOpen(true)} className={styles.mobileFilterBtn}>
              <Filter size={16} /> Filters
            </button>
            <div>
              <select
                value={sortOption}
                onChange={(e) => handleSortChange(e.target.value)}
                className={styles.sortSelect}
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="newest">Newest</option>
              </select>
            </div>
          </div>

          {/* Active Filter Chips */}
          {(selectedSizes.length > 0 || selectedColors.length > 0 || inStockOnly || maxPrice !== 40000 || selectedCategories.length > 0) && (
            <div className={styles.activeChips}>
              {inStockOnly && (
                <div onClick={handleStockToggle} className={styles.chip}>
                  In Stock Only <X size={12} />
                </div>
              )}
              {selectedSizes.map((size) => (
                <div key={size} onClick={() => toggleSize(size)} className={styles.chip}>
                  Size: {size} <X size={12} />
                </div>
              ))}
              {selectedColors.map((color) => (
                <div key={color} onClick={() => toggleColor(color)} className={styles.chip}>
                  Color: {color} <X size={12} />
                </div>
              ))}
              {selectedCategories.map((cat) => (
                <div key={cat} onClick={() => toggleCategory(cat)} className={styles.chip}>
                  Category: {cat} <X size={12} />
                </div>
              ))}
              {maxPrice !== 40000 && (
                <div onClick={() => { setMaxPrice(40000); updateURL({ sizes: selectedSizes, colors: selectedColors, inStock: inStockOnly, price: 40000, sort: sortOption, categories: selectedCategories }); }} className={styles.chip}>
                  Under RS. {maxPrice.toLocaleString('en-IN')} <X size={12} />
                </div>
              )}
              <div onClick={clearAllFilters} className={styles.chip} style={{ color: 'var(--color-accent)', borderColor: 'var(--color-accent)' }}>
                <RotateCcw size={12} /> Clear All
              </div>
            </div>
          )}

          {/* Main Layout grid */}
          <div className={styles.layout}>
            {/* Left Sidebar (Desktop Filters) */}
            <aside className={styles.sidebar}>
              {/* Availability */}
              <div className={styles.filterBlock}>
                <h3 className={styles.filterTitle}>Availability</h3>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={handleStockToggle}
                    className={styles.checkboxInput}
                  />
                  In Stock Only
                </label>
              </div>

              {/* Size Button Grid */}
              <div className={styles.filterBlock}>
                <h3 className={styles.filterTitle}>Filter by Size</h3>
                <div className={styles.sizeGrid}>
                  {sizesList.map((size) => (
                    <button
                      key={size}
                      onClick={() => toggleSize(size)}
                      className={`${styles.sizeBtn} ${selectedSizes.includes(size) ? styles.sizeBtnActive : ''}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Visual Swatches */}
              <div className={styles.filterBlock}>
                <h3 className={styles.filterTitle}>Filter by Color</h3>
                <div className={styles.colorGrid}>
                  {colorsList.map((col) => (
                    <button
                      key={col.name}
                      onClick={() => toggleColor(col.name)}
                      className={`${styles.colorButton} ${selectedColors.includes(col.name) ? styles.colorButtonActive : ''}`}
                      style={{ backgroundColor: col.value }}
                      title={col.name}
                      aria-label={`Filter by ${col.name}`}
                    />
                  ))}
                </div>
              </div>

              {/* Category List */}
              {slug === 'all-products' && (
                <div className={styles.filterBlock}>
                  <h3 className={styles.filterTitle}>Category</h3>
                  {categoriesList.map((cat) => (
                    <label key={cat} className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat)}
                        onChange={() => toggleCategory(cat)}
                        className={styles.checkboxInput}
                      />
                      {cat}
                    </label>
                  ))}
                </div>
              )}

              {/* Price Range Slider */}
              <div className={styles.filterBlock}>
                <h3 className={styles.filterTitle}>Max Price</h3>
                <div className={styles.priceRange}>
                  <input
                    type="range"
                    min="0"
                    max="40000"
                    step="500"
                    value={maxPrice}
                    onChange={(e) => handlePriceChange(parseInt(e.target.value))}
                    onMouseUp={handlePriceMouseUp}
                    onTouchEnd={handlePriceMouseUp}
                    className={styles.slider}
                  />
                  <span className={styles.priceLabel}>
                    Under RS. {maxPrice.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </aside>

            {/* Product Grid Area */}
            <main className={styles.main}>
              {sortedProducts.length === 0 ? (
                <div className={styles.emptyState}>
                  <h3 className={styles.emptyTitle}>No products match the filters</h3>
                  <p className={styles.emptyDesc}>Try modifying your selection or clear all filters.</p>
                  <button onClick={clearAllFilters} className={styles.clearBtn}>
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className={styles.grid}>
                  {sortedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </main>
          </div>

          {/* Mobile Filters Drawer Modal */}
          <div className={`${styles.mobileDrawer} ${isMobileFiltersOpen ? styles.mobileDrawerOpen : ''}`}>
            <div className={styles.mobileDrawerHeader}>
              <h2 className={styles.mobileDrawerTitle}>Filters</h2>
              <button onClick={() => setIsMobileFiltersOpen(false)} aria-label="Close filters">
                <X size={24} />
              </button>
            </div>
            <div className={styles.mobileDrawerContent}>
              {/* Mobile Availability */}
              <div className={styles.filterBlock}>
                <h3 className={styles.filterTitle}>Availability</h3>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={handleStockToggle}
                    className={styles.checkboxInput}
                  />
                  In Stock Only
                </label>
              </div>

              {/* Mobile Size Grid */}
              <div className={styles.filterBlock}>
                <h3 className={styles.filterTitle}>Filter by Size</h3>
                <div className={styles.sizeGrid}>
                  {sizesList.map((size) => (
                    <button
                      key={size}
                      onClick={() => toggleSize(size)}
                      className={`${styles.sizeBtn} ${selectedSizes.includes(size) ? styles.sizeBtnActive : ''}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Color Grid */}
              <div className={styles.filterBlock}>
                <h3 className={styles.filterTitle}>Filter by Color</h3>
                <div className={styles.colorGrid}>
                  {colorsList.map((col) => (
                    <button
                      key={col.name}
                      onClick={() => toggleColor(col.name)}
                      className={`${styles.colorButton} ${selectedColors.includes(col.name) ? styles.colorButtonActive : ''}`}
                      style={{ backgroundColor: col.value }}
                      title={col.name}
                      aria-label={`Filter by ${col.name}`}
                    />
                  ))}
                </div>
              </div>

              {/* Mobile Price Slider */}
              <div className={styles.filterBlock}>
                <h3 className={styles.filterTitle}>Max Price</h3>
                <div className={styles.priceRange}>
                  <input
                    type="range"
                    min="0"
                    max="40000"
                    step="500"
                    value={maxPrice}
                    onChange={(e) => handlePriceChange(parseInt(e.target.value))}
                    onMouseUp={handlePriceMouseUp}
                    onTouchEnd={handlePriceMouseUp}
                    className={styles.slider}
                  />
                  <span className={styles.priceLabel}>
                    Under RS. {maxPrice.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
            <div className={styles.mobileDrawerFooter}>
              <button onClick={clearAllFilters} className={styles.resetBtn}>
                Clear All
              </button>
              <button onClick={() => setIsMobileFiltersOpen(false)} className={styles.applyBtn}>
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
