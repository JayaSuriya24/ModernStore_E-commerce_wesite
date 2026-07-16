'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { useToast } from '@/components/ui/Toast';
import { Skeleton } from '@/components/ui/Skeleton';

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showForm, setShowForm] = React.useState(false);
  const [editId, setEditId] = React.useState<string | null>(null);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => fetch('/api/admin/categories').then((r) => r.json()),
  });

  const createMutation = useMutation({
    mutationFn: (body: { name: string; description: string }) =>
      fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }).then((r) => r.json()),
    onSuccess: (res) => {
      if (res.error) return toast(res.message, 'error');
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      toast(editId ? 'Category updated' : 'Category created', 'success');
      setShowForm(false);
      setEditId(null);
      setName('');
      setDescription('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/admin/categories/${id}`, { method: 'DELETE' }).then((r) => r.json()),
    onSuccess: (res) => {
      if (res.error) return toast(res.message || res.error, 'error');
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      toast('Category deleted', 'success');
      setDeleteId(null);
    },
  });

  const categories = data?.data || [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Categories</h1>
        <Button
          className="gap-2"
          onClick={() => { setEditId(null); setName(''); setDescription(''); setShowForm(true); }}
        >
          <Plus className="h-4 w-4" /> Add Category
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium">Name</th>
                  <th className="px-4 py-3 text-left font-medium">Slug</th>
                  <th className="px-4 py-3 text-left font-medium">Products</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat: { id: string; name: string; slug: string; _count: { products: number } }) => (
                  <tr key={cat.id} className="border-b last:border-0">
                    <td className="px-4 py-3 font-medium">{cat.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{cat.slug}</td>
                    <td className="px-4 py-3">{cat._count.products}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                          setEditId(cat.id);
                          setName(cat.name);
                          setShowForm(true);
                        }}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(cat.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Modal open={showForm} onClose={() => { setShowForm(false); setEditId(null); }} title={editId ? 'Edit Category' : 'New Category'}>
        <div className="space-y-4">
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Category name" />
          <Textarea label="Description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description" />
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => { setShowForm(false); setEditId(null); }}>Cancel</Button>
            <Button
              onClick={() => {
                const body = { name, description };
                if (editId) {
                  fetch(`/api/admin/categories/${editId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body),
                  }).then((r) => r.json()).then((res) => {
                    if (res.error) return toast(res.message, 'error');
                    queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
                    toast('Category updated', 'success');
                    setShowForm(false);
                    setEditId(null);
                  });
                } else {
                  createMutation.mutate(body);
                }
              }}
              isLoading={createMutation.isPending}
              disabled={!name.trim()}
            >
              {editId ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Category" description="Are you sure? This cannot be undone.">
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="destructive" onClick={() => deleteId && deleteMutation.mutate(deleteId)} isLoading={deleteMutation.isPending}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
