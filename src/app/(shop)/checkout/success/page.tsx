'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';
import { useOrder } from '@/hooks/useOrders';
import { formatPrice, formatDate } from '@/utils/formatters';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const { data, isLoading } = useOrder(orderId || '');

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center space-y-6">
        <Skeleton className="mx-auto h-16 w-16 rounded-full" />
        <Skeleton className="mx-auto h-8 w-64" />
        <Skeleton className="mx-auto h-4 w-48" />
      </div>
    );
  }

  const order = data?.data;

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
      <h1 className="mt-6 text-3xl font-bold text-foreground">Order Confirmed!</h1>
      <p className="mt-2 text-muted-foreground">
        Thank you for your purchase. Your order has been placed successfully.
      </p>

      {order && (
        <div className="mt-8 glass rounded-xl p-6 text-left space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Order ID</p>
              <p className="font-mono text-sm font-medium">{order.id}</p>
            </div>
            <Badge variant={order.status === 'PROCESSING' ? 'success' : 'secondary'}>
              {order.status}
            </Badge>
          </div>
          <hr className="border-border" />
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Date</span>
            <span className="text-sm">{formatDate(order.createdAt)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Items</span>
            <span className="text-sm">{order.items.length} products</span>
          </div>
          <div className="flex items-center justify-between text-base font-bold">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>
      )}

      <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
        <Link href={order ? `/orders/${order.id}` : '/orders'}>
          <Button variant="outline" className="gap-2">
            <Package className="h-4 w-4" /> View Order
          </Button>
        </Link>
        <Link href="/products">
          <Button className="gap-2">
            Continue Shopping <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
