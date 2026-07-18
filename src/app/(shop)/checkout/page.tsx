'use client';

import Link from 'next/link';
import { useCart } from '@/hooks/useCart';
import { useSession } from '@/hooks/useAuth';
import { CheckoutForm } from '@/components/checkout/CheckoutForm';
import { EmptyCart } from '@/components/cart/EmptyCart';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';

export default function CheckoutPage() {
  const { items } = useCart();
  const { data: session, isLoading: sessionLoading } = useSession();
  const isLoggedIn = !!session?.data;

  if (sessionLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="mb-8 h-8 w-48" />
        <div className="grid gap-8 lg:grid-cols-5">
          <Skeleton className="lg:col-span-3 h-96 rounded-xl" />
          <Skeleton className="lg:col-span-2 h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 text-center">
        <h1 className="text-2xl font-bold text-foreground">Checkout</h1>
        <p className="mt-4 text-muted-foreground">
          Please sign in to complete your purchase.
        </p>
        <Link href="/login?callbackUrl=/checkout" className="mt-6 inline-block">
          <Button size="lg">Sign In to Checkout</Button>
        </Link>
      </div>
    );
  }

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
