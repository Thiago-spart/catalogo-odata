import { buildQuery, type ODataQuery } from '../odata/query';

/** Shows the exact OData request behind the screen, updated as filters change. */
export function QueryPanel({ path, query }: { path: string; query: ODataQuery }) {
  const { readable } = buildQuery(query);
  return (
    <section aria-label="Requisição OData" className="rounded bg-sunken px-3 py-2.5">
      <h2 className="label">Requisição OData</h2>
      <code className="mt-1 block font-mono text-xs leading-[18px] break-all text-ink">
        GET /{path}
        {readable ? `?${readable}` : ''}
      </code>
    </section>
  );
}
