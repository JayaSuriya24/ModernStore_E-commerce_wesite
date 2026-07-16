import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { ProductGrid } from '@/components/products/ProductGrid';
import { Pagination } from '@/components/ui/Pagination';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await prisma.category.findUnique({ where: { slug } });

  if (!category) return { title: 'Category Not Found' };

  return {
    title: category.name,
    description: category.description || `Shop ${category.name} at ModernStore`,
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;
  const page = parseInt(pageParam || '1', 10);
  const limit = 12;

  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) notFound();

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where: { categoryId: category.id, isActive: true },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        reviews: { select: { rating: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.count({
      where: { categoryId: category.id, isActive: true },
    }),
  ]);

  const productsWithRating = products.map((product) => {
    const avg =
      product.reviews.length > 0
        ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
        : 0;
    const { reviews: _reviews, ...rest } = product;
    return { ...rest, averageRating: avg, _count: { reviews: _reviews.length } };
  });

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">{category.name}</h1>
        {category.description && (
          <p className="mt-2 text-muted-foreground">{category.description}</p>
        )}
        <p className="mt-1 text-sm text-muted-foreground">{total} products</p>
      </div>
      <ProductGrid products={productsWithRating} />
      {totalPages > 1 && (
        <div className="mt-8">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={() => {}}
          />
        </div>
      )}
    </div>
  );
}
