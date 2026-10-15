import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ODataError } from './api/client';
import { createAppRouter } from './routes/router';
import './styles.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      // A missing product or a broken contract will not fix itself on retry.
      retry: (count, error) => !(error instanceof ODataError && (error.kind === 'not_found' || error.kind === 'invalid_response')) && count < 2,
    },
  },
});

const router = createAppRouter(queryClient);

const root = document.getElementById('root');
if (!root) throw new Error('Missing #root element');

createRoot(root).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
);
