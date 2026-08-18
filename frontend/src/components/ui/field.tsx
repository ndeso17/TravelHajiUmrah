export type FieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  helperText?: string;
};

export function Field({ label, error, helperText, className, id, ...props }: FieldProps) {
  const inputId = id ?? props.name;

  return (
    <div className={className}>
      {label ? (
        <label htmlFor={inputId} className="mb-1 block text-sm font-semibold text-ink">
          {label}
        </label>
      ) : null}

      <input
        id={inputId}
        {...props}
        className={[
          'w-full rounded-lg border border-ink/15 bg-surface px-3 py-2.5 text-sm text-ink transition-colors',
          'placeholder:text-ink-muted',
          'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40',
          error ? 'border-danger' : '',
          props.disabled ? 'bg-surface-muted opacity-80' : '',
        ].join(' ')}
      />

      {error ? <p className="mt-1 text-sm text-danger">{error}</p> : null}
      {!error && helperText ? <p className="mt-1 text-sm text-ink-muted">{helperText}</p> : null}
    </div>
  );
}