'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { Skeleton } from '@/components/ui/Skeleton';

interface Address {
  id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

const emptyAddress = { name: '', street: '', city: '', state: '', zip: '', country: 'US', phone: '' };

export default function AddressesPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showForm, setShowForm] = React.useState(false);
  const [editId, setEditId] = React.useState<string | null>(null);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState(emptyAddress);

  const { data, isLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => fetch('/api/user/addresses').then((r) => r.json()),
  });

  const saveMutation = useMutation({
    mutationFn: ({ id, body }: { id: string | null; body: Record<string, unknown> }) =>
      fetch(id ? `/api/user/addresses/${id}` : '/api/user/addresses', {
        method: id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }).then((r) => r.json()),
    onSuccess: (res: { error?: string; message?: string }) => {
      if (res.error) return toast(res.message || 'Error', 'error');
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast(editId ? 'Address updated' : 'Address created', 'success');
      setShowForm(false);
      setEditId(null);
      setForm(emptyAddress);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/user/addresses/${id}`, { method: 'DELETE' }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast('Address deleted', 'success');
      setDeleteId(null);
    },
  });

  const addresses: Address[] = data?.data || [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Addresses</h1>
        <Button className="gap-2" onClick={() => { setEditId(null); setForm(emptyAddress); setShowForm(true); }}>
          <Plus className="h-4 w-4" /> Add Address
        </Button>
      </div>

      {addresses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MapPin className="mb-3 h-12 w-12 text-muted-foreground/30" />
            <p className="text-muted-foreground">No addresses saved</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((addr) => (
            <Card key={addr.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{addr.name}</p>
                      {addr.isDefault && <Badge variant="default">Default</Badge>}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{addr.street}</p>
                    <p className="text-sm text-muted-foreground">
                      {addr.city}, {addr.state} {addr.zip}
                    </p>
                    <p className="text-sm text-muted-foreground">{addr.country}</p>
                    {addr.phone && <p className="mt-1 text-sm text-muted-foreground">{addr.phone}</p>}
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                      setEditId(addr.id);
                      setForm({ name: addr.name, street: addr.street, city: addr.city, state: addr.state, zip: addr.zip, country: addr.country, phone: addr.phone });
                      setShowForm(true);
                    }}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(addr.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal open={showForm} onClose={() => { setShowForm(false); setEditId(null); }} title={editId ? 'Edit Address' : 'New Address'}>
        <div className="space-y-4">
          <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Home, Office..." />
          <Input label="Street" value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            <Input label="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="ZIP Code" value={form.zip} onChange={(e) => setForm({ ...form, zip: e.target.value })} />
            <Input label="Country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
          </div>
          <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Optional" />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.name === '__default__' ? false : false}
              onChange={(e) => {
                const body = { ...form, isDefault: e.target.checked };
                saveMutation.mutate({ id: editId, body });
              }}
              className="rounded border-input"
            />
            Set as default
          </label>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => { setShowForm(false); setEditId(null); }}>Cancel</Button>
            <Button
              onClick={() => saveMutation.mutate({ id: editId, body: { ...form, isDefault: false } })}
              isLoading={saveMutation.isPending}
              disabled={!form.name.trim() || !form.street.trim() || !form.city.trim()}
            >
              {editId ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Address" description="Are you sure?">
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="destructive" onClick={() => deleteId && deleteMutation.mutate(deleteId)} isLoading={deleteMutation.isPending}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
