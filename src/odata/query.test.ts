import { and, buildQuery, containsIgnoreCase, eq, gt, literal } from './query';

describe('literal', () => {
  it('quotes strings and doubles single quotes', () => {
    expect(literal('Chai')).toBe("'Chai'");
    expect(literal("Chef Anton's")).toBe("'Chef Anton''s'");
  });

  it('keeps an injection attempt inside the literal', () => {
    expect(literal("x') or (1 eq 1")).toBe("'x'') or (1 eq 1'");
  });

  it('writes numbers and booleans bare', () => {
    expect(literal(3)).toBe('3');
    expect(literal(false)).toBe('false');
  });
});

describe('filters', () => {
  it('builds a case-insensitive contains', () => {
    expect(containsIgnoreCase('ProductName', 'CHai')).toBe("contains(tolower(ProductName),'chai')");
  });

  it('joins parts with and, skipping empty ones', () => {
    expect(and(eq('CategoryID', 2), undefined, false, gt('UnitsInStock', 0))).toBe(
      '(CategoryID eq 2) and (UnitsInStock gt 0)',
    );
    expect(and(eq('CategoryID', 2))).toBe('CategoryID eq 2');
    expect(and(undefined, false)).toBeUndefined();
  });
});

describe('buildQuery', () => {
  it('orders options and renders nested expands', () => {
    const { readable } = buildQuery({
      select: ['ProductID', 'ProductName'],
      expand: [{ property: 'Category', select: ['CategoryName'] }, { property: 'Supplier' }],
      filter: "ProductName eq 'Chai'",
      orderby: ['UnitPrice desc', 'ProductName asc'],
      top: 10,
      skip: 20,
      count: true,
    });
    expect(readable).toBe(
      "$select=ProductID,ProductName&$expand=Category($select=CategoryName),Supplier&$filter=ProductName eq 'Chai'&$orderby=UnitPrice desc,ProductName asc&$top=10&$skip=20&$count=true",
    );
  });

  it('encodes values for the wire but keeps the readable form for display', () => {
    const { encoded, readable } = buildQuery({ filter: containsIgnoreCase('ProductName', 'a&b #1') });
    expect(readable).toBe("$filter=contains(tolower(ProductName),'a&b #1')");
    expect(encoded).toBe('$filter=' + encodeURIComponent("contains(tolower(ProductName),'a&b #1')"));
    expect(new URLSearchParams(encoded).get('$filter')).toBe("contains(tolower(ProductName),'a&b #1')");
  });

  it('omits empty options', () => {
    expect(buildQuery({ select: [], skip: 0 }).readable).toBe('');
  });
});
