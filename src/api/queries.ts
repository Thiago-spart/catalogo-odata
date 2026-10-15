import { keepPreviousData, queryOptions } from '@tanstack/react-query';
import { getProduct, listCategories, listProducts, type ListSearch } from './products';

// One place for query keys, so invalidation and prefetch never drift apart.
export const productKeys = {
  all: ['products'] as const,
  list: (s: ListSearch) => [...productKeys.all, 'list', s] as const,
  detail: (id: number) => [...productKeys.all, 'detail', id] as const,
  categories: ['categories'] as const,
};

export const productListOptions = (s: ListSearch) =>
  queryOptions({
    queryKey: productKeys.list(s),
    queryFn: ({ signal }) => listProducts(s, signal),
    placeholderData: keepPreviousData,
  });

export const productDetailOptions = (id: number) =>
  queryOptions({ queryKey: productKeys.detail(id), queryFn: ({ signal }) => getProduct(id, signal) });

export const categoriesOptions = () =>
  queryOptions({ queryKey: productKeys.categories, queryFn: ({ signal }) => listCategories(signal), staleTime: Infinity });
