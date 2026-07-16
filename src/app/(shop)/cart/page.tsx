'use client';

import * as React from 'react';
import { useCart } from '@/hooks/useCart';
import { useSession } from '@/hooks/useAuth';
import { CartItem } from '@/components/cart/CartItem';
import { CartSummary } from '@/components/cart/CartSummary';
import { EmptyCart } from '@/components/cart/EmptyCart';
import { Skeleton } from '@/components/ui/Skeleton';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

export default function CartPage() {
  const { toast } = useToast();
  const { data: session } = useSession();
  const isLoggedIn = !!session?.data;

  const {
    items,
    subtotal,
    total,
    discountAmount,
    itemCount,
    couponCode,
    isLoading,
    updateQuantity,
    removeItem,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [couponError, setCouponError] = React.useState<string | null>(null);

  if (!isLoggedIn) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 text-center">
        <h1 className="text-2xl font-bold text-foreground">Shopping Cart</h1>
        <p className="mt-4 text-muted-foreground">Please sign in to view your cart</p>
        <Link href="/login?callbackUrl=/cart" className="mt-6 inline-block">
          <Button>Sign In</Button>
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-2xl font-bold text-foreground">Shopping Cart</h1>
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-4 rounded-xl border p-4">
                <Skeleton className="h-20 w-20 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-1/3" />
                  <Skeleton className="h-8 w-24" />
                </div>
              </div>
            ))}
          </div>
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-2xl font-bold text-foreground">Shopping Cart</h1>
        <EmptyCart />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-2xl font-bold text-foreground">
        Shopping Cart ({itemCount} {itemCount === 1 ? 'item' : 'items'})
      </h1>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => (
            <CartItem
              key={item.id}
              item={item}
              onUpdateQuantity={(itemId, quantity) =>
                updateQuantity.mutate(
                  { itemId, quantity },
                  {
                    onError: (err) =>
                      toast(err.message, 'error'),
                  },
                )
              }
              onRemove={(itemId) =>
                removeItem.mutate(itemId, {
                  onSuccess: () => toast('Item removed from cart', 'success'),
                  onError: (err) => toast(err.message, 'error'),
                })
              }
              isUpdating={updateQuantity.isPending || removeItem.isPending}
            />
          ))}
        </div>

        <div>
          <CartSummary
            itemCount={itemCount}
            subtotal={subtotal}
            discountAmount={discountAmount}
            total={total}
            couponCode={couponCode}
            onApplyCoupon={(code) => {
              setCouponError(null);
              applyCoupon.mutate(
                { code, subtotal },
                {
                  onError: (err) => setCouponError(err.message),
                  onSuccess: () => toast('Coupon applied!', 'success'),
                },
              );
            }}
            onRemoveCoupon={() => {
              removeCoupon();
              toast('Coupon removed', 'info');
            }}
            couponLoading={applyCoupon.isPending}
            couponError={couponError}
          />
        </div>
      </div>
    </div>
  );
}
