'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatPrice, formatDateTime } from '@/utils/formatters';
import { Card, CardContent } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/components/ui/Toast';
import { Skeleton } from '@/components/ui/Skeleton';

const statusOptions = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'SHIPPED', label: 'Shipped' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'REFUNDED', label: 'Refunded' },
];

interface AdminOrder {
  id: string;
  total: number;
  status: string;
  createdAt: string;
  user: { name: string; email: string };
  items: { quantity: number }[];
  payment: { status: string; method: string } | null;
}

export default function AdminOrdersPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => fetch('/api/admin/orders').then((r) => r.json()),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      fetch(`/api/admin/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      }).then((r) => r.json()),
    onSuccess: (res: { error?: string; message?: string }) => {
      if (res.error) return toast(res.message || 'Error', 'error');
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast('Order updated', 'success');
    },
  });

  const orders: AdminOrder[] = data?.data || [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Orders</h1>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium">Order ID</th>
                  <th className="px-4 py-3 text-left font-medium">Customer</th>
                  <th className="px-4 py-3 text-left font-medium">Items</th>
                  <th className="px-4 py-3 text-left font-medium">Total</th>
                  <th className="px-4 py-3 text-left font-medium">Date</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b last:border-0">
                    <td className="px-4 py-3 font-mono text-xs">{order.id.slice(0, 12)}...</td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{order.user?.name}</p>
                      <p className="text-xs text-muted-foreground">{order.user?.email}</p>
                    </td>
                    <td className="px-4 py-3">{order.items.length}</td>
                    <td className="px-4 py-3 font-semibold">{formatPrice(order.total)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDateTime(order.createdAt)}</td>
                    <td className="px-4 py-3">
                      <Select
                        options={statusOptions}
                        value={order.status}
                        onChange={(e) =>
                          updateStatus.mutate({ id: order.id, status: e.target.value })
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
