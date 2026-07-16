import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Suspense } from 'react';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { ToastProvider } from '@/components/ui/Toast';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'ModernStore - Premium E-Commerce',
    template: '%s | ModernStore',
  },
  description:
    'Discover premium products with an exceptional shopping experience. Fast shipping, secure payments, and outstanding customer service.',
  keywords: ['e-commerce', 'online store', 'shopping', 'premium products'],
  authors: [{ name: 'ModernStore' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'ModernStore',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-background text-foreground antialiased">
        <ThemeProvider>
          <QueryProvider>
            <ToastProvider>
              <Navbar />
              <main className="flex-1">
                <Suspense>{children}</Suspense>
              </main>
              <Footer />
            </ToastProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
