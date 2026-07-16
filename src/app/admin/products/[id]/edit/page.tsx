'use client';

import * as React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import { productSchema } from '@/lib/validators';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Card, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';

export default function AdminEditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { toast } = useToast();

  const { data: productData, isLoading } = useQuery({
    queryKey: ['admin-product', id],
    queryFn: () => fetch(`/api/products/${id}`).then((r) => r.json()),
    enabled: !!id,
  });

  const { data: catData } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => fetch('/api/admin/categories').then((r) => r.json()),
  });

  const categories = catData?.data || [];
  const product = productData?.data;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(productSchema),
  });

  React.useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        description: product.description,
        price: product.price,
        categoryId: product.categoryId,
        images: product.images || [],
        sku: product.sku,
        stock: product.stock,
        isActive: product.isActive,
      });
    }
  }, [product, reset]);

  const updateMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetch(`/api/admin/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    onSuccess: (data) => {
      if (data.error) {
        toast(data.message, 'error');
      } else {
        toast('Product updated', 'success');
        router.push('/admin/products');
      }
    },
    onError: (err: Error) => toast(err.message, 'error'),
  });

  if (isLoading) {
    return (
      <div className="max-w-2xl space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  if (!product) {
    return <div className="text-center py-12 text-muted-foreground">Product not found</div>;
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Edit Product</h1>
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit((data) => updateMutation.mutate(data as Record<string, unknown>))} className="space-y-4">
            <Input label="Product Name" error={errors.name?.message} {...register('name')} />
            <Textarea label="Description" error={errors.description?.message} {...register('description')} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Price (cents)" type="number" error={errors.price?.message} {...register('price', { valueAsNumber: true })} />
              <Input label="Stock" type="number" error={errors.stock?.message} {...register('stock', { valueAsNumber: true })} />
            </div>
            <Input label="SKU" error={errors.sku?.message} {...register('sku')} />
            <Select
              label="Category"
              options={categories.map((c: { id: string; name: string }) => ({ value: c.id, label: c.name }))}
              placeholder="Select category"
              error={errors.categoryId?.message}
              {...register('categoryId')}
            />
            <Input label="Image URL" placeholder="https://..." {...register('images.0')} />
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
              <Button type="submit" isLoading={updateMutation.isPending}>Update Product</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
