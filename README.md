# Catálogo OData

Catálogo de produtos **mobile first** em React e TypeScript, consumindo a API pública **OData v4** do Northwind. Um projeto pequeno, feito para mostrar como eu integro uma API corporativa no front-end: contrato tipado, consultas seguras, paginação no servidor, performance e testes automatizados.

- **Demo:** https://catalogo-odata.vercel.app
- **Design (Figma):** https://www.figma.com/design/PtDRMHXsS4llMnbKdoye92
- **Decisões e plano:** [`docs/design.md`](docs/design.md)

Cada tela mostra, no painel **Requisição OData**, a chamada exata que está sendo feita. Mude um filtro e veja `$filter`, `$orderby`, `$top` e `$skip` mudarem.

## O que o projeto mostra

| Tema | Como está resolvido |
|---|---|
| **OData v4** | `$select` só com os campos usados, `$expand` aninhado (`Category($select=CategoryName)`), `$filter` com `contains`/`tolower`, `$orderby`, paginação com `$top`/`$skip` e total com `$count=true`. |
| **Consultas seguras** | `src/odata/query.ts` monta a query com funções puras. Strings viram literais com `'` duplicado, então o texto digitado nunca altera o filtro (`x') or (1 eq 1` continua sendo só texto). |
| **Contrato tipado** | Zod valida cada resposta na fronteira (`src/api/schemas.ts`). Se o serviço mudar, o erro é tipado (`invalid_response`) em vez de `undefined` na tela. Todos os erros viram `ODataError` (`not_found`, `http`, `network`, `invalid_response`). |
| **Estado na URL** | Busca, categoria, ordenação, estoque e página ficam na URL (TanStack Router + Zod). Dá para compartilhar uma busca, recarregar e voltar do detalhe sem perder os filtros. Parâmetros inválidos voltam ao padrão. |
| **Performance** | A página anterior fica visível enquanto a próxima carrega (`keepPreviousData`). O detalhe é pré-carregado quando o usuário passa o mouse, foca ou toca no card. Ordenação sempre termina em `ProductName` para a paginação ser estável. Fontes self-hosted e assets com cache imutável. |
| **Mobile first** | Uma coluna no celular, grade de 2 e 3 colunas no desktop, alvos de toque de 44 px, chips de categoria com rolagem horizontal. |
| **Acessibilidade** | Rótulos em todos os campos, `aria-pressed` nos chips, `role="switch"`, região `aria-live` com o total, skip link, foco visível, `prefers-reduced-motion`. |
| **Testes** | Vitest para o query builder e o cliente; React Testing Library + MSW para os estados da tela; Playwright contra o serviço real em celular (Pixel 7) e desktop. |

## Rodando

```bash
pnpm install
pnpm dev          # http://localhost:5173
pnpm check        # lint + typecheck + testes
pnpm test:e2e     # Playwright contra o serviço real
```

## Estrutura

```
src/odata/    query builder OData (puro, testado)
src/api/      schemas Zod, cliente fetch com erros tipados, consultas, query keys
src/ui/       componentes de apresentação (cards, filtros, estados, painel)
src/routes/   rotas, lista e detalhe
e2e/          Playwright
```

## Próximos passos

Fora do escopo desta versão, de propósito:

- **SAP S/4HANA:** trocar o Northwind pelo sandbox do SAP Business Accelerator Hub (`API_SALES_ORDER_SRV`, OData V2) atrás de um **BFF**, que guarda a API key e resolve CORS.
- **Escrita:** criar e editar com o fluxo do SAP Gateway (buscar `x-csrf-token` antes do POST/PATCH), concorrência otimista com **ETag** (`If-Match`) e `$batch`.
- **Tipos gerados do `$metadata`** (por exemplo com odata2ts) no lugar dos schemas escritos à mão.
- **Offline** com service worker e **app híbrido** com Capacitor.
- **Monitoramento:** Web Vitals de campo (INP, LCP no p75) e Sentry.

---

Feito por [Thiago Souza](https://thiago-souza-developer.vercel.app).
