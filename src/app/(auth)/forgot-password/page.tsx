import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';

export const metadata = {
  title: 'Forgot Password',
  description: 'Reset your ModernStore password',
};

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <ShoppingBag className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold gradient-text">ModernStore</span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Forgot Password</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            We&apos;ll help you get back into your account
          </p>
        </div>
        <div className="glass rounded-xl p-6 shadow-sm">
          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  );
}
