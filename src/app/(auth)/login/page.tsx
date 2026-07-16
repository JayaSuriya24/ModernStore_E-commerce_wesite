import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { LoginForm } from '@/components/auth/LoginForm';

export const metadata = {
  title: 'Sign In',
  description: 'Sign in to your ModernStore account',
};

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <ShoppingBag className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold gradient-text">ModernStore</span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Welcome Back</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to your account to continue
          </p>
        </div>
        <div className="glass rounded-xl p-6 shadow-sm">
          <LoginForm />
        </div>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-medium text-primary hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
