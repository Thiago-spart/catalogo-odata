import { useQuery } from '@tanstack/react-query';
import { getRouteApi } from '@tanstack/react-router';
import { useEffect } from 'react';
import { ODataError } from '../api/client';
import { defaultListSearch, PAGE_SIZE, productListQuery, type ListSearch } from '../api/products';
import { categoriesOptions, productListOptions } from '../api/queries';
import { Button, ButtonLink } from '../ui/Button';
import { Filters } from '../ui/Filters';
import { plural } from '../ui/format';
import { ProductCard } from '../ui/ProductCard';
import { QueryPanel } from '../ui/QueryPanel';
import { Notice, SkeletonList } from '../ui/States';

const route = getRouteApi('/');

export function ListPage() {
  const search = route.useSearch();
  const navigate = route.useNavigate();
  const categories = useQuery(categoriesOptions());
  const list = useQuery(productListOptions(search));

  useEffect(() => {
    document.title = 'Produtos · Catálogo OData';
  }, []);

  // Any filter change goes back to page 1; replace keeps typing out of the history.
  const update = (patch: Partial<ListSearch>) =>
    void navigate({ search: (prev) => ({ ...prev, page: 1, ...patch }), replace: true });

  const total = list.data?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasFilters = search.q !== '' || search.category !== undefined || search.stock;

  return (
    <div className="mx-auto grid max-w-7xl gap-x-8 gap-y-4 px-4 pt-4 pb-10 grid-cols-[minmax(0,1fr)] lg:grid-cols-[300px_minmax(0,1fr)] lg:px-12 lg:pt-8">
      <aside className="flex min-w-0 flex-col gap-4 lg:sticky lg:top-6 lg:self-start">
        <Filters search={search} categories={categories.data} onChange={update} />
        <div className="hidden lg:block">
          <QueryPanel path="Products" query={productListQuery(search)} />
        </div>
      </aside>

      <main id="conteudo" className="flex min-w-0 flex-col gap-4">
        <div className="flex items-baseline justify-between gap-3">
          <h1 className="font-display text-[22px] leading-7 font-semibold tracking-[-0.01em] lg:text-[32px] lg:leading-[38px]">Produtos</h1>
          <p aria-live="polite" className="font-mono text-xs text-ink-muted tabular-nums lg:text-[13px]">
            {list.data ? `${plural(total, 'produto', 'produtos')} · página ${Math.min(search.page, pages)} de ${pages}` : ' '}
          </p>
        </div>

        {list.isPending ? (
          <SkeletonList />
        ) : list.isError ? (
          <Notice
            tone="error"
            title="Não foi possível carregar os produtos"
            action={
              <Button variant="primary" onClick={() => void list.refetch()}>
                Tentar de novo
              </Button>
            }
          >
            {list.error instanceof ODataError ? list.error.message : 'Erro inesperado.'} Seus filtros foram mantidos.
          </Notice>
        ) : list.data.products.length === 0 ? (
          <Notice
            title={search.q ? `Nenhum produto para “${search.q}”` : 'Nenhum produto com esses filtros'}
            action={
              hasFilters ? (
                <ButtonLink to="/" search={defaultListSearch} replace>
                  Limpar filtros
                </ButtonLink>
              ) : undefined
            }
          >
            Tente outro termo ou remova um filtro.
          </Notice>
        ) : (
          <ul aria-busy={list.isPlaceholderData} className={`grid gap-2 transition-opacity sm:grid-cols-2 sm:gap-4 xl:grid-cols-3 ${list.isPlaceholderData ? 'opacity-60' : ''}`}>
            {list.data.products.map((p) => (
              <ProductCard key={p.ProductID} product={p} search={search} />
            ))}
          </ul>
        )}

        {list.data && total > PAGE_SIZE ? (
          <nav aria-label="Paginação" className="flex items-center gap-2">
            <ButtonLink to="/" search={{ ...search, page: search.page - 1 }} disabled={search.page <= 1} aria-disabled={search.page <= 1}>
              Anterior
            </ButtonLink>
            <span className="flex-1 text-center font-mono text-[13px] text-ink-muted tabular-nums lg:flex-none">
              {Math.min(search.page, pages)} / {pages}
            </span>
            <ButtonLink to="/" search={{ ...search, page: search.page + 1 }} variant="primary" disabled={search.page >= pages} aria-disabled={search.page >= pages}>
              Próxima
            </ButtonLink>
          </nav>
        ) : null}

        <div className="lg:hidden">
          <QueryPanel path="Products" query={productListQuery(search)} />
        </div>
      </main>
    </div>
  );
}
