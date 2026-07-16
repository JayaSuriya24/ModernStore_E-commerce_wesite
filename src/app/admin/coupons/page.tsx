'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/components/ui/Toast';
import { Skeleton } from '@/components/ui/Skeleton';

interface Coupon {
  id: string;
  code: string;
  discount: number;
  type: string;
  minOrder: number | null;
  maxUses: number | null;
  usedCount: number;
  isActive: boolean;
}

export default function AdminCouponsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showForm, setShowForm] = React.useState(false);
  const [editId, setEditId] = React.useState<string | null>(null);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState({
    code: '',
    discount: '',
    type: 'PERCENT',
    minOrder: '',
    maxUses: '',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-coupons'],
    queryFn: () => fetch('/api/admin/coupons').then((r) => r.json()),
  });

  const saveMutation = useMutation({
    mutationFn: ({ id, body }: { id: string | null; body: Record<string, unknown> }) =>
      fetch(id ? `/api/admin/coupons/${id}` : '/api/admin/coupons', {
        method: id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }).then((r) => r.json()),
    onSuccess: (res: { error?: string; message?: string }) => {
      if (res.error) return toast(res.message || 'Error', 'error');
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
      toast(editId ? 'Coupon updated' : 'Coupon created', 'success');
      setShowForm(false);
      setEditId(null);
      setForm({ code: '', discount: '', type: 'PERCENT', minOrder: '', maxUses: '' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/admin/coupons/${id}`, { method: 'DELETE' }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
      toast('Coupon deleted', 'success');
      setDeleteId(null);
    },
  });

  const coupons: Coupon[] = data?.data || [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Coupons</h1>
        <Button
          className="gap-2"
          onClick={() => {
            setEditId(null);
            setForm({ code: '', discount: '', type: 'PERCENT', minOrder: '', maxUses: '' });
            setShowForm(true);
          }}
        >
          <Plus className="h-4 w-4" /> Add Coupon
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium">Code</th>
                  <th className="px-4 py-3 text-left font-medium">Type</th>
                  <th className="px-4 py-3 text-left font-medium">Discount</th>
                  <th className="px-4 py-3 text-left font-medium">Used / Limit</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon) => (
                  <tr key={coupon.id} className="border-b last:border-0">
                    <td className="px-4 py-3 font-mono font-medium">{coupon.code}</td>
                    <td className="px-4 py-3">{coupon.type === 'PERCENT' ? '%' : 'Fixed'}</td>
                    <td className="px-4 py-3">{coupon.type === 'PERCENT' ? `${coupon.discount}%` : `$${(coupon.discount / 100).toFixed(2)}`}</td>
                    <td className="px-4 py-3">{coupon.usedCount} / {coupon.maxUses || '∞'}</td>
                    <td className="px-4 py-3">
                      <Badge variant={coupon.isActive ? 'success' : 'destructive'}>
                        {coupon.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                          setEditId(coupon.id);
                          setForm({
                            code: coupon.code,
                            discount: String(coupon.discount),
                            type: coupon.type,
                            minOrder: coupon.minOrder ? String(coupon.minOrder) : '',
                            maxUses: coupon.maxUses ? String(coupon.maxUses) : '',
                          });
                          setShowForm(true);
                        }}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(coupon.id)}>
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

      <Modal open={showForm} onClose={() => { setShowForm(false); setEditId(null); }} title={editId ? 'Edit Coupon' : 'New Coupon'}>
        <div className="space-y-4">
          <Input label="Code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="WELCOME10" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Discount" type="number" value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })} />
            <Select label="Type" options={[{ value: 'PERCENT', label: 'Percent (%)' }, { value: 'FIXED', label: 'Fixed ($)' }]} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Min Order (cents)" type="number" value={form.minOrder} onChange={(e) => setForm({ ...form, minOrder: e.target.value })} />
            <Input label="Max Uses" type="number" value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => { setShowForm(false); setEditId(null); }}>Cancel</Button>
            <Button
              onClick={() => {
                const body = {
                  code: form.code,
                  discount: parseInt(form.discount) || 0,
                  type: form.type,
                  minOrder: form.minOrder ? parseInt(form.minOrder) : undefined,
                  maxUses: form.maxUses ? parseInt(form.maxUses) : undefined,
                  isActive: true,
                };
                saveMutation.mutate({ id: editId, body });
              }}
              isLoading={saveMutation.isPending}
              disabled={!form.code.trim() || !form.discount}
            >
              {editId ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Coupon" description="Are you sure?">
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="destructive" onClick={() => deleteId && deleteMutation.mutate(deleteId)} isLoading={deleteMutation.isPending}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
