// A small OData v4 query builder. Pure functions, so the same output feeds the
// request and the "Requisição OData" panel, and every rule is unit-tested.

export type Primitive = string | number | boolean;

export interface Expand {
  property: string;
  select?: readonly string[];
}

export interface ODataQuery {
  select?: readonly string[];
  expand?: readonly Expand[];
  filter?: string | undefined;
  orderby?: readonly string[];
  top?: number;
  skip?: number;
  count?: boolean;
}

/** A value as an OData literal. Strings are quoted and `'` is doubled, so user
 * input can never close the literal and change the filter. */
export function literal(value: Primitive): string {
  if (typeof value === 'string') return `'${value.replaceAll("'", "''")}'`;
  return String(value);
}

export const eq = (field: string, value: Primitive) => `${field} eq ${literal(value)}`;
export const gt = (field: string, value: number) => `${field} gt ${literal(value)}`;

export function containsIgnoreCase(field: string, term: string): string {
  return `contains(tolower(${field}),${literal(term.toLowerCase())})`;
}

/** Joins the parts that are set; returns undefined when none are. */
export function and(...parts: ReadonlyArray<string | undefined | false>): string | undefined {
  const set = parts.filter((p): p is string => Boolean(p));
  if (set.length === 0) return undefined;
  if (set.length === 1) return set[0];
  return set.map((p) => `(${p})`).join(' and ');
}

function renderExpand({ property, select }: Expand): string {
  return select?.length ? `${property}($select=${select.join(',')})` : property;
}

/** Builds the query string in a fixed option order. `readable` is for people;
 * `encoded` is what goes on the wire. */
export function buildQuery(q: ODataQuery): { readable: string; encoded: string } {
  const pairs: Array<[string, string]> = [];
  if (q.select?.length) pairs.push(['$select', q.select.join(',')]);
  if (q.expand?.length) pairs.push(['$expand', q.expand.map(renderExpand).join(',')]);
  if (q.filter) pairs.push(['$filter', q.filter]);
  if (q.orderby?.length) pairs.push(['$orderby', q.orderby.join(',')]);
  if (q.top !== undefined) pairs.push(['$top', String(q.top)]);
  if (q.skip) pairs.push(['$skip', String(q.skip)]);
  if (q.count) pairs.push(['$count', 'true']);
  return {
    readable: pairs.map(([k, v]) => `${k}=${v}`).join('&'),
    encoded: pairs.map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&'),
  };
}
