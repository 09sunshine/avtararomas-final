import { normalizeImageUrls } from "./image";
import { supabase } from "./supabaseClient";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4001";

async function getAuthHeaders(): Promise<Record<string, string>> {
  try {
    const { data } = await supabase.auth.getSession();
    if (data?.session?.access_token) {
      return { Authorization: `Bearer ${data.session.access_token}` };
    }
  } catch (err) {
    // Session token retrieval fallback
  }
  return {};
}

export interface ApiCustomer {
  id?: string;
  name: string;
  email: string;
  role?: "customer" | "admin";
  avatar?: string;
}

export interface ApiAddress {
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface ApiOrderItem {
  productId: string;
  productSlug: string;
  productName: string;
  productImage?: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
}

export interface ApiOrder {
  id: string;
  orderNumber: string;
  customer: ApiCustomer;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  couponCode?: string | null;
  paymentMethod?: string | null;
  paymentStatus?: string;
  razorpayOrderId?: string | null;
  razorpayPaymentId?: string | null;
  razorpaySignature?: string | null;
  razorpayRefundId?: string | null;
  notes?: string | null;
  trackingNumber?: string | null;
  createdAt: string;
  updatedAt: string;
  address: ApiAddress;
  items: ApiOrderItem[];
}

export interface CreateOrderResponse extends ApiOrder {
  razorpayKeyId?: string;
  razorpayAmount?: number;
  currency?: string;
}

export interface ApiReview {
  id: string;
  productId: string;
  productSlug: string;
  productName: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: { id: string; name: string; avatar?: string | null };
}

export interface ApiOverview {
  totalOrders: number;
  totalCustomers: number;
  totalReviews: number;
  revenue: number;
  recentOrders: Array<{
    id: string;
    customer: string;
    email: string;
    status: string;
    total: number;
    date: string;
  }>;
  recentReviews: Array<{
    id: string;
    rating: number;
    comment: string;
    date: string;
    productName: string;
    productSlug: string;
    user: { id: string; name: string; avatar?: string | null };
  }>;
  revenueData?: Array<{ month: string; revenue: number }>;
  categoryData?: Array<{ name: string; value: number; color: string }>;
}

export interface ApiCoupon {
  id: string;
  code: string;
  discount: number;
  uses: number;
  limit: number;
  active: boolean;
  expiry?: string;
  minOrder: number;
}

export interface ApiStoreSettings {
  storeName: string;
  supportEmail: string;
  phone: string;
  gst: string;
  currency: string;
  freeShippingThreshold: number;
  standardShippingFee: number;
  orderAlerts: boolean;
  stockAlerts: boolean;
  newsAlerts: boolean;
  instagram: string;
  facebook: string;
  maintenanceMode: boolean;
}

export interface AuthSyncPayload {
  supabaseUserId: string;
  email: string;
  name: string;
  avatar?: string | null;
  provider?: string;
}

export interface SyncUserResponse {
  user: {
    id: string;
    external_id: string | null;
    name: string;
    email: string;
    role: "customer" | "admin";
    avatar: string | null;
  };
}

export interface ApiProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  original_price?: number;
  originalPrice?: number;
  category: string;
  subcategory?: string;
  images: string[];
  description: string;
  rating: number;
  review_count: number;
  reviewCount?: number;
  stock: number;
  tags: string[];
  sizes?: string[];
  colors?: { name: string; hex: string }[];
  featured: boolean;
  is_new: boolean;
  isNew?: boolean;
  top_notes?: string | null;
  heart_notes?: string | null;
  base_notes?: string | null;
  topNotes?: string | null;
  heartNotes?: string | null;
  baseNotes?: string | null;
  ingredients?: string | null;
  longevity?: string | null;
  sillage?: string | null;
  season?: string | null;
  origin?: string | null;
  concentration?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ApiProductFormData {
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  category: string;
  subcategory?: string;
  images: string[];
  description: string;
  stock: number;
  tags: string[];
  sizes?: string[];
  featured: boolean;
  isNew: boolean;
  topNotes?: string;
  heartNotes?: string;
  baseNotes?: string;
  ingredients?: string;
  longevity?: string;
  sillage?: string;
  season?: string;
  origin?: string;
  concentration?: string;
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const authHeaders = await getAuthHeaders();
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
      ...(init?.headers || {}),
    },
    ...init,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || error.message || "Request failed");
  }

  return response.json() as Promise<T>;
}

export async function createOrder(payload: {
  customer: ApiCustomer;
  address: ApiAddress;
  items: ApiOrderItem[];
  shipping: number;
  discount?: number;
  couponCode?: string;
  paymentMethod?: string;
  notes?: string;
}) {
  return requestJson<CreateOrderResponse>("/api/orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function verifyPayment(payload: {
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}) {
  return requestJson<{ success: boolean; message: string; order: ApiOrder }>("/api/orders/verify-payment", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function markPaymentFailed(payload: { orderId: string; error?: string }) {
  return requestJson<{ success: boolean; message: string }>("/api/orders/payment-failed", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export interface RetryPaymentResponse {
  orderId: string;
  orderNumber: string;
  total: number;
  razorpayOrderId: string;
  razorpayKeyId: string;
  razorpayAmount: number;
  currency: string;
  customer: {
    name: string;
    email: string;
    phone?: string;
  };
}

export async function retryOrderPayment(orderId: string) {
  return requestJson<RetryPaymentResponse>(`/api/orders/${orderId}/retry-payment`, {
    method: "POST",
  });
}

export async function fetchUserOrders(params: { email?: string; userId?: string }) {
  const query = new URLSearchParams();
  if (params.email) query.set("email", params.email);
  if (params.userId) query.set("userId", params.userId);
  return requestJson<ApiOrder[]>(`/api/orders${query.toString() ? `?${query.toString()}` : ""}`);
}

export async function fetchAllOrders() {
  return requestJson<ApiOrder[]>("/api/orders?scope=all");
}

export async function updateOrderStatus(orderId: string, status: string) {
  return requestJson<ApiOrder>(`/api/orders/${orderId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function cancelAndRefundOrder(orderId: string) {
  return requestJson<{ success: boolean; message: string; order: ApiOrder }>(`/api/orders/${orderId}/refund`, {
    method: "POST",
  });
}

export async function syncRefundStatus(orderId: string) {
  return requestJson<{ success: boolean; message: string; order: ApiOrder }>(`/api/orders/${orderId}/sync-refund`, {
    method: "POST",
  });
}

export async function fetchProducts(): Promise<ApiProduct[]> {
  const data = await requestJson<ApiProduct[]>("/api/products");
  return (data || []).map((p: any) => ({
    ...p,
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: Number(p.price || 0),
    originalPrice: p.original_price != null ? Number(p.original_price) : (p.originalPrice != null ? Number(p.originalPrice) : undefined),
    original_price: p.original_price != null ? Number(p.original_price) : (p.originalPrice != null ? Number(p.originalPrice) : undefined),
    category: p.category,
    subcategory: p.subcategory || undefined,
    images: normalizeImageUrls(Array.isArray(p.images) ? p.images : []),
    description: p.description || "",
    rating: Number(p.rating || 0),
    reviewCount: Number(p.review_count ?? p.reviewCount ?? 0),
    review_count: Number(p.review_count ?? p.reviewCount ?? 0),
    stock: Number(p.stock || 0),
    tags: Array.isArray(p.tags) ? p.tags : [],
    sizes: Array.isArray(p.sizes) ? p.sizes : [],
    colors: Array.isArray(p.colors) ? p.colors : [],
    featured: Boolean(p.featured),
    isNew: Boolean(p.is_new ?? p.isNew),
    is_new: Boolean(p.is_new ?? p.isNew),
    topNotes: p.top_notes ?? p.topNotes ?? null,
    heartNotes: p.heart_notes ?? p.heartNotes ?? null,
    baseNotes: p.base_notes ?? p.baseNotes ?? null,
  }));
}

export async function createProduct(payload: ApiProductFormData) {
  return requestJson<ApiProduct>("/api/products", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateProduct(id: string, payload: ApiProductFormData) {
  return requestJson<ApiProduct>(`/api/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteProduct(id: string): Promise<{ success: boolean; message: string }> {
  return requestJson<{ success: boolean; message: string }>(`/api/products/${id}`, {
    method: "DELETE",
  });
}

export async function fetchProductReviews(productId: string, productSlug: string) {
  const query = new URLSearchParams({ productId, productSlug });
  return requestJson<ApiReview[]>(`/api/reviews?${query.toString()}`);
}

export async function createReview(payload: {
  customer: ApiCustomer;
  product: { id: string; slug: string; name: string };
  rating: number;
  comment: string;
}) {
  return requestJson<ApiReview>("/api/reviews", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function fetchAdminOverview() {
  return requestJson<ApiOverview>("/api/admin/overview");
}

export async function syncAuthUser(payload: AuthSyncPayload) {
  return requestJson<SyncUserResponse>("/api/auth/sync", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// Coupons API
export async function fetchCoupons(): Promise<ApiCoupon[]> {
  return requestJson<ApiCoupon[]>("/api/coupons");
}

export async function validateCoupon(code: string, subtotal: number): Promise<{
  valid: boolean;
  message?: string;
  discountPercent?: number;
  discountAmount?: number;
  code?: string;
}> {
  return requestJson("/api/coupons/validate", {
    method: "POST",
    body: JSON.stringify({ code, subtotal }),
  });
}

export async function createCoupon(payload: {
  code: string;
  discount: number;
  limit?: number;
  active?: boolean;
  expiry?: string;
  minOrder?: number;
}): Promise<ApiCoupon> {
  return requestJson<ApiCoupon>("/api/coupons", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateCoupon(code: string, payload: {
  code?: string;
  discount?: number;
  limit?: number;
  active?: boolean;
  expiry?: string;
  minOrder?: number;
}): Promise<ApiCoupon> {
  return requestJson<ApiCoupon>(`/api/coupons/${code}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function toggleCouponActive(code: string): Promise<ApiCoupon> {
  return requestJson<ApiCoupon>(`/api/coupons/${code}/toggle`, {
    method: "PATCH",
  });
}

export async function deleteCoupon(code: string): Promise<{ success: boolean; message: string }> {
  return requestJson<{ success: boolean; message: string }>(`/api/coupons/${code}`, {
    method: "DELETE",
  });
}

// Settings API
export async function fetchStoreSettings(): Promise<ApiStoreSettings> {
  return requestJson<ApiStoreSettings>("/api/admin/settings");
}

export async function updateStoreSettings(payload: Partial<ApiStoreSettings>): Promise<ApiStoreSettings> {
  return requestJson<ApiStoreSettings>("/api/admin/settings", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

// Contact Form API
export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}

export async function sendContactMessage(payload: ContactFormData): Promise<{ success: boolean; message: string }> {
  return requestJson<{ success: boolean; message: string }>("/api/contact", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// Newsletter API
export async function subscribeToNewsletter(email: string): Promise<{ success: boolean; message: string; alreadySubscribed?: boolean }> {
  return requestJson<{ success: boolean; message: string; alreadySubscribed?: boolean }>("/api/newsletter/subscribe", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

// Auth Reset Password API
export async function forgotPasswordBackend(email: string): Promise<{ success: boolean; message: string; user?: { email: string; name: string } }> {
  return requestJson<{ success: boolean; message: string; user?: { email: string; name: string } }>("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function resetPasswordBackend(payload: { email: string; newPassword: string }): Promise<{ success: boolean; message: string }> {
  return requestJson<{ success: boolean; message: string }>("/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}



