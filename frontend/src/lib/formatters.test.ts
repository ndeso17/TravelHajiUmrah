import { describe, expect, it } from 'vitest';
import { formatRupiah, formatTanggal, formatTanggalWaktu } from './formatters';

describe('formatRupiah', () => {
  it('formats integer without decimal using id-ID currency', () => {
    const result = formatRupiah(1_000_000);
    expect(result.replace(/\s/g, '')).toBe('Rp1.000.000');
  });

  it('drops fractional rupiah', () => {
    const result = formatRupiah(1500.75);
    expect(result.replace(/\s/g, '')).toBe('Rp1.501');
  });

  it('formats zero', () => {
    expect(formatRupiah(0).replace(/\s/g, '')).toBe('Rp0');
  });
});

describe('formatTanggal', () => {
  it('formats ISO date in Indonesian long month', () => {
    expect(formatTanggal('2026-08-17T00:00:00.000Z')).toMatch(/17 Agustus 2026/);
  });
});

describe('formatTanggalWaktu', () => {
  it('includes clock time after the date', () => {
    const result = formatTanggalWaktu('2026-08-17T08:30:00.000Z');
    expect(result).toMatch(/17 Agustus 2026/);
    expect(result).toMatch(/\d{2}[.:]\d{2}/);
  });
});
