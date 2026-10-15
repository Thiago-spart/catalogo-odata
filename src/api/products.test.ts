import { buildQuery } from '../odata/query';
import { http, HttpResponse, server } from '../test/server';
import { ODataError, SERVICE_URL } from './client';
import { defaultListSearch, getProduct, listProducts, listSearchSchema, productListQuery } from './products';

describe('productListQuery', () => {
  it('asks for the first page sorted by name by default', () => {
    expect(buildQuery(productListQuery(defaultListSearch)).readable).toBe(
      '$select=ProductID,ProductName,UnitPrice,UnitsInStock,Discontinued&$expand=Category($select=CategoryName)&$orderby=ProductName asc&$top=10&$count=true',
    );
  });

  it('combines search, category and stock filters and pages with $skip', () => {
    const q = productListQuery({ q: "Chef's", category: 2, sort: 'price-desc', stock: true, page: 3 });
    expect(q.filter).toBe(
      "(contains(tolower(ProductName),'chef''s')) and (CategoryID eq 2) and ((UnitsInStock gt 0) and (Discontinued eq false))",
    );
    expect(q.orderby).toEqual(['UnitPrice desc', 'ProductName asc']);
    expect(q.skip).toBe(20);
  });
});

describe('listSearchSchema', () => {
  it('falls back to defaults for invalid URL params', () => {
    expect(listSearchSchema.parse({ sort: 'random', page: -4, category: 'x', stock: 'yes' })).toEqual(defaultListSearch);
  });
});

describe('API client', () => {
  it('returns parsed products and the total count', async () => {
    const result = await listProducts(defaultListSearch);
    expect(result.total).toBe(23);
    expect(result.products[0]?.ProductName).toBe('Chai');
  });

  it('sends the encoded OData query', async () => {
    let url = '';
    server.use(
      http.get(`${SERVICE_URL}/Products`, ({ request }) => {
        url = request.url;
        return HttpResponse.json({ value: [] });
      }),
    );
    await listProducts({ ...defaultListSearch, q: 'a&b' });
    expect(new URL(url).searchParams.get('$filter')).toBe("contains(tolower(ProductName),'a&b')");
  });

  it('turns an OData error body into a typed not_found error', async () => {
    server.use(
      http.get(`${SERVICE_URL}/Products(999)`, () =>
        HttpResponse.json({ error: { code: '', message: 'Resource not found for the segment.' } }, { status: 404 }),
      ),
    );
    await expect(getProduct(999)).rejects.toMatchObject({ kind: 'not_found', status: 404 });
  });

  it('rejects a payload that breaks the contract', async () => {
    server.use(http.get(`${SERVICE_URL}/Products`, () => HttpResponse.json({ value: [{ ProductID: 'one' }] })));
    const error = await listProducts(defaultListSearch).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ODataError);
    expect((error as ODataError).kind).toBe('invalid_response');
  });

  it('reports a network failure', async () => {
    server.use(http.get(`${SERVICE_URL}/Products`, () => HttpResponse.error()));
    await expect(listProducts(defaultListSearch)).rejects.toMatchObject({ kind: 'network' });
  });
});
