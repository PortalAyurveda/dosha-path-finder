# Plano: 4 otimizações de performance

Os 4 prompts serão executados em sequência, cada um isolado e verificável. Nenhum afeta UI, lógica de negócio, auth ou tracking de eventos.

---

## 1. Code Splitting por rota (`src/App.tsx`)

Converter todos os `import Page from "./pages/..."` em `const Page = lazy(() => import("./pages/..."))` e envolver o `<Routes>` num único `<Suspense fallback={<LoadingFallback />}>`.

- Fallback: spinner centralizado simples reutilizando paleta do design system (`bg-background`, `text-primary`), sem mexer no layout das páginas.
- Manter fora do lazy: `App`, providers (QueryClient, UserProvider, HeaderCtaProvider, Tooltip, Toaster, Sonner), `Layout`, `Header`, `Footer`, `ScrollToTop`, rotas de proteção (`AdminRoute`).
- Todas as ~60 páginas em `src/pages/**` viram lazy, incluindo subpáginas de `curso/`, admin, dosha, samkhya, metricas, auth.
- Resultado: Vite gera um chunk por página automaticamente (sem precisar configurar `manualChunks`).

## 2. Defer dos scripts de analytics

- Remover do `<head>` do `index.html` os blocos inline de: Google Analytics (gtag), Meta Pixel (`fbq`) e Microsoft Clarity.
- Manter no `index.html`: o `<noscript>` do Meta Pixel no `<body>` (já está lá).
- Criar `src/components/AnalyticsLoader.tsx`: componente sem UI que, no `useEffect`, aguarda `window.load` (ou fallback `setTimeout(..., 3000)`) e então injeta dinamicamente os 3 scripts via `document.createElement('script')`, preservando IDs: `G-VN454LL7QF`, `727901213560105`, `wqrw7kj8n1`.
- Montar `<AnalyticsLoader />` uma única vez no `App.tsx`, fora das rotas.
- Garantir que `window.fbq` continue disponível (helper `src/lib/metaPixel.ts` já é defensivo — só dispara se existir).

## 3. Cache headers para Cloudflare

Criar `public/_headers`:

```text
/assets/*
  Cache-Control: public, max-age=31536000, immutable

/fonts/*
  Cache-Control: public, max-age=31536000, immutable

/*.woff2
  Cache-Control: public, max-age=31536000, immutable

/
  Cache-Control: public, max-age=0, must-revalidate

/index.html
  Cache-Control: public, max-age=0, must-revalidate

/site.webmanifest
  Cache-Control: public, max-age=300
```

Vite copia `public/_headers` para a raiz do build automaticamente.

## 4. Fontes locais (DM Sans + Roboto Serif)

- Baixar `.woff2` do Google Webfonts Helper (subset `latin` + `latin-ext` para suportar PT-BR):
  - DM Sans: 300, 400, 500, 700 (regular + italic onde existir)
  - Roboto Serif: 400, 700 (regular + italic)
- Salvar em `public/fonts/`.
- Em `src/index.css`, adicionar `@font-face` para cada arquivo com `font-display: swap` e `font-family: 'DM Sans'` / `'Roboto Serif'` (mesmos nomes já usados no Tailwind config, sem mudar nada visual).
- Em `index.html`, remover as 3 linhas: `preconnect` googleapis, `preconnect` gstatic, e o `<link rel="stylesheet" href="...fonts.googleapis.com...">`.

### Observação operacional
O passo 4 exige download de ~10-14 arquivos `.woff2` via `curl` durante a execução. Se algum peso/italic não estiver realmente em uso no app, omito para reduzir bytes. Posso confirmar o conjunto exato olhando `tailwind.config.ts` e usos no CSS antes de baixar.

---

## Ordem de execução proposta
1 → 2 → 3 → 4. Cada passo é independente e o build valida ao fim de cada um.
