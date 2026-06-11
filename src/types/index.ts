export interface Product {
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

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
}

export interface StoreInfo {
  city: string;
  address: string;
  phone: string;
  email: string;
  hours: string;
  mapLink: string;
}
