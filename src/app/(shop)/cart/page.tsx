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

  if (isLoading && isLoggedIn) {
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

      {!isLoggedIn && (
        <div className="mb-6 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-foreground">
          <p>
            You&apos;re shopping as a guest.{' '}
            <Link href="/login?callbackUrl=/cart" className="font-medium text-primary hover:underline">
              Sign in
            </Link>{' '}
            to sync your cart across devices and proceed to checkout.
          </p>
        </div>
      )}

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
                    onError: (err) => toast(err.message, 'error'),
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
          {isLoggedIn ? (
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
          ) : (
            <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Order Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal ({itemCount} items)</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium text-green-600">Free</span>
                </div>
                <hr className="border-border" />
                <div className="flex justify-between text-base font-bold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
              <Link href="/login?callbackUrl=/cart">
                <Button className="w-full" size="lg">
                  Sign In to Checkout
                </Button>
              </Link>
              <Link href="/products">
                <Button variant="ghost" className="w-full">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
