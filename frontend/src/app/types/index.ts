export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  original_price?: number;
  category: string;
  subcategory?: string;
  images: string[];
  description: string;
  rating: number;
  reviewCount: number;
  review_count?: number;
  stock: number;
  tags: string[];
  sizes?: string[];
  colors?: { name: string; hex: string }[];
  featured?: boolean;
  isNew?: boolean;
  is_new?: boolean;
  topNotes?: string;
  heartNotes?: string;
  baseNotes?: string;
  top_notes?: string | null;
  heart_notes?: string | null;
  base_notes?: string | null;
  ingredients?: string;
  longevity?: string;
  sillage?: string;
  season?: string;
  origin?: string;
  concentration?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  size?: string;
  color?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "customer" | "admin";
  avatar?: string;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  createdAt: string;
  shippingAddress: Address;
  paymentId?: string;
}

export interface Address {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  productCount: number;
}
