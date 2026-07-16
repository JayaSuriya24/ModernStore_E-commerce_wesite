'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import { productSchema } from '@/lib/validators';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Card, CardContent } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';

export default function AdminNewProductPage() {
  const router = useRouter();
  const { toast } = useToast();

  const { data: catData } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => fetch('/api/admin/categories').then((r) => r.json()),
  });

  const categories = catData?.data || [];

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      categoryId: '',
      images: [],
      sku: '',
      stock: 0,
      isActive: true,
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    onSuccess: (data) => {
      if (data.error) {
        toast(data.message, 'error');
      } else {
        toast('Product created', 'success');
        router.push('/admin/products');
      }
    },
    onError: (err: Error) => toast(err.message, 'error'),
  });

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Add Product</h1>
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit((data) => createMutation.mutate(data as Record<string, unknown>))} className="space-y-4">
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
              <Button type="submit" isLoading={createMutation.isPending}>Create Product</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
