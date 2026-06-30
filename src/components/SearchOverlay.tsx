'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { X, Search } from 'lucide-react';
import productsData from '../data/products.json';
import { Product } from '../types';
import styles from './SearchOverlay.module.css';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchOverlay: React.FC<SearchOverlayProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const popularTags = [
    'Hoodie',
    'Jacket',
    'Tee',
    'Cap',
    'Case',
    'Basics',
    'Racing'
  ];

  // Auto-focus input when search is opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTimeout(() => { setQuery(''); setResults([]); }, 0);
    }
    return () => {
      document.body.classList.remove('no-scroll');
    };
  }, [isOpen]);

  // Perform search filtering
  useEffect(() => {
    if (!query.trim()) {
      setTimeout(() => setResults([]), 0);
      return;
    }

    const filtered = (productsData as Product[]).filter((p) => {
      const q = query.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)) ||
        p.description.toLowerCase().includes(q)
      );
    });

    setResults(filtered.slice(0, 5)); // Limit to 5 instant results
  }, [query]);

  const handleTagClick = (tag: string) => {
    onClose();
    router.push(`/collections/all-products?search=${encodeURIComponent(tag)}`);
  };

  const handleProductClick = (slug: string) => {
    onClose();
    router.push(`/products/${slug}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && query.trim()) {
      onClose();
      router.push(`/collections/all-products?search=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className={`${styles.overlay} ${isOpen ? styles.overlayOpen : ''}`}>
      <div className={styles.container}>
        {/* Header Search Input */}
        <div className={styles.header}>
          <Search size={24} style={{ color: 'var(--color-text-muted)', marginRight: 12 }} />
          <input
            ref={inputRef}
            type="text"
            className={styles.input}
            placeholder="Search our collections..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button onClick={onClose} className={styles.closeButton} aria-label="Close search">
            <X size={28} />
          </button>
        </div>

        {/* Popular Tags */}
        {!query.trim() && (
          <div className={styles.popularContainer}>
            <h3 className={styles.sectionTitle}>Popular Searches</h3>
            <div className={styles.tagList}>
              {popularTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagClick(tag)}
                  className={styles.tagButton}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Instant Search Results */}
        {query.trim() && (
          <div>
            <h3 className={styles.sectionTitle}>Products</h3>
            {results.length === 0 ? (
              <div className={styles.noResults}>No products found matching &quot;{query}&quot;</div>
            ) : (
              <div className={styles.resultsGrid}>
                {results.map((product) => (
                  <button
                    key={product.id}
                    className={styles.resultItem}
                    onClick={() => handleProductClick(product.slug)}
                  >
                    <div className={styles.resultImage}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={product.images[0]}
                        alt={product.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    <div className={styles.resultDetails}>
                      <h4 className={styles.resultTitle}>{product.title}</h4>
                      <p className={styles.resultCategory}>{product.category}</p>
                    </div>
                    <span className={styles.resultPrice}>
                      ₹ {product.price.toLocaleString('en-IN')}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
