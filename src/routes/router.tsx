import type { QueryClient } from '@tanstack/react-query';
import { createRootRouteWithContext, createRoute, createRouter, Link, Outlet, stripSearchParams, type RouterHistory } from '@tanstack/react-router';
import { z } from 'zod';
import { defaultListSearch, listSearchSchema } from '../api/products';
import { Monogram } from '../ui/Monogram';
import { ListPage } from './ListPage';
import { ProductPage } from './ProductPage';

const REPO_URL = 'https://github.com/Thiago-spart/catalogo-odata';

function Layout() {
  return (
    <>
      <a href="#conteudo" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-10 focus:rounded focus:bg-raised focus:px-3 focus:py-2">
        Pular para o conteúdo
      </a>
      <header className="border-b border-line bg-raised">
        <div className="mx-auto flex max-w-7xl items-center gap-2.5 px-4 py-3.5 lg:px-12">
          <Link to="/" search={defaultListSearch} className="flex items-center gap-2.5">
            <Monogram />
            <span className="flex flex-col">
              <span className="font-display text-[19px] leading-6 font-semibold">Catálogo OData</span>
              <span className="font-mono text-[11px] leading-4 text-ink-muted">Northwind · OData v4</span>
            </span>
          </Link>
        </div>
      </header>
      <Outlet />
      <footer className="mx-auto max-w-7xl px-4 pb-8 font-mono text-xs text-ink-muted lg:px-12">
        Dados do serviço público <a className="underline hover:text-mangrove" href="https://services.odata.org/V4/Northwind/Northwind.svc">Northwind OData v4</a> ·{' '}
        <a className="underline hover:text-mangrove" href={REPO_URL}>código no GitHub</a> · Thiago Souza
      </footer>
    </>
  );
}

const rootRoute = createRootRouteWithContext<{ queryClient: QueryClient }>()({ component: Layout });

const listRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  validateSearch: listSearchSchema,
  // Defaults stay out of the URL, so links read /?q=chef, not /?q=chef&sort=name&stock=false&page=1.
  search: { middlewares: [stripSearchParams(defaultListSearch)] },
  component: ListPage,
});

// The detail keeps the list filters in its URL, so "Voltar" restores them.
const productRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/produtos/$id',
  validateSearch: listSearchSchema,
  search: { middlewares: [stripSearchParams(defaultListSearch)] },
  params: {
    parse: (p) => ({ id: z.coerce.number().int().positive().parse(p.id) }),
    stringify: (p) => ({ id: String(p.id) }),
  },
  component: ProductPage,
});

const routeTree = rootRoute.addChildren([listRoute, productRoute]);

export function createAppRouter(queryClient: QueryClient, history?: RouterHistory) {
  return createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreload: 'intent',
    ...(history ? { history } : {}),
  });
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createAppRouter>;
  }
}
