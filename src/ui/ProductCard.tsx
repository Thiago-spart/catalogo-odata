import { useQueryClient } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { productDetailOptions } from '../api/queries';
import type { ListSearch } from '../api/products';
import type { ProductSummary } from '../api/schemas';
import { formatPrice } from './format';
import { StockTag } from './StockTag';

export function ProductCard({ product, search }: { product: ProductSummary; search: ListSearch }) {
  const queryClient = useQueryClient();
  // Start loading the detail as soon as the user shows intent, so the tap
  // usually lands on cached data.
  const prefetch = () => void queryClient.prefetchQuery(productDetailOptions(product.ProductID));
  return (
    <li>
      <Link
        to="/produtos/$id"
        params={{ id: product.ProductID }}
        search={search}
        onMouseEnter={prefetch}
        onFocus={prefetch}
        onTouchStart={prefetch}
        className="flex h-full flex-col gap-2 rounded-lg border border-line bg-raised px-4 py-3.5 transition-colors hover:border-line-strong active:bg-ground"
      >
        <span className="flex items-baseline justify-between gap-3">
          <span className="font-display text-lg leading-6 font-semibold">{product.ProductName}</span>
          <span className="shrink-0 font-mono text-[15px] font-medium tabular-nums">{formatPrice(product.UnitPrice)}</span>
        </span>
        <span className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1">
          <StockTag stock={product.UnitsInStock} discontinued={product.Discontinued} />
          <span className="text-sm text-ink-muted">{product.Category?.CategoryName ?? 'Sem categoria'}</span>
        </span>
      </Link>
    </li>
  );
}
