'use client';

import Link from 'next/link';
import { formatPrice } from '@/utils/formatters';
import { Button } from '@/components/ui/Button';
import { CouponInput } from '@/components/cart/CouponInput';

interface CartSummaryProps {
  itemCount: number;
  subtotal: number;
  discountAmount: number;
  total: number;
  couponCode: string | null;
  onApplyCoupon: (code: string) => void;
  onRemoveCoupon: () => void;
  couponLoading?: boolean;
  couponError?: string | null;
}

export function CartSummary({
  itemCount,
  subtotal,
  discountAmount,
  total,
  couponCode,
  onApplyCoupon,
  onRemoveCoupon,
  couponLoading,
  couponError,
}: CartSummaryProps) {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Order Summary</h2>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal ({itemCount} items)</span>
          <span className="font-medium">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Shipping</span>
          <span className="font-medium text-green-600">Free</span>
        </div>
        {discountAmount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Discount</span>
            <span className="font-medium">-{formatPrice(discountAmount)}</span>
          </div>
        )}
        <hr className="border-border" />
        <div className="flex justify-between text-base font-bold">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>

      <CouponInput
        onApply={onApplyCoupon}
        onRemove={onRemoveCoupon}
        appliedCode={couponCode}
        isLoading={couponLoading}
        error={couponError}
      />

      <Link href="/checkout">
        <Button className="w-full" size="lg">
          Proceed to Checkout
        </Button>
      </Link>

      <Link href="/products">
        <Button variant="ghost" className="w-full">
          Continue Shopping
        </Button>
      </Link>
    </div>
  );
}
