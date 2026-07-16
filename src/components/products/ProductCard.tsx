'use client';

import Link from 'next/link';
import { ShoppingCart, Star } from 'lucide-react';
import { cn } from '@/utils/cn';
import { formatPrice, calculateDiscount } from '@/utils/formatters';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { WishlistButton } from '@/components/wishlist/WishlistButton';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const discount = calculateDiscount(product.price, product.compareAtPrice || 0);
  const rating = product.averageRating || 0;

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-xl border bg-card shadow-sm transition-all duration-300 hover:shadow-lg',
        className,
      )}
    >
      <Link href={`/products/${product.slug}`}>
        <div className="relative aspect-square overflow-hidden bg-muted">
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10 text-primary/30">
            <ShoppingCart className="h-16 w-16 transition-transform group-hover:scale-110" />
          </div>
          {discount > 0 && (
            <Badge
              variant="destructive"
              className="absolute left-2 top-2"
            >
              -{discount}%
            </Badge>
          )}
          <div className="absolute right-2 top-2 rounded-full bg-background/80 p-2 opacity-0 transition-all hover:bg-background group-hover:opacity-100">
            <WishlistButton productId={product.id} />
          </div>
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/products/${product.slug}`}>
          <div className="mb-1 text-xs font-medium text-muted-foreground">
            {product.category?.name}
          </div>
          <h3 className="line-clamp-2 text-sm font-semibold text-foreground transition-colors hover:text-primary">
            {product.name}
          </h3>
        </Link>

        <div className="mt-2 flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                'h-3 w-3',
                i < Math.round(rating)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'fill-muted text-muted',
              )}
            />
          ))}
          <span className="ml-1 text-xs text-muted-foreground">
            ({product._count?.reviews || 0})
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-foreground">
              {formatPrice(product.price)}
            </span>
            {product.compareAtPrice && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>
          <Button size="sm" variant="outline" className="h-8 px-3">
            <ShoppingCart className="h-3.5 w-3.5" />
          </Button>
        </div>

        {product.stock <= 5 && product.stock > 0 && (
          <p className="mt-2 text-xs text-orange-500">Only {product.stock} left in stock</p>
        )}
        {product.stock === 0 && (
          <p className="mt-2 text-xs text-destructive">Out of stock</p>
        )}
      </div>
    </div>
  );
}
