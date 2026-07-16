'use client';

import { useCart } from '@/hooks/useCart';
import { CheckoutForm } from '@/components/checkout/CheckoutForm';
import { EmptyCart } from '@/components/cart/EmptyCart';

export default function CheckoutPage() {
  const { items } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <EmptyCart />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-2xl font-bold text-foreground">Checkout</h1>
      <CheckoutForm />
    </div>
  );
}
