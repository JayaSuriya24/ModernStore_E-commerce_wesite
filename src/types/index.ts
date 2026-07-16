export type UserRole = 'ADMIN' | 'USER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string | null;
  emailVerified: Date | null;
  createdAt: Date;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  parentId?: string | null;
  children?: Category[];
  _count?: { products: number };
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  images: string[];
  sku: string;
  stock: number;
  categoryId: string;
  category?: { id: string; name: string; slug: string };
  isActive: boolean;
  createdAt: Date;
  reviews?: { id: string; rating: number; comment: string; userId: string; productId: string; createdAt: Date; user?: { id: string; name: string; avatar: string | null } }[];
  _count?: { reviews: number };
  averageRating?: number;
}

export interface Order {
  id: string;
  userId: string;
  user?: User;
  status: OrderStatus;
  total: number;
  shippingAddressId: string;
  shippingAddress?: Address;
  stripeSessionId: string | null;
  items: OrderItem[];
  payment?: Payment;
  createdAt: Date;
}

export type OrderStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED';

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  product?: Product;
  quantity: number;
  price: number;
}

export interface Payment {
  id: string;
  orderId: string;
  stripePaymentId: string | null;
  amount: number;
  status: PaymentStatus;
  method: string | null;
}

export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export interface Review {
  id: string;
  userId: string;
  user?: User;
  productId: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  product?: Product;
  createdAt: Date;
}

export interface CartItem {
  id: string;
  userId: string;
  productId: string;
  product?: Product;
  quantity: number;
  createdAt: Date;
}

export interface Address {
  id: string;
  userId: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

export interface Coupon {
  id: string;
  code: string;
  discount: number;
  type: 'PERCENT' | 'FIXED';
  minOrder: number | null;
  maxUses: number | null;
  usedCount: number;
  expiresAt: Date | null;
  isActive: boolean;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  pagination?: Pagination;
}

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ProductFilters {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
  recentOrders: Order[];
  salesByMonth: { month: string; revenue: number }[];
  topProducts: { product: Product; totalSold: number }[];
}
