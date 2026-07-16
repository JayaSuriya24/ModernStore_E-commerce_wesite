'use client';

import * as React from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/lib/validators';
import { useForgotPassword } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function ForgotPasswordForm() {
  const [sent, setSent] = React.useState(false);
  const forgotPassword = useForgotPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  if (sent) {
    return (
      <div className="text-center space-y-4">
        <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
        <h3 className="text-lg font-semibold text-foreground">Check your email</h3>
        <p className="text-sm text-muted-foreground">
          We&apos;ve sent a password reset link to your email address. Please check your inbox.
        </p>
        <Link href="/login">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Sign In
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit((data) => {
      forgotPassword.mutate(data, { onSuccess: () => setSent(true) });
    })} className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Enter your email address and we&apos;ll send you a link to reset your password.
      </p>
      <Input
        label="Email"
        type="email"
        placeholder="you@example.com"
        icon={<Mail className="h-4 w-4" />}
        error={errors.email?.message}
        {...register('email')}
      />
      {forgotPassword.isError && (
        <p className="text-sm text-destructive">{forgotPassword.error?.message}</p>
      )}
      <Button type="submit" className="w-full" isLoading={forgotPassword.isPending}>
        Send Reset Link
      </Button>
      <Link href="/login" className="block text-center text-sm text-primary hover:underline">
        Back to Sign In
      </Link>
    </form>
  );
}
