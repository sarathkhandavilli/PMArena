interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (row: T) => React.ReactNode;
  width?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  rowKey: keyof T;
}

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`rounded animate-pulse ${className}`}
      style={{ background: 'rgba(255,255,255,0.06)' }}
    />
  );
}

export default function DataTable<T extends Record<string, unknown>>({
  columns, data, loading, emptyMessage = 'No records found.', rowKey,
}: DataTableProps<T>) {
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: '1px solid rgba(255,255,255,0.08)', background: '#0F1B2D' }}
    >
      <table className="w-full text-sm">
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className="text-left px-4 py-3 font-medium"
                style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', width: col.width }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  {columns.map((col) => (
                    <td key={String(col.key)} className="px-4 py-3">
                      <Skeleton className="h-4 w-full" />
                    </td>
                  ))}
                </tr>
              ))
            : data.length === 0
            ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center" style={{ color: 'rgba(255,255,255,0.25)' }}>
                  {emptyMessage}
                </td>
              </tr>
            )
            : data.map((row) => (
              <tr
                key={String(row[rowKey])}
                className="transition-colors"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                {columns.map((col) => (
                  <td key={String(col.key)} className="px-4 py-3 text-white/80">
                    {col.render ? col.render(row) : String(row[col.key as keyof T] ?? '—')}
                  </td>
                ))}
              </tr>
            ))
          }
        </tbody>
      </table>
    </div>
  );
}
