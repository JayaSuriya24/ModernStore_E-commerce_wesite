'use client';

import * as React from 'react';
import Link from 'next/link';
import { useOrder } from '@/hooks/useOrders';
import { formatPrice, formatDateTime } from '@/utils/formatters';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { ChevronLeft, Printer } from 'lucide-react';
import { useRouter } from 'next/navigation';

const statusVariant: Record<string, 'default' | 'success' | 'warning' | 'destructive' | 'secondary'> = {
  PENDING: 'warning',
  PROCESSING: 'default',
  SHIPPED: 'secondary',
  DELIVERED: 'success',
  CANCELLED: 'destructive',
  REFUNDED: 'destructive',
};

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const { data, isLoading } = useOrder(id);
  const router = useRouter();
  const order = data?.data;

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-foreground">Order not found</h1>
        <Link href="/orders" className="mt-4 inline-block">
          <Button>Back to Orders</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-1">
            <ChevronLeft className="h-4 w-4" /> Back
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Order Details</h1>
        </div>
        <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-1">
          <Printer className="h-4 w-4" /> Print
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-mono text-sm font-medium">{order.id}</p>
                <p className="text-sm text-muted-foreground">{formatDateTime(order.createdAt)}</p>
              </div>
              <Badge variant={statusVariant[order.status] || 'secondary'} className="text-sm">
                {order.status}
              </Badge>
            </div>

            <div className="space-y-3">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 rounded-lg border p-3"
                >
                  <div className="h-14 w-14 shrink-0 rounded-lg bg-muted flex items-center justify-center">
                    <span className="text-xs text-muted-foreground">IMG</span>
                  </div>
                  <div className="flex-1">
                    <Link
                      href={`/products/${item.product?.slug || ''}`}
                      className="text-sm font-medium hover:text-primary"
                    >
                      {item.product?.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      Qty: {item.quantity} &times; {formatPrice(item.price)}
                    </p>
                  </div>
                  <span className="text-sm font-semibold">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {order.shippingAddress && (
            <div className="rounded-xl border bg-card p-6">
              <h3 className="text-sm font-semibold text-foreground mb-3">Shipping Address</h3>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>{order.shippingAddress.name}</p>
                <p>{order.shippingAddress.street}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                  {order.shippingAddress.zip}
                </p>
                <p>{order.shippingAddress.country}</p>
                {order.shippingAddress.phone && <p>{order.shippingAddress.phone}</p>}
              </div>
            </div>
          )}
        </div>

        <div>
          <div className="sticky top-24 rounded-xl border bg-card p-6 space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Payment Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(order.total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="text-green-600">Free</span>
              </div>
              <hr className="border-border" />
              <div className="flex justify-between text-base font-bold">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
            {order.payment && (
              <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
                <p>Method: {order.payment.method || 'N/A'}</p>
                <p>Status: {order.payment.status}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
