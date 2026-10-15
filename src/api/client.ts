import type { z } from 'zod';
import { buildQuery, type ODataQuery } from '../odata/query';
import { odataErrorSchema } from './schemas';

export const SERVICE_URL = 'https://services.odata.org/V4/Northwind/Northwind.svc';

export type ODataErrorKind = 'http' | 'not_found' | 'network' | 'invalid_response';

export class ODataError extends Error {
  readonly kind: ODataErrorKind;
  readonly status: number | undefined;

  constructor(kind: ODataErrorKind, message: string, status?: number) {
    super(message);
    this.name = 'ODataError';
    this.kind = kind;
    this.status = status;
  }
}

/** Reads one OData resource and parses it against `schema`. Every failure
 * comes back as an `ODataError`, so screens handle one error type. */
export async function odataGet<S extends z.ZodType>(
  path: string,
  query: ODataQuery,
  schema: S,
  signal?: AbortSignal,
): Promise<z.infer<S>> {
  const qs = buildQuery(query).encoded;
  let response: Response;
  try {
    response = await fetch(`${SERVICE_URL}/${path}${qs ? `?${qs}` : ''}`, {
      headers: { Accept: 'application/json' },
      ...(signal ? { signal } : {}),
    });
  } catch (cause) {
    if (cause instanceof DOMException && cause.name === 'AbortError') throw cause;
    throw new ODataError('network', 'Sem conexão com o serviço OData.');
  }

  const body: unknown = await response.json().catch(() => undefined);
  if (!response.ok) {
    const parsed = odataErrorSchema.safeParse(body);
    const message = parsed.success ? parsed.data.error.message : `HTTP ${response.status}`;
    throw new ODataError(response.status === 404 ? 'not_found' : 'http', message, response.status);
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) throw new ODataError('invalid_response', 'A resposta do serviço não segue o contrato esperado.');
  return parsed.data;
}
