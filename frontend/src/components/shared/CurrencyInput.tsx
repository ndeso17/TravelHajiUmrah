import { forwardRef, useState, type ChangeEvent } from 'react';
import { formatRupiah } from '../../lib/formatters';

export type CurrencyInputProps = {
  readonly value?: number;
  readonly onChange?: (value: number) => void;
  readonly name?: string;
  readonly id?: string;
  readonly disabled?: boolean;
  readonly placeholder?: string;
};

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(function CurrencyInput(
  { value = 0, onChange, name, id, disabled, placeholder = 'Rp0' },
  ref,
) {
  const [display, setDisplay] = useState(value ? formatRupiah(value) : '');

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const digits = event.target.value.replace(/\D/g, '');
    const next = digits ? Number(digits) : 0;
    setDisplay(digits ? formatRupiah(next) : '');
    onChange?.(next);
  }

  return (
    <input
      ref={ref}
      id={id}
      name={name}
      disabled={disabled}
      placeholder={placeholder}
      value={display}
      onChange={handleChange}
      inputMode="numeric"
      className="w-full rounded-md border border-surface-muted bg-surface px-3 py-2 font-mono text-sm text-ink outline-none focus:border-primary"
    />
  );
});
