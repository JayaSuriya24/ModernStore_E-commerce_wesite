'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useProducts } from '@/hooks/useProducts';
import { ProductGrid } from '@/components/products/ProductGrid';
import { SearchAutocomplete } from '@/components/search/SearchAutocomplete';
import { Pagination } from '@/components/ui/Pagination';

function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const q = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const filters = {
    search: q || undefined,
    page,
    limit: 12,
    sort: 'relevance',
  };

  const { data, isLoading } = useProducts(filters);
  const products = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <SearchAutocomplete defaultValue={q} size="large" placeholder="Search products, categories..." />
        {q && (
          <p className="text-sm text-muted-foreground">
            {pagination?.total || 0} result{(pagination?.total || 0) !== 1 ? 's' : ''} for &ldquo;{q}&rdquo;
          </p>
        )}
      </div>

      <ProductGrid products={products} isLoading={isLoading} />

      {pagination && pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={(p) => {
            const params = new URLSearchParams(searchParams.toString());
            params.set('page', String(p));
            router.push(`/search?${params.toString()}`);
          }}
        />
      )}

      {!q && !isLoading && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-lg text-muted-foreground">Start typing to search products</p>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-2xl font-bold text-foreground">Search</h1>
      <Suspense
        fallback={
          <div className="space-y-6">
            <div className="h-12 animate-pulse rounded-lg bg-muted" />
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <div className="aspect-square animate-pulse rounded-xl bg-muted" />
                  <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
                  <div className="h-5 w-full animate-pulse rounded bg-muted" />
                </div>
              ))}
            </div>
          </div>
        }
      >
        <SearchResults />
      </Suspense>
    </div>
  );
}
