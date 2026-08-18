import { forwardRef } from 'react';

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, className, id, children, ...props }, ref) => {
    const inputId = id ?? props.name;

    return (
      <div className={className}>
        {label ? (
          <label htmlFor={inputId} className="mb-1 block text-sm font-semibold text-ink">
            {label}
          </label>
        ) : null}

        <select
          id={inputId}
          ref={ref}
          {...props}
          className={[
            'w-full rounded-lg border border-ink/15 bg-surface px-3 py-2.5 text-sm text-ink',
            'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40',
            error ? 'border-danger' : '',
            props.disabled ? 'bg-surface-muted opacity-80' : '',
          ].join(' ')}
        >
          {children}
        </select>

        {error ? <p className="mt-1 text-sm text-danger">{error}</p> : null}
      </div>
    );
  },
);