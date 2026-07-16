import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  try {
    await requireAdmin();

    const [totalRevenue, totalOrders, totalProducts, totalUsers, recentOrders, salesByMonth] =
      await Promise.all([
        prisma.payment.aggregate({
          where: { status: 'COMPLETED' },
          _sum: { amount: true },
        }),
        prisma.order.count(),
        prisma.product.count({ where: { isActive: true } }),
        prisma.user.count(),
        prisma.order.findMany({
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { name: true, email: true } },
            items: { select: { quantity: true } },
          },
        }),
        prisma.$queryRawUnsafe<{ month: string; revenue: number }[]>(`
          SELECT
            TO_CHAR("createdAt", 'YYYY-MM') as month,
            SUM(total)::int as revenue
          FROM "orders"
          WHERE "createdAt" >= NOW() - INTERVAL '12 months'
            AND status != 'CANCELLED'
          GROUP BY TO_CHAR("createdAt", 'YYYY-MM')
          ORDER BY month ASC
        `),
      ]);

    const topProducts = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    });

    const topProductDetails = await Promise.all(
      topProducts.map(async (tp) => {
        const product = await prisma.product.findUnique({
          where: { id: tp.productId },
          select: { id: true, name: true, slug: true, price: true },
        });
        return { product, totalSold: tp._sum.quantity || 0 };
      }),
    );

    return NextResponse.json({
      data: {
        totalRevenue: totalRevenue._sum.amount || 0,
        totalOrders,
        totalProducts,
        totalUsers,
        recentOrders,
        salesByMonth: salesByMonth.map((s) => ({ month: s.month, revenue: s.revenue })),
        topProducts: topProductDetails,
      },
    });
  } catch (error) {
    if (error instanceof Error && (error.message === 'Unauthorized' || error.message === 'Forbidden')) {
      return NextResponse.json(
        { error: error.message === 'Forbidden' ? 'Forbidden' : 'Unauthorized', message: 'Admin access required' },
        { status: error.message === 'Forbidden' ? 403 : 401 },
      );
    }
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Server error', message: 'Failed to fetch analytics' },
      { status: 500 },
    );
  }
}
