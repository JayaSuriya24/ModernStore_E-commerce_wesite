'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { SlidersHorizontal, X, Star } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { useCategories } from '@/hooks/useProducts';

const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'name', label: 'Name: A-Z' },
];

const priceRanges = [
  { value: '', label: 'All Prices' },
  { value: '0-2500', label: 'Under $25' },
  { value: '2500-5000', label: '$25 - $50' },
  { value: '5000-10000', label: '$50 - $100' },
  { value: '10000-25000', label: '$100 - $250' },
  { value: '25000-', label: '$250+' },
];

interface ProductFiltersProps {
  totalProducts?: number;
}

export function ProductFilters({ totalProducts = 0 }: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: categoriesData } = useCategories();

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || 'newest';
  const priceRange = searchParams.get('price') || '';
  const rating = searchParams.get('rating') || '';

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      if (key !== 'page') params.delete('page');
      router.push(`/products?${params.toString()}`);
    },
    [router, searchParams],
  );

  const clearFilters = useCallback(() => {
    router.push('/products');
  }, [router]);

  const hasActiveFilters = search || category || priceRange || rating;

  const ratingOptions = [
    { value: '', label: 'All Ratings' },
    { value: '5', label: '5 Stars' },
    { value: '4', label: '4+ Stars' },
    { value: '3', label: '3+ Stars' },
    { value: '2', label: '2+ Stars' },
    { value: '1', label: '1+ Stars' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          <span className="text-sm font-medium">Filters</span>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 text-xs">
              Clear all
            </Button>
          )}
        </div>
        <span className="text-sm text-muted-foreground">{totalProducts} products</span>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="w-full sm:w-48">
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => updateFilter('search', e.target.value)}
          />
        </div>

        <div className="w-full sm:w-44">
          <Select
            options={[
              { value: '', label: 'All Categories' },
              ...(categoriesData?.data?.map((cat) => ({
                value: cat.slug,
                label: cat.name,
              })) || []),
            ]}
            value={category}
            onChange={(e) => updateFilter('category', e.target.value)}
            placeholder="Category"
          />
        </div>

        <div className="w-full sm:w-44">
          <Select
            options={priceRanges}
            value={priceRange}
            onChange={(e) => {
              const params = new URLSearchParams(searchParams.toString());
              if (e.target.value) {
                params.set('price', e.target.value);
                const [min, max] = e.target.value.split('-');
                if (min) params.set('minPrice', min);
                if (max) params.set('maxPrice', max);
              } else {
                params.delete('price');
                params.delete('minPrice');
                params.delete('maxPrice');
              }
              router.push(`/products?${params.toString()}`);
            }}
          />
        </div>

        <div className="w-full sm:w-44">
          <Select
            options={sortOptions}
            value={sort}
            onChange={(e) => updateFilter('sort', e.target.value)}
          />
        </div>

        <div className="w-full sm:w-44">
          <Select
            options={ratingOptions}
            value={rating}
            onChange={(e) => updateFilter('rating', e.target.value)}
          />
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {search && (
            <Badge variant="secondary" className="gap-1">
              Search: {search}
              <button onClick={() => updateFilter('search', '')}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {category && (
            <Badge variant="secondary" className="gap-1">
              Category: {category}
              <button onClick={() => updateFilter('category', '')}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {priceRange && (
            <Badge variant="secondary" className="gap-1">
              Price: {priceRanges.find((p) => p.value === priceRange)?.label}
              <button onClick={() => updateFilter('price', '')}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {rating && (
            <Badge variant="secondary" className="gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              {rating}+ Stars
              <button onClick={() => updateFilter('rating', '')}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
