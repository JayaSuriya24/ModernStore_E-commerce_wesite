import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
      <p className="mb-2 text-6xl">🔍</p>
      <h2 className="mb-2 text-2xl font-bold text-foreground">Page Not Found</h2>
      <p className="mb-6 max-w-md text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
      >
        Go Home
      </Link>
    </div>
  );
}
