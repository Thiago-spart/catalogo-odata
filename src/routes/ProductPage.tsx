import { useQuery } from '@tanstack/react-query';
import { getRouteApi, Link } from '@tanstack/react-router';
import { useEffect } from 'react';
import { ODataError } from '../api/client';
import { productDetailQuery } from '../api/products';
import { productDetailOptions } from '../api/queries';
import { Button, ButtonLink } from '../ui/Button';
import { formatPrice } from '../ui/format';
import { QueryPanel } from '../ui/QueryPanel';
import { Notice } from '../ui/States';
import { StockTag } from '../ui/StockTag';

const route = getRouteApi('/produtos/$id');

export function ProductPage() {
  const { id } = route.useParams();
  const search = route.useSearch();
  const product = useQuery(productDetailOptions(id));
  const name = product.data?.ProductName;

  useEffect(() => {
    document.title = `${name ?? 'Produto'} · Catálogo OData`;
  }, [name]);

  return (
    <main id="conteudo" className="mx-auto flex max-w-2xl flex-col gap-4 px-4 pt-3 pb-10 lg:pt-8">
      <Link to="/" search={search} className="inline-flex min-h-11 items-center self-start text-[15px] font-semibold text-mangrove hover:underline">
        ← Voltar aos produtos
      </Link>

      {product.isPending ? (
        <div aria-hidden="true" className="flex flex-col gap-3">
          <span className="h-3 w-24 animate-pulse rounded bg-sunken motion-reduce:animate-none" />
          <span className="h-8 w-2/3 animate-pulse rounded bg-sunken motion-reduce:animate-none" />
          <span className="h-40 animate-pulse rounded-lg bg-sunken motion-reduce:animate-none" />
        </div>
      ) : product.isError ? (
        product.error instanceof ODataError && product.error.kind === 'not_found' ? (
          <Notice title="Produto não encontrado" action={<ButtonLink to="/" search={search}>Ver todos os produtos</ButtonLink>}>
            O produto {id} não existe no catálogo.
          </Notice>
        ) : (
          <Notice tone="error" title="Não foi possível carregar o produto" action={<Button variant="primary" onClick={() => void product.refetch()}>Tentar de novo</Button>}>
            {product.error instanceof ODataError ? product.error.message : 'Erro inesperado.'}
          </Notice>
        )
      ) : (
        <article className="flex flex-col gap-4">
          <header className="flex flex-col gap-1.5">
            <p className="label">{product.data.Category?.CategoryName ?? 'Sem categoria'}</p>
            <h1 className="font-display text-[32px] leading-[38px] font-semibold tracking-[-0.01em]">{product.data.ProductName}</h1>
            <p className="flex flex-wrap items-center gap-3">
              <span className="font-mono text-2xl font-medium tracking-[-0.02em] tabular-nums">{formatPrice(product.data.UnitPrice)}</span>
              <StockTag stock={product.data.UnitsInStock} discontinued={product.data.Discontinued} />
            </p>
          </header>

          <dl className="divide-y divide-line rounded-lg border border-line bg-raised">
            {[
              ['Quantidade por unidade', product.data.QuantityPerUnit ?? '—'],
              ['Em estoque', String(product.data.UnitsInStock ?? 0)],
              ['Em pedido', String(product.data.UnitsOnOrder ?? 0)],
              ['Nível de reposição', String(product.data.ReorderLevel ?? 0)],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                <dt className="text-ink-muted">{k}</dt>
                <dd className="text-right font-mono font-medium tabular-nums">{v}</dd>
              </div>
            ))}
          </dl>

          {product.data.Supplier ? (
            <section aria-labelledby="fornecedor" className="flex flex-col gap-1.5 rounded-lg border border-line bg-raised px-4 py-3.5">
              <h2 id="fornecedor" className="label">Fornecedor</h2>
              <p className="font-display text-lg leading-6 font-semibold">{product.data.Supplier.CompanyName}</p>
              <p className="text-sm text-ink-muted">{[product.data.Supplier.City, product.data.Supplier.Country].filter(Boolean).join(', ')}</p>
              {product.data.Supplier.Phone ? (
                <a href={`tel:${product.data.Supplier.Phone.replace(/[^\d+]/g, '')}`} className="self-start font-mono text-sm text-mangrove hover:underline">
                  {product.data.Supplier.Phone}
                </a>
              ) : null}
            </section>
          ) : null}
        </article>
      )}

      <QueryPanel path={`Products(${id})`} query={productDetailQuery()} />
    </main>
  );
}
