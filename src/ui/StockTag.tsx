export const LOW_STOCK = 20;

type Tone = 'good' | 'low' | 'out' | 'off';

const tones: Record<Tone, string> = {
  good: 'bg-good-soft text-good',
  low: 'bg-mango-soft text-mango',
  out: 'bg-poor-soft text-poor',
  off: 'bg-sunken text-ink-muted',
};

export function stockStatus(stock: number | null, discontinued: boolean): { tone: Tone; text: string } {
  if (discontinued) return { tone: 'off', text: 'Descontinuado' };
  if (!stock) return { tone: 'out', text: 'Sem estoque' };
  if (stock < LOW_STOCK) return { tone: 'low', text: `Baixo · ${stock} un.` };
  return { tone: 'good', text: `${stock} em estoque` };
}

export function StockTag({ stock, discontinued }: { stock: number | null; discontinued: boolean }) {
  const { tone, text } = stockStatus(stock, discontinued);
  return <span className={`inline-flex rounded px-2 py-0.5 font-mono text-xs font-medium ${tones[tone]}`}>{text}</span>;
}
