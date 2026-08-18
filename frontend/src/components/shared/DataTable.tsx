import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import { useState } from 'react';
import type { PaginationMeta } from '../../api/types';
import { EmptyState } from './EmptyState';
import { LoadingSkeleton } from './LoadingSkeleton';

export type DataTableProps<T> = {
  readonly columns: ColumnDef<T, unknown>[];
  readonly data: readonly T[];
  readonly meta?: PaginationMeta;
  readonly isLoading?: boolean;
  readonly onPageChange?: (page: number) => void;
  readonly onSort?: (sort: SortingState) => void;
  readonly emptyTitle?: string;
};

export function DataTable<T>({
  columns,
  data,
  meta,
  isLoading = false,
  onPageChange,
  onSort,
  emptyTitle = 'Tidak ada data',
}: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const table = useReactTable({
    data: data as T[],
    columns,
    state: { sorting },
    onSortingChange: (updater) => {
      const next = typeof updater === 'function' ? updater(sorting) : updater;
      setSorting(next);
      onSort?.(next);
    },
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    manualPagination: true,
  });

  if (isLoading) return <LoadingSkeleton variant="table" rows={6} />;
  if (data.length === 0) return <EmptyState title={emptyTitle} />;

  return (
    <div className="overflow-hidden rounded-lg border border-surface-muted bg-surface">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-muted text-ink-muted">
            {table.getHeaderGroups().map((group) => (
              <tr key={group.id}>
                {group.headers.map((header, index) => (
                  <th
                    key={header.id}
                    className={`px-4 py-3 font-semibold ${index === 0 ? 'sticky left-0 z-10 bg-surface-muted' : ''}`}
                  >
                    {header.isPlaceholder ? null : (
                      <button
                        type="button"
                        className="cursor-pointer text-left"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </button>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-t border-surface-muted hover:bg-background">
                {row.getVisibleCells().map((cell, index) => (
                  <td
                    key={cell.id}
                    className={`px-4 py-3 ${index === 0 ? 'sticky left-0 z-10 bg-surface font-medium' : ''}`}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {meta && onPageChange ? (
        <div className="flex items-center justify-between border-t border-surface-muted px-4 py-3 text-xs text-ink-muted">
          <span>
            Halaman {meta.page} dari {meta.totalPages || 1} · {meta.total} data
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              className="cursor-pointer rounded border px-2 py-1 disabled:opacity-40"
              disabled={meta.page <= 1}
              onClick={() => onPageChange(meta.page - 1)}
            >
              Prev
            </button>
            <button
              type="button"
              className="cursor-pointer rounded border px-2 py-1 disabled:opacity-40"
              disabled={meta.page >= meta.totalPages}
              onClick={() => onPageChange(meta.page + 1)}
            >
              Next
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
