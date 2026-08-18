export function ComingSoon({ title }: { readonly title: string }) {
  return (
    <div className="rounded-lg bg-surface p-8 shadow-sm">
      <h1 className="font-heading text-xl font-bold text-ink">{title}</h1>
      <p className="mt-2 text-sm text-ink-muted">Halaman ini akan dilengkapi di fase berikutnya.</p>
    </div>
  );
}
