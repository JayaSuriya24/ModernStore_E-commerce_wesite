'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock } from 'lucide-react';
import { loginSchema, type LoginInput } from '@/lib/validators';
import { useLogin } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function LoginForm() {
  const login = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  return (
    <form onSubmit={handleSubmit((data) => login.mutate(data))} className="space-y-4">
      <Input
        label="Email"
        type="email"
        placeholder="you@example.com"
        icon={<Mail className="h-4 w-4" />}
        error={errors.email?.message}
        {...register('email')}
      />
      <Input
        label="Password"
        type="password"
        placeholder="Enter your password"
        icon={<Lock className="h-4 w-4" />}
        error={errors.password?.message}
        {...register('password')}
      />
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" className="rounded border-input" />
          <span className="text-muted-foreground">Remember me</span>
        </label>
        <Link href="/forgot-password" className="text-sm text-primary hover:underline">
          Forgot password?
        </Link>
      </div>
      {login.isError && (
        <p className="text-sm text-destructive">{login.error?.message}</p>
      )}
      <Button type="submit" className="w-full" isLoading={login.isPending}>
        Sign In
      </Button>
    </form>
  );
}
