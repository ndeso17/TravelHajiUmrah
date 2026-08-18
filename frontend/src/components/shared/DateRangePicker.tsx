export type DateRangePickerProps = {
  readonly from?: string;
  readonly to?: string;
  readonly onChange: (range: { from: string; to: string }) => void;
};

export function DateRangePicker({ from = '', to = '', onChange }: DateRangePickerProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <label className="text-ink-muted">
        Dari
        <input
          type="date"
          value={from}
          onChange={(event) => onChange({ from: event.target.value, to })}
          className="ml-2 rounded-md border border-surface-muted bg-surface px-2 py-1.5"
        />
      </label>
      <label className="text-ink-muted">
        Sampai
        <input
          type="date"
          value={to}
          onChange={(event) => onChange({ from, to: event.target.value })}
          className="ml-2 rounded-md border border-surface-muted bg-surface px-2 py-1.5"
        />
      </label>
    </div>
  );
}
