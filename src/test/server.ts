import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { SERVICE_URL } from '../api/client';

export const categories = [
  { CategoryID: 1, CategoryName: 'Beverages' },
  { CategoryID: 2, CategoryName: 'Condiments' },
];

export const products = [
  { ProductID: 1, ProductName: 'Chai', UnitPrice: 18, UnitsInStock: 39, Discontinued: false, Category: { CategoryName: 'Beverages' } },
  { ProductID: 2, ProductName: 'Chang', UnitPrice: 19, UnitsInStock: 17, Discontinued: false, Category: { CategoryName: 'Beverages' } },
  { ProductID: 9, ProductName: 'Mishi Kobe Niku', UnitPrice: 97, UnitsInStock: 29, Discontinued: true, Category: { CategoryName: 'Meat/Poultry' } },
];

export const chai = {
  ...products[0],
  QuantityPerUnit: '10 boxes x 20 bags',
  UnitsOnOrder: 0,
  ReorderLevel: 10,
  Supplier: { CompanyName: 'Exotic Liquids', City: 'London', Country: 'UK', Phone: '(171) 555-2222' },
};

export const handlers = [
  http.get(`${SERVICE_URL}/Categories`, () => HttpResponse.json({ value: categories })),
  http.get(`${SERVICE_URL}/Products`, () => HttpResponse.json({ '@odata.count': 23, value: products })),
  http.get(`${SERVICE_URL}/Products(1)`, () => HttpResponse.json(chai)),
];

export const server = setupServer(...handlers);
export { http, HttpResponse };
