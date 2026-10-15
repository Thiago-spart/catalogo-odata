import { z } from 'zod';
import { and, containsIgnoreCase, eq, gt, type ODataQuery } from '../odata/query';
import { odataGet } from './client';
import { categorySchema, collectionSchema, productDetailSchema, productSummarySchema } from './schemas';

export const PAGE_SIZE = 10;

export const sortKeys = ['name', 'price-asc', 'price-desc'] as const;
export type SortKey = (typeof sortKeys)[number];

/** The list filters. They live in the URL (see routes/search.ts). */
export const listSearchSchema = z.object({
  q: z.string().trim().max(80).catch(''),
  category: z.number().int().positive().optional().catch(undefined),
  sort: z.enum(sortKeys).catch('name'),
  stock: z.boolean().catch(false),
  page: z.number().int().min(1).catch(1),
});
export type ListSearch = z.infer<typeof listSearchSchema>;
export const defaultListSearch: ListSearch = listSearchSchema.parse({});

// ProductName closes every sort, so paging over equal prices stays stable.
const ORDER: Record<SortKey, string[]> = {
  name: ['ProductName asc'],
  'price-asc': ['UnitPrice asc', 'ProductName asc'],
  'price-desc': ['UnitPrice desc', 'ProductName asc'],
};

export function productListQuery(s: ListSearch): ODataQuery {
  return {
    select: ['ProductID', 'ProductName', 'UnitPrice', 'UnitsInStock', 'Discontinued'],
    expand: [{ property: 'Category', select: ['CategoryName'] }],
    filter: and(
      s.q && containsIgnoreCase('ProductName', s.q),
      s.category !== undefined && eq('CategoryID', s.category),
      s.stock && and(gt('UnitsInStock', 0), eq('Discontinued', false)),
    ),
    orderby: ORDER[s.sort],
    top: PAGE_SIZE,
    skip: (s.page - 1) * PAGE_SIZE,
    count: true,
  };
}

export function productDetailQuery(): ODataQuery {
  return {
    expand: [
      { property: 'Category', select: ['CategoryName'] },
      { property: 'Supplier', select: ['CompanyName', 'City', 'Country', 'Phone'] },
    ],
  };
}

export const categoriesQuery: ODataQuery = { select: ['CategoryID', 'CategoryName'], orderby: ['CategoryName asc'] };

const productPage = collectionSchema(productSummarySchema);

export async function listProducts(s: ListSearch, signal?: AbortSignal) {
  const data = await odataGet('Products', productListQuery(s), productPage, signal);
  return { products: data.value, total: data['@odata.count'] ?? data.value.length };
}

export function getProduct(id: number, signal?: AbortSignal) {
  return odataGet(`Products(${id})`, productDetailQuery(), productDetailSchema, signal);
}

export async function listCategories(signal?: AbortSignal) {
  return (await odataGet('Categories', categoriesQuery, collectionSchema(categorySchema), signal)).value;
}
