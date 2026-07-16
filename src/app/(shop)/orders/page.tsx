'use client';

import Link from 'next/link';
import { Package, Eye } from 'lucide-react';
import { useOrders } from '@/hooks/useOrders';
import { formatPrice, formatDateTime } from '@/utils/formatters';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';

const statusVariant: Record<string, 'default' | 'success' | 'warning' | 'destructive' | 'secondary'> = {
  PENDING: 'warning',
  PROCESSING: 'default',
  SHIPPED: 'secondary',
  DELIVERED: 'success',
  CANCELLED: 'destructive',
  REFUNDED: 'destructive',
};

export default function OrdersPage() {
  const { data, isLoading } = useOrders();
  const orders = data?.data || [];

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-2xl font-bold text-foreground">Order History</h1>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border p-6 space-y-3">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <Skeleton className="h-3 w-48" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <Package className="mx-auto h-16 w-16 text-muted-foreground/30" />
        <h1 className="mt-4 text-2xl font-bold text-foreground">No orders yet</h1>
        <p className="mt-2 text-muted-foreground">Start shopping to see your orders here.</p>
        <Link href="/products" className="mt-6 inline-block">
          <Button>Browse Products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-2xl font-bold text-foreground">Order History</h1>
      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="rounded-xl border bg-card p-6 transition-colors hover:bg-muted/50"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-medium">{order.id.slice(0, 12)}...</span>
                  <Badge variant={statusVariant[order.status] || 'secondary'}>
                    {order.status}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {formatDateTime(order.createdAt)} &middot; {order.items.length} items
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-bold">{formatPrice(order.total)}</span>
                <Link href={`/orders/${order.id}`}>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Eye className="h-3.5 w-3.5" /> Details
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
