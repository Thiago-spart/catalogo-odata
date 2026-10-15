import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createMemoryHistory, RouterProvider } from '@tanstack/react-router';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SERVICE_URL } from '../api/client';
import { http, HttpResponse, server } from '../test/server';
import { createAppRouter } from './router';

function renderApp(url = '/') {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const router = createAppRouter(queryClient, createMemoryHistory({ initialEntries: [url] }));
  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
  return router;
}

describe('product list', () => {
  it('shows products with the total count and the OData request', async () => {
    renderApp();
    expect(await screen.findByText('Chai')).toBeInTheDocument();
    expect(screen.getByText('23 produtos · página 1 de 3')).toBeInTheDocument();
    expect(screen.getByText('Descontinuado')).toBeInTheDocument();
    expect(screen.getAllByRole('region', { name: 'Requisição OData' })[0]).toHaveTextContent('$top=10');
  });

  it('writes a category filter to the URL and to the request', async () => {
    const user = userEvent.setup();
    const router = renderApp('/?page=2');
    const group = await screen.findByRole('group', { name: 'Categoria' });
    await user.click(await within(group).findByRole('button', { name: 'Condiments' }));
    expect(router.state.location.search).toEqual({ category: 2 });
    expect(screen.getAllByRole('region', { name: 'Requisição OData' })[0]).toHaveTextContent('$filter=CategoryID eq 2');
  });

  it('restores filters from the URL', async () => {
    renderApp('/?q=%22chef%22&stock=true');
    expect(await screen.findByRole('searchbox', { name: 'Buscar produto' })).toHaveValue('chef');
    expect(screen.getByRole('switch', { name: 'Só em estoque' })).toBeChecked();
  });

  it('offers to clear filters when nothing matches', async () => {
    server.use(http.get(`${SERVICE_URL}/Products`, () => HttpResponse.json({ '@odata.count': 0, value: [] })));
    const user = userEvent.setup();
    const router = renderApp('/?q=%22xyz%22');
    expect(await screen.findByText('Nenhum produto para “xyz”')).toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: 'Limpar filtros' }));
    expect(router.state.location.search).toEqual({});
  });

  it('shows the error and retries', async () => {
    let calls = 0;
    server.use(
      http.get(`${SERVICE_URL}/Products`, () => {
        calls += 1;
        return calls === 1
          ? HttpResponse.json({ error: { code: '', message: 'Serviço indisponível.' } }, { status: 503 })
          : HttpResponse.json({ '@odata.count': 1, value: [] });
      }),
    );
    const user = userEvent.setup();
    renderApp();
    expect(await screen.findByRole('alert')).toHaveTextContent('Serviço indisponível.');
    await user.click(screen.getByRole('button', { name: 'Tentar de novo' }));
    expect(await screen.findByText(/Nenhum produto/)).toBeInTheDocument();
  });

  it('opens the detail and goes back with the filters kept', async () => {
    const user = userEvent.setup();
    const router = renderApp('/?category=1');
    await user.click(await screen.findByRole('link', { name: /Chai/ }));
    expect(await screen.findByRole('heading', { name: 'Chai', level: 1 })).toBeInTheDocument();
    expect(screen.getByText('Exotic Liquids')).toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: '← Voltar aos produtos' }));
    expect(router.state.location.pathname).toBe('/');
    expect(router.state.location.search).toMatchObject({ category: 1 });
  });
});
