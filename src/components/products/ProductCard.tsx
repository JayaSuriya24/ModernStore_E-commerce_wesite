'use client';

import Link from 'next/link';
import { ShoppingCart, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import { formatPrice, calculateDiscount } from '@/utils/formatters';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { WishlistButton } from '@/components/wishlist/WishlistButton';
import { useCart } from '@/hooks/useCart';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  className?: string;
  index?: number;
}

export function ProductCard({ product, className, index = 0 }: ProductCardProps) {
  const discount = calculateDiscount(product.price, product.compareAtPrice || 0);
  const rating = product.averageRating || 0;
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock > 0) {
      addToCart.mutate({
        productId: product.id,
        quantity: 1,
        product: {
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: product.price,
          images: product.images,
          stock: product.stock,
        },
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.05,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      whileHover={{ y: -4 }}
      className={cn(
        'group relative overflow-hidden rounded-xl border bg-card shadow-sm',
        className,
      )}
    >
      <Link href={`/products/${product.slug}`}>
        <div className="relative aspect-square overflow-hidden bg-muted">
          <motion.div
            className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10 text-primary/30"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <ShoppingCart className="h-16 w-16" />
          </motion.div>

          {discount > 0 && (
            <Badge variant="destructive" className="absolute left-2 top-2 z-10">
              -{discount}%
            </Badge>
          )}

          <div className="absolute right-2 top-2 z-10 rounded-full bg-background/80 p-2 opacity-0 backdrop-blur-sm transition-all duration-200 group-hover:opacity-100">
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

          <motion.div whileTap={{ scale: 0.92 }} whileHover={{ scale: 1.08 }}>
            <Button
              size="sm"
              variant="outline"
              className="h-8 px-3"
              onClick={handleAddToCart}
              disabled={product.stock === 0 || addToCart.isPending}
            >
              <ShoppingCart className="h-3.5 w-3.5" />
            </Button>
          </motion.div>
        </div>

        {product.stock <= 5 && product.stock > 0 && (
          <p className="mt-2 text-xs text-orange-500">Only {product.stock} left in stock</p>
        )}
        {product.stock === 0 && (
          <p className="mt-2 text-xs text-destructive">Out of stock</p>
        )}
      </div>
    </motion.div>
  );
}
