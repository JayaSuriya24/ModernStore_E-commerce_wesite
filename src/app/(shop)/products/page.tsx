import { Metadata } from 'next';
import { ProductListWithFilters } from '@/components/products/ProductListWithFilters';

export const metadata: Metadata = {
  title: 'Shop',
  description: 'Browse our collection of premium products',
};

export default function ProductsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">All Products</h1>
        <p className="mt-2 text-muted-foreground">
          Discover our curated collection of premium products
        </p>
      </div>
      <ProductListWithFilters />
    </div>
  );
}
