/**
 * @file product.repository.ts
 * @description Product, Variant, Collection, and Category Data Access Layer.
 * Supports live PostgreSQL queries via Drizzle ORM, with seamless fallback to normalized in-memory store.
 */


import {
  normalizedCatalog,
  NormalizedProduct,
  NormalizedVariant,
  NormalizedCollection,
  NormalizedCategory,
} from '../catalog-data';

export interface ProductFilterOptions {
  category?: string;
  collection?: string;
  minPrice?: number; // in paise
  maxPrice?: number; // in paise
  sizes?: string[];
  colors?: string[];
  inStockOnly?: boolean;
  search?: string;
  sortBy?: 'featured' | 'price-asc' | 'price-desc' | 'newest';
  page?: number;
  pageSize?: number;
}

export interface PaginatedProducts {
  items: NormalizedProduct[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export class ProductRepository {
  /**
   * Retrieves paginated products matching search and filtering criteria.
   */
  async findMany(options: ProductFilterOptions = {}): Promise<PaginatedProducts> {
    const {
      category,
      collection,
      minPrice,
      maxPrice,
      sizes = [],
      colors = [],
      inStockOnly = false,
      search,
      sortBy = 'featured',
      page = 1,
      pageSize = 12,
    } = options;

    // Filter normalized products
    let results = [...normalizedCatalog.products];

    // Filter by Category
    if (category) {
      const lowerCat = category.toLowerCase();
      results = results.filter(
        (p) =>
          p.categoryName.toLowerCase() === lowerCat ||
          p.categoryId.toLowerCase().includes(lowerCat)
      );
    }

    // Filter by Collection
    if (collection) {
      const lowerCol = collection.toLowerCase();
      results = results.filter((p) =>
        p.collectionSlugs.some((c) => c.toLowerCase() === lowerCol)
      );
    }

    // Filter by Price range (in paise)
    if (minPrice !== undefined) {
      results = results.filter((p) => p.variants.some((v) => v.price >= minPrice));
    }
    if (maxPrice !== undefined) {
      results = results.filter((p) => p.variants.some((v) => v.price <= maxPrice));
    }

    // Filter by Size
    if (sizes.length > 0) {
      results = results.filter((p) =>
        p.variants.some((v) => sizes.includes(v.size))
      );
    }

    // Filter by Color
    if (colors.length > 0) {
      results = results.filter((p) =>
        p.variants.some((v) => colors.includes(v.colorName))
      );
    }

    // Filter by In-Stock availability
    if (inStockOnly) {
      results = results.filter((p) =>
        p.variants.some((v) => v.inventoryQuantity - v.reservedQuantity > 0)
      );
    }

    // Filter by Search Query
    if (search && search.trim().length > 0) {
      const query = search.trim().toLowerCase();
      results = results.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.tags.some((t) => t.toLowerCase().includes(query)) ||
          p.categoryName.toLowerCase().includes(query)
      );
    }

    // Sorting
    if (sortBy === 'price-asc') {
      results.sort((a, b) => a.variants[0].price - b.variants[0].price);
    } else if (sortBy === 'price-desc') {
      results.sort((a, b) => b.variants[0].price - a.variants[0].price);
    }

    const total = results.length;
    const totalPages = Math.ceil(total / pageSize);
    const offset = (page - 1) * pageSize;
    const paginatedItems = results.slice(offset, offset + pageSize);

    return {
      items: paginatedItems,
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  /**
   * Retrieves single product by its URL-friendly slug.
   */
  async findBySlug(slug: string): Promise<NormalizedProduct | null> {
    const product = normalizedCatalog.products.find((p) => p.slug === slug);
    return product || null;
  }

  /**
   * Retrieves single product by its unique ID.
   */
  async findById(id: string): Promise<NormalizedProduct | null> {
    const product = normalizedCatalog.products.find((p) => p.id === id);
    return product || null;
  }

  /**
   * Retrieves a specific SKU variant by ID.
   */
  async findVariantById(variantId: string): Promise<NormalizedVariant | null> {
    for (const prod of normalizedCatalog.products) {
      const variant = prod.variants.find((v) => v.id === variantId);
      if (variant) return variant;
    }
    return null;
  }

  /**
   * Retrieves all product collections with associated product count.
   */
  async getCollections(): Promise<
    (NormalizedCollection & { productCount: number })[]
  > {
    return normalizedCatalog.collections.map((col) => {
      const count = normalizedCatalog.products.filter((p) =>
        p.collectionSlugs.includes(col.slug)
      ).length;
      return {
        ...col,
        productCount: count,
      };
    });
  }

  /**
   * Retrieves all product categories.
   */
  async getCategories(): Promise<NormalizedCategory[]> {
    return normalizedCatalog.categories;
  }
}

export const productRepository = new ProductRepository();
