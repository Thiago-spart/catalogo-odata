import { useEffect, useId, useRef, useState } from 'react';
import { sortKeys, type ListSearch, type SortKey } from '../api/products';
import type { Category } from '../api/schemas';

const sortLabels: Record<SortKey, string> = {
  name: 'Nome A–Z',
  'price-asc': 'Menor preço',
  'price-desc': 'Maior preço',
};

interface Props {
  search: ListSearch;
  categories: Category[] | undefined;
  onChange: (patch: Partial<ListSearch>) => void;
}

export function Filters({ search, categories, onChange }: Props) {
  const ids = useId();
  const [term, setTerm] = useState(search.q);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  // Keep the field in step when the URL changes from elsewhere ("Limpar filtros", back button).
  const [lastQ, setLastQ] = useState(search.q);
  if (search.q !== lastQ) {
    setLastQ(search.q);
    setTerm(search.q);
  }

  const onTerm = (value: string) => {
    setTerm(value);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => onChange({ q: value.trim() }), 300);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <label htmlFor={`${ids}-q`} className="sr-only">
          Buscar produto
        </label>
        <svg aria-hidden="true" viewBox="0 0 24 24" className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-muted" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          id={`${ids}-q`}
          type="search"
          inputMode="search"
          autoComplete="off"
          placeholder="Buscar produto…"
          value={term}
          onChange={(e) => onTerm(e.target.value)}
          className="min-h-11 w-full rounded border border-line-strong bg-raised pr-3 pl-9 text-[15px] placeholder:text-ink-muted"
        />
      </div>

      <div role="group" aria-label="Categoria" className="chip-scroll -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0">
        <Chip selected={search.category === undefined} onClick={() => onChange({ category: undefined })}>
          Todas
        </Chip>
        {categories === undefined
          ? [72, 96, 88, 104].map((w) => <span key={w} aria-hidden="true" style={{ width: w }} className="h-9 shrink-0 animate-pulse rounded bg-sunken motion-reduce:animate-none" />)
          : null}
        {categories?.map((c) => (
          <Chip key={c.CategoryID} selected={search.category === c.CategoryID} onClick={() => onChange({ category: c.CategoryID })}>
            {c.CategoryName}
          </Chip>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        <label className="flex items-center gap-2 text-sm">
          <span className="text-ink-muted">Ordenar</span>
          <span className="relative">
          <select
            value={search.sort}
            onChange={(e) => onChange({ sort: e.target.value as SortKey })}
            className="min-h-10 appearance-none rounded border border-line-strong bg-raised pr-8 pl-3 text-sm"
          >
            {sortKeys.map((k) => (
              <option key={k} value={k}>
                {sortLabels[k]}
              </option>
            ))}
          </select>
          <svg aria-hidden="true" viewBox="0 0 24 24" className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-ink-muted" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m6 9 6 6 6-6" />
          </svg>
          </span>
        </label>
        <label className="flex min-h-10 cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            role="switch"
            checked={search.stock}
            onChange={(e) => onChange({ stock: e.target.checked })}
            className="peer sr-only"
          />
          <span
            aria-hidden="true"
            className="relative h-5 w-9 rounded-full bg-line-strong transition-colors peer-checked:bg-mangrove peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-mango after:absolute after:top-0.5 after:left-0.5 after:size-4 after:rounded-full after:bg-raised after:transition-transform peer-checked:after:translate-x-4"
          />
          Só em estoque
        </label>
      </div>
    </div>
  );
}

function Chip({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`min-h-9 shrink-0 rounded border px-3 font-mono text-[13px] whitespace-nowrap transition-colors ${
        selected ? 'border-mangrove bg-mangrove-soft font-medium text-mangrove' : 'border-line-strong bg-raised text-ink hover:bg-ground'
      }`}
    >
      {children}
    </button>
  );
}
