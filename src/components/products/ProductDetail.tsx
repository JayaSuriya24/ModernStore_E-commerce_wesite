'use client';

import * as React from 'react';
import { Star, ShoppingCart, Minus, Plus, Truck, Shield, RotateCcw, ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/utils/cn';
import { formatPrice, calculateDiscount } from '@/utils/formatters';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ReviewForm } from '@/components/reviews/ReviewForm';
import { ReviewList } from '@/components/reviews/ReviewList';
import { RatingBreakdown } from '@/components/reviews/RatingBreakdown';
import { WishlistButton } from '@/components/wishlist/WishlistButton';
import { RelatedProducts } from '@/components/products/RelatedProducts';
import type { Product, Review } from '@/types';

interface ProductDetailProps {
  product: Product;
}

export function ProductDetail({ product }: ProductDetailProps) {
  const [quantity, setQuantity] = React.useState(1);
  const [selectedImage, setSelectedImage] = React.useState(0);
  const router = useRouter();
  const discount = calculateDiscount(product.price, product.compareAtPrice || 0);
  const rating = product.averageRating || 0;
  const reviews = (product as Product & { reviews?: Review[] }).reviews || [];

  return (
    <div className="space-y-8">
      <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-1">
        <ChevronLeft className="h-4 w-4" /> Back
      </Button>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-xl border bg-muted">
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10 text-primary/20">
              <ShoppingCart className="h-32 w-32" />
            </div>
            {discount > 0 && (
              <Badge variant="destructive" className="absolute left-3 top-3">
                -{discount}%
              </Badge>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={cn(
                    'h-16 w-16 rounded-lg border-2 overflow-hidden bg-muted transition-colors',
                    selectedImage === i ? 'border-primary' : 'border-transparent',
                  )}
                >
                  <div className="flex h-full w-full items-center justify-center bg-primary/5 text-primary/30">
                    <ShoppingCart className="h-6 w-6" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <Link
              href={`/products?category=${product.category?.slug}`}
              className="text-sm font-medium text-primary hover:underline"
            >
              {product.category?.name}
            </Link>
            <h1 className="mt-2 text-3xl font-bold text-foreground">{product.name}</h1>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      'h-4 w-4',
                      i < Math.round(rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'fill-muted text-muted',
                    )}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {rating.toFixed(1)} ({reviews.length} reviews)
              </span>
            </div>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-foreground">{formatPrice(product.price)}</span>
            {product.compareAtPrice && (
              <span className="text-lg text-muted-foreground line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
            {discount > 0 && (
              <Badge variant="success">Save {discount}%</Badge>
            )}
          </div>

          <p className="text-muted-foreground leading-relaxed">{product.description}</p>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">SKU:</span>
              <span className="text-muted-foreground">{product.sku}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">Availability:</span>
              {product.stock > 0 ? (
                <span className="text-green-600">
                  In Stock ({product.stock} available)
                </span>
              ) : (
                <span className="text-destructive">Out of Stock</span>
              )}
            </div>
          </div>

          {product.stock > 0 && (
            <div className="flex items-center gap-4">
              <div className="flex items-center rounded-lg border">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 text-muted-foreground hover:text-foreground"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="p-2 text-muted-foreground hover:text-foreground"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <Button size="lg" className="flex-1 gap-2">
                <ShoppingCart className="h-5 w-5" /> Add to Cart
              </Button>
              <WishlistButton productId={product.id} size="lg" />
            </div>
          )}

          <div className="grid grid-cols-3 gap-4 rounded-xl border p-4">
            <div className="flex flex-col items-center gap-2 text-center">
              <Truck className="h-5 w-5 text-primary" />
              <span className="text-xs text-muted-foreground">Free Shipping</span>
            </div>
            <div className="flex flex-col items-center gap-2 text-center">
              <Shield className="h-5 w-5 text-primary" />
              <span className="text-xs text-muted-foreground">Secure Payment</span>
            </div>
            <div className="flex flex-col items-center gap-2 text-center">
              <RotateCcw className="h-5 w-5 text-primary" />
              <span className="text-xs text-muted-foreground">30-Day Returns</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">Customer Reviews</h2>
        <RatingBreakdown reviews={reviews} />
        <ReviewForm productId={product.id} />
        <ReviewList reviews={reviews} />
      </div>

      <RelatedProducts categoryId={product.categoryId} currentProductId={product.id} />
    </div>
  );
}
