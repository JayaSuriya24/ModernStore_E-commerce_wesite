'use client';

import { useQuery } from '@tanstack/react-query';
import { DollarSign, ShoppingCart, Package, Users } from 'lucide-react';
import { formatPrice } from '@/utils/formatters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';

const statusVariant: Record<string, 'default' | 'success' | 'warning' | 'destructive' | 'secondary'> = {
  PENDING: 'warning',
  PROCESSING: 'default',
  SHIPPED: 'secondary',
  DELIVERED: 'success',
  CANCELLED: 'destructive',
  REFUNDED: 'destructive',
};

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => fetch('/api/admin/analytics').then((r) => r.json()),
  });

  const stats = data?.data;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  const kpis = [
    { title: 'Total Revenue', value: formatPrice(stats?.totalRevenue || 0), icon: DollarSign, color: 'text-green-600' },
    { title: 'Total Orders', value: stats?.totalOrders || 0, icon: ShoppingCart, color: 'text-blue-600' },
    { title: 'Total Products', value: stats?.totalProducts || 0, icon: Package, color: 'text-purple-600' },
    { title: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'text-orange-600' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{kpi.title}</p>
                  <p className="text-2xl font-bold">{kpi.value}</p>
                </div>
                <kpi.icon className={`h-8 w-8 ${kpi.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.recentOrders?.map((order: Record<string, unknown> & { id: string; total: number; status: string; createdAt: string; user?: { name: string } }) => (
                <div key={order.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium">{order.user?.name || 'Unknown'}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={statusVariant[order.status] || 'secondary'} className="text-xs">
                      {order.status}
                    </Badge>
                    <span className="font-semibold">{formatPrice(order.total)}</span>
                  </div>
                </div>
              ))}
              {(!stats?.recentOrders || stats.recentOrders.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">No orders yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.topProducts?.map((tp: { product?: { name: string }; totalSold: number }) => (
                <div key={tp.product?.name} className="flex items-center justify-between text-sm">
                  <span className="font-medium">{tp.product?.name}</span>
                  <span className="text-muted-foreground">{tp.totalSold} sold</span>
                </div>
              ))}
              {(!stats?.topProducts || stats.topProducts.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">No sales data yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {stats?.salesByMonth && stats.salesByMonth.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 h-40">
              {stats.salesByMonth.map((s: { month: string; revenue: number }) => {
                const maxRevenue = Math.max(...stats.salesByMonth.map((m: { revenue: number }) => m.revenue));
                const height = maxRevenue > 0 ? (s.revenue / maxRevenue) * 100 : 0;
                return (
                  <div key={s.month} className="flex flex-1 flex-col items-center gap-1">
                    <span className="text-[10px] text-muted-foreground">{formatPrice(s.revenue)}</span>
                    <div
                      className="w-full rounded-t bg-primary/80 transition-all"
                      style={{ height: `${height}%`, minHeight: height > 0 ? '4px' : '0px' }}
                    />
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(s.month + '-01').toLocaleDateString('en', { month: 'short' })}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
