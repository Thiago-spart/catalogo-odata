import { z } from 'zod';

// The contract with the Northwind service. Only the fields the screens use are
// selected and parsed, so a change on the server fails here, with a typed error.

export const categorySchema = z.object({
  CategoryID: z.number().int(),
  CategoryName: z.string(),
});

export const productSummarySchema = z.object({
  ProductID: z.number().int(),
  ProductName: z.string(),
  UnitPrice: z.number().nullable(),
  UnitsInStock: z.number().int().nullable(),
  Discontinued: z.boolean(),
  Category: z.object({ CategoryName: z.string() }).nullable(),
});

export const productDetailSchema = productSummarySchema.extend({
  QuantityPerUnit: z.string().nullable(),
  UnitsOnOrder: z.number().int().nullable(),
  ReorderLevel: z.number().int().nullable(),
  Supplier: z
    .object({
      CompanyName: z.string(),
      City: z.string().nullable(),
      Country: z.string().nullable(),
      Phone: z.string().nullable(),
    })
    .nullable(),
});

export function collectionSchema<T extends z.ZodType>(item: T) {
  return z.object({ '@odata.count': z.number().int().optional(), value: z.array(item) });
}

export const odataErrorSchema = z.object({
  error: z.object({ code: z.string(), message: z.string() }),
});

export type Category = z.infer<typeof categorySchema>;
export type ProductSummary = z.infer<typeof productSummarySchema>;
export type ProductDetail = z.infer<typeof productDetailSchema>;
