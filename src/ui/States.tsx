import type { ReactNode } from 'react';

export function SkeletonList({ count = 4 }: { count?: number }) {
  return (
    <ul aria-hidden="true" className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3 sm:gap-4">
      {Array.from({ length: count }, (_, i) => (
        <li key={i} className="flex flex-col gap-2.5 rounded-lg border border-line bg-raised p-4">
          <span className="h-2.5 w-20 animate-pulse rounded bg-sunken motion-reduce:animate-none" />
          <span className="h-4 w-3/5 animate-pulse rounded bg-sunken motion-reduce:animate-none" />
          <span className="h-2.5 w-28 animate-pulse rounded bg-sunken motion-reduce:animate-none" />
        </li>
      ))}
    </ul>
  );
}

export function Notice({ title, children, action, tone = 'neutral' }: { title: string; children: ReactNode; action?: ReactNode; tone?: 'neutral' | 'error' }) {
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={`flex flex-col items-start gap-2 rounded-lg border bg-raised px-4 py-5 ${tone === 'error' ? 'border-poor' : 'border-line'}`}>
      <h2 className="font-display text-lg leading-6 font-semibold">{title}</h2>
      <p className="text-sm text-ink-muted">{children}</p>
      {action ? <div className="mt-1">{action}</div> : null}
    </div>
  );
}
