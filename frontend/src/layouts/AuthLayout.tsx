import type { ReactNode } from 'react';

export function AuthLayout({ children }: { readonly children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-xl bg-surface p-8 shadow">
        <div className="mb-6 text-center">
          <p className="font-heading text-xl font-bold text-primary">HajiUmroh</p>
          <p className="mt-1 text-sm text-ink-muted">Masuk ke portal travel</p>
        </div>
        {children}
      </div>
    </div>
  );
}
