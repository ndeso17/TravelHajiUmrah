const IDR = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
});

const DATE = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

const DATE_TIME = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'UTC',
});

export function formatRupiah(n: number): string {
  return IDR.format(Math.round(n));
}

export function formatTanggal(iso: string): string {
  return DATE.format(new Date(iso));
}

export function formatTanggalWaktu(iso: string): string {
  return DATE_TIME.format(new Date(iso));
}
