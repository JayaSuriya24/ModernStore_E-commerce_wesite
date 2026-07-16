'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { registerSchema, type RegisterInput } from '@/lib/validators';
import { useRegister } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function RegisterForm() {
  const [showPassword, setShowPassword] = React.useState(false);
  const registerUser = useRegister();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  return (
    <form onSubmit={handleSubmit((data) => registerUser.mutate(data))} className="space-y-4">
      <Input
        label="Full Name"
        placeholder="John Doe"
        icon={<User className="h-4 w-4" />}
        error={errors.name?.message}
        {...register('name')}
      />
      <Input
        label="Email"
        type="email"
        placeholder="you@example.com"
        icon={<Mail className="h-4 w-4" />}
        error={errors.email?.message}
        {...register('email')}
      />
      <div className="relative">
        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Create a password"
          icon={<Lock className="h-4 w-4" />}
          error={errors.password?.message}
          {...register('password')}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-[38px] text-muted-foreground hover:text-foreground"
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      <Input
        label="Confirm Password"
        type="password"
        placeholder="Confirm your password"
        icon={<Lock className="h-4 w-4" />}
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />
      {registerUser.isError && (
        <p className="text-sm text-destructive">{registerUser.error?.message}</p>
      )}
      <Button type="submit" className="w-full" isLoading={registerUser.isPending}>
        Create Account
      </Button>
    </form>
  );
}
