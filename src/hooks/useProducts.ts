'use client';

import { useQuery } from '@tanstack/react-query';
import type { Product, Category, Review, Pagination } from '@/types';

interface ProductsResponse {
  data: Product[];
  pagination: Pagination;
}

interface ProductResponse {
  data: Product;
}

interface CategoriesResponse {
  data: Category[];
}

interface ReviewsResponse {
  data: Review[];
}

async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}

interface ProductFilters {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  sort?: string;
  page?: number;
  limit?: number;
}

export function useProducts(filters: ProductFilters = {}) {
  const params = new URLSearchParams();
  if (filters.search) params.set('search', filters.search);
  if (filters.category) params.set('category', filters.category);
  if (filters.minPrice) params.set('minPrice', String(filters.minPrice));
  if (filters.maxPrice) params.set('maxPrice', String(filters.maxPrice));
  if (filters.rating) params.set('rating', String(filters.rating));
  if (filters.sort) params.set('sort', filters.sort);
  if (filters.page) params.set('page', String(filters.page));
  if (filters.limit) params.set('limit', String(filters.limit));

  const queryString = params.toString();
  const url = `/api/products${queryString ? `?${queryString}` : ''}`;

  return useQuery<ProductsResponse>({
    queryKey: ['products', filters],
    queryFn: () => fetcher(url),
  });
}

export function useProduct(id: string) {
  return useQuery<ProductResponse>({
    queryKey: ['product', id],
    queryFn: () => fetcher(`/api/products/${id}`),
    enabled: !!id,
  });
}

export function useCategories() {
  return useQuery<CategoriesResponse>({
    queryKey: ['categories'],
    queryFn: () => fetcher('/api/categories'),
    staleTime: 10 * 60 * 1000,
  });
}

export function useReviews(productId: string) {
  return useQuery<ReviewsResponse>({
    queryKey: ['reviews', productId],
    queryFn: () => fetcher(`/api/reviews?productId=${productId}`),
    enabled: !!productId,
  });
}
