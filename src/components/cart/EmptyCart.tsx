import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <ShoppingBag className="h-20 w-20 text-muted-foreground/30 mb-4" />
      <h2 className="text-xl font-bold text-foreground">Your cart is empty</h2>
      <p className="mt-2 text-muted-foreground">
        Looks like you haven&apos;t added anything to your cart yet.
      </p>
      <Link href="/products" className="mt-6">
        <Button size="lg">Start Shopping</Button>
      </Link>
    </div>
  );
}
