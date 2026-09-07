# Product Data Schema

## Product Entity
```typescript
interface Product {
  id: string;
  title: string;
  slug: string;
  price: number;
  compare_at_price: number | null;
  category: string;
  collections: string[];
  tags: string[];
  sizes: string[];
  colors: string[];
  images: string[];
  inventory: number;
  description: string;
  care: string;
}
```
