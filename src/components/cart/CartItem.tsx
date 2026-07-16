'use client';

import Link from 'next/link';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { formatPrice } from '@/utils/formatters';
import { Button } from '@/components/ui/Button';
import type { CartStoreItem } from '@/store/cart';

interface CartItemProps {
  item: CartStoreItem;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
  isUpdating?: boolean;
}

export function CartItem({ item, onUpdateQuantity, onRemove, isUpdating }: CartItemProps) {
  const { product } = item;
  const lineTotal = product.price * item.quantity;

  return (
    <div className="flex gap-4 rounded-xl border p-4 transition-colors hover:bg-muted/50">
      <Link
        href={`/products/${product.slug}`}
        className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted"
      >
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10 text-primary/30">
          <span className="text-xs">IMG</span>
        </div>
      </Link>

      <div className="flex flex-1 flex-col justify-between">
        <div>
          <Link
            href={`/products/${product.slug}`}
            className="text-sm font-semibold text-foreground hover:text-primary line-clamp-1"
          >
            {product.name}
          </Link>
          <p className="text-sm text-muted-foreground">{formatPrice(product.price)} each</p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
              disabled={isUpdating}
              aria-label="Decrease quantity"
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
              disabled={isUpdating || item.quantity >= product.stock}
              aria-label="Increase quantity"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold">{formatPrice(lineTotal)}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={() => onRemove(item.id)}
              disabled={isUpdating}
              aria-label="Remove item"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
