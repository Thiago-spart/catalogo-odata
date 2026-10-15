const price = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'USD' });

export const formatPrice = (value: number | null) => (value === null ? 'Sem preço' : price.format(value));

export function plural(n: number, one: string, many: string) {
  return `${n} ${n === 1 ? one : many}`;
}
