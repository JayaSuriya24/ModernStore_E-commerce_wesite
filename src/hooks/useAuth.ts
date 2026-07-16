'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import type { User } from '@/types';
import type { LoginInput, RegisterInput } from '@/lib/validators';

interface AuthResponse {
  data?: User;
  message: string;
  error?: string;
}

async function fetcher<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Something went wrong');
  return json;
}

export function useSession() {
  return useQuery({
    queryKey: ['session'],
    queryFn: () => fetcher<{ data: User }>('/api/auth/session'),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: LoginInput) =>
      fetcher<AuthResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: (data) => {
      queryClient.setQueryData(['session'], data);
      queryClient.invalidateQueries({ queryKey: ['session'] });
      router.push('/');
      router.refresh();
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: RegisterInput) =>
      fetcher<AuthResponse>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: (data) => {
      queryClient.setQueryData(['session'], data);
      queryClient.invalidateQueries({ queryKey: ['session'] });
      router.push('/');
      router.refresh();
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () => fetcher<AuthResponse>('/api/auth/logout', { method: 'POST' }),
    onSuccess: () => {
      queryClient.clear();
      router.push('/');
      router.refresh();
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (data: { email: string }) =>
      fetcher<AuthResponse>('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  });
}

export function useResetPassword() {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: { password: string; confirmPassword: string; token: string }) =>
      fetcher<AuthResponse>('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      router.push('/login');
    },
  });
}

export function useRequireAuth() {
  const { data, isLoading } = useSession();
  const router = useRouter();
  const user = data?.data;

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [isLoading, user, router]);

  return { user: user || null, isLoading };
}
