'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatDate, getInitials } from '@/utils/formatters';

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [editing, setEditing] = React.useState(false);
  const [name, setName] = React.useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => fetch('/api/user/profile').then((r) => r.json()),
  });

  const updateMutation = useMutation({
    mutationFn: (body: { name: string }) =>
      fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }).then((r) => r.json()),
    onSuccess: (res: { error?: string; message?: string; data?: { name: string } }) => {
      if (res.error) return toast(res.message || 'Error', 'error');
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setEditing(false);
      toast('Profile updated', 'success');
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  const profile = data?.data;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">My Profile</h1>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
              {profile?.avatar ? (
                <img src={profile.avatar} alt={profile.name} className="h-20 w-20 rounded-full object-cover" />
              ) : (
                getInitials(profile?.name || 'U')
              )}
            </div>
            <div className="flex-1 space-y-4">
              {editing ? (
                <div className="space-y-3">
                  <Input
                    label="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => updateMutation.mutate({ name })}
                      isLoading={updateMutation.isPending}
                      disabled={!name.trim()}
                    >
                      Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditing(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold">{profile?.name}</h2>
                    <Badge variant={profile?.role === 'ADMIN' ? 'default' : 'secondary'}>
                      {profile?.role}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{profile?.email}</p>
                  <p className="text-sm text-muted-foreground">
                    Member since {formatDate(profile?.createdAt)}
                  </p>
                </div>
              )}
              {!editing && (
                <Button size="sm" variant="outline" onClick={() => { setName(profile?.name || ''); setEditing(true); }}>
                  Edit Profile
                </Button>
              )}
            </div>
          </div>

          {profile?._count && (
            <div className="mt-6 grid grid-cols-3 gap-4 border-t pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{profile._count.orders}</p>
                <p className="text-sm text-muted-foreground">Orders</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{profile._count.reviews}</p>
                <p className="text-sm text-muted-foreground">Reviews</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{profile._count.wishlist}</p>
                <p className="text-sm text-muted-foreground">Wishlist</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
