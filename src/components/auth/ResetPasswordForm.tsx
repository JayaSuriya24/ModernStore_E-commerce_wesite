'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, ArrowLeft, CheckCircle } from 'lucide-react';
import { resetPasswordSchema, type ResetPasswordInput } from '@/lib/validators';
import { useResetPassword } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [success, setSuccess] = React.useState(false);
  const resetPassword = useResetPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token: token || '' },
  });

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Invalid Link</h3>
        <p className="text-sm text-muted-foreground">
          This password reset link is invalid or has expired.
        </p>
        <Link href="/forgot-password">
          <Button variant="outline">Request a new link</Button>
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center space-y-4">
        <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
        <h3 className="text-lg font-semibold text-foreground">Password Reset!</h3>
        <p className="text-sm text-muted-foreground">
          Your password has been reset successfully. You can now sign in with your new password.
        </p>
        <Link href="/login">
          <Button className="gap-2">
            Sign In <ArrowLeft className="h-4 w-4 rotate-180" />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit((data) => {
      resetPassword.mutate(data, { onSuccess: () => setSuccess(true) });
    })} className="space-y-4">
      <Input
        label="New Password"
        type="password"
        placeholder="Enter new password"
        icon={<Lock className="h-4 w-4" />}
        error={errors.password?.message}
        {...register('password')}
      />
      <Input
        label="Confirm Password"
        type="password"
        placeholder="Confirm new password"
        icon={<Lock className="h-4 w-4" />}
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />
      <input type="hidden" {...register('token')} />
      {resetPassword.isError && (
        <p className="text-sm text-destructive">{resetPassword.error?.message}</p>
      )}
      <Button type="submit" className="w-full" isLoading={resetPassword.isPending}>
        Reset Password
      </Button>
    </form>
  );
}
