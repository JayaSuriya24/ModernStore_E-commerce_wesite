import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { RegisterForm } from '@/components/auth/RegisterForm';

export const metadata = {
  title: 'Create Account',
  description: 'Create a ModernStore account',
};

export default function RegisterPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <ShoppingBag className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold gradient-text">ModernStore</span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Create Account</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Join ModernStore for exclusive deals and fast checkout
          </p>
        </div>
        <div className="glass rounded-xl p-6 shadow-sm">
          <RegisterForm />
        </div>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
