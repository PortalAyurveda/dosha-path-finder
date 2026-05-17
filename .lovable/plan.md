## 1. Diagnóstico do robots.txt "not valid"

Testei os 3 domínios do projeto:

| URL                                       | Status   |
| ----------------------------------------- | -------- |
| `https://portalayurveda.com/robots.txt`   | 200 OK, conteúdo válido (391 bytes) |
| `https://portalayurveda.lovable.app/robots.txt` | **302** → redireciona pra `portalayurveda.com/robots.txt` |
| `https://id-preview--…lovable.app/robots.txt`   | **302** → redireciona pra auth-bridge |

**Causa quase certa:** o Lighthouse foi rodado contra `portalayurveda.lovable.app` (ou o preview). O auditor do Lighthouse exige resposta **2xx direto** — qualquer redirect = "not valid", score 0. O `_headers` da Lovable só vale no domínio publicado/custom; o subdomínio `*.lovable.app` força redirect para o custom domain.

**Verificação rápida:** rode o Lighthouse contra `https://portalayurveda.com/` — o robots.txt vai passar.

Pequenas melhorias adicionais no `public/robots.txt` (não corrigem o score, mas deixam o arquivo mais "limpo" para os parsers):
- Mover `Sitemap:` para o **topo** do arquivo (é uma diretiva global, parsers a preferem fora dos grupos)
- Remover linhas redundantes (`/admin` + `/admin/` — basta `/admin`)
- Unificar blocos `facebookexternalhit`, `Twitterbot`, `LinkedInBot` (já têm `Allow: /` por padrão, o bloco é desnecessário)

---

## 2. Performance — o que ainda dá pra ganhar

Já feito em prompts anteriores: fontes locais, lazy routes + Suspense skeleton, AnalyticsLoader deferido, `_headers` com cache imutável (assets/fonts) e `s-maxage=3600` no index (aguardando publish).

### Ganhos de TTFB / cache
- **`_headers` atual ainda não está em produção** — testei agora e a resposta de `/` retorna `cache-control: no-cache, must-revalidate, max-age=0`. Precisa **publicar** pra Cloudflare começar a cachear na borda. Depois disso o TTFB cai de ~700ms para ~30–50ms em repeat-visits.

### Bundle splitting
- Hoje o Vite empacota tudo num único `vendor` enorme. Adicionar `build.rollupOptions.output.manualChunks` separando:
  - `react-vendor`: react, react-dom, react-router-dom
  - `radix`: todos `@radix-ui/*`
  - `query`: `@tanstack/react-query`
  - `charts`: recharts (só usado em /metricas — hoje contamina o bundle inicial)
  - `supabase`: `@supabase/supabase-js`
- Resultado típico: −30–50 % no JS baixado na home.

### Imagens (maior ganho de LCP)
- Não há `vite-imagetools` no projeto. Hero/cards usam JPG/PNG originais via `getTransformedImageUrl` (que vai pro Supabase storage transformer). Sugestões:
  - Adicionar `<link rel="preload" as="image" fetchpriority="high" href="…hero.webp">` no `index.html` para o hero da home.
  - Forçar `width` e `height` em **todas** as `<img>` (matar CLS residual).
  - Servir `format=webp` por padrão no `imageTransform.ts` (Supabase já suporta `?format=webp`).
  - Adicionar `loading="lazy"` e `decoding="async"` em imagens abaixo da dobra.

### Network hints
- `index.html` já tem `preconnect` para Supabase. Adicionar `preconnect` (ou `dns-prefetch`) para:
  - `https://www.googletagmanager.com`
  - `https://connect.facebook.net`
  - `https://www.clarity.ms`

  Pequeno ganho, mas mensurável quando o AnalyticsLoader dispara.

### Render
- `QueryClient` com `gcTime` explícito (hoje só `staleTime`) — libera memória em sessões longas.
- `React.lazy` para componentes pesados **dentro** de páginas grandes (ex: Recharts em `MetricasGraficos`, `CarouselSection` da Samkhya).

---

## 3. SEO — pontos críticos

### A) Problema estrutural: SPA + Helmet
React-helmet-async injeta `<title>` / `og:*` **depois** da hidratação. Googlebot executa JS, mas crawlers sociais (LinkedIn, Facebook, X, WhatsApp) **não** — eles veem só o `index.html` estático. Hoje:
- Toda URL compartilhada (artigo do blog, produto Samkhya, perfil de terapeuta) cai no OG genérico do `index.html`.
- O script `scripts/prerender-og.ts` parece existir — vale checar se está rodando no build.

**Recomendação:** rodar prerender (`react-snap` ou `vite-plugin-prerender-spa`) nas rotas públicas de alto valor:
- `/`, `/teste-de-dosha`, `/biblioteca`, `/biblioteca/{vata,pitta,kapha}`, `/blog`, `/blog/:slug`, `/samkhya`, `/samkhya/produto/:slug`, `/terapeutas-do-brasil/:slug`, `/curso/*`.

### B) Sitemap incompleto
`public/sitemap.xml` é estático e **não inclui artigos do blog, produtos Samkhya nem a maioria dos terapeutas**. O `scripts/generate-sitemap.ts` deveria buscar essas listas no Supabase e gerar entries dinâmicas com `<lastmod>`.

### C) Slugs / URLs duplicadas (canonical conflicts)
Várias rotas servem o mesmo componente com `defaultTab` — Google pode indexar como conteúdo duplicado:
- `/biblioteca/vata/alquimia` e `/biblioteca/vata/remedios` → mesma página
- `/biblioteca/vata/adoecimento` e `/biblioteca/vata/avancado` → mesma página
- `/cursos/rotinas` e `/curso/rotinas` → mesma página

**Fix:** trocar para `<Navigate to="canonical" replace />` (301-like no client + canonical correto) ou remover do sitemap as variantes não-canônicas (já estão fora hoje, ✅), e garantir que cada `Seo` use `canonicalPath` apontando para a versão preferida.

### D) JSON-LD por rota
- `BlogArticle.tsx` tem Helmet mas **não** emite `Article` schema → perde rich snippets. Adicionar JSON-LD com `@type: Article`, `headline`, `datePublished`, `author`, `image`.
- `TerapeutaPerfil` deveria emitir `Person` ou `LocalBusiness`.
- `SamkhyaProduto` deveria emitir `Product` + `Offer` (preço, disponibilidade).
- Adicionar `BreadcrumbList` nas páginas internas.

### E) Itens menores
- `meta name="robots"` `noindex` programático em `/admin/*`, `/metricas/*`, `/meu-dosha`, `/registros/*` via `Seo` (defesa em profundidade além do robots.txt).
- `<html lang="pt-BR">` ✅ já tem.
- `lastmod` em todas as entries do sitemap (hoje só os terapeutas têm).
- Verificar headings: garantir 1 único `<h1>` por rota.

---

## 4. Próximos passos — preciso saber por onde começar

Antes de implementar, escolha o escopo (não precisa ser tudo de uma vez):

**Pacote A — Quick wins (1 round, baixo risco):**
1. Limpar `public/robots.txt` (Sitemap no topo, remover duplicados).
2. Adicionar `preconnect` para GA/Meta/Clarity em `index.html`.
3. Adicionar `manualChunks` no `vite.config.ts` (recharts/radix/supabase).
4. Servir webp por padrão em `imageTransform.ts` + `loading="lazy"` em imagens fora da dobra.

**Pacote B — SEO estrutural (médio):**
5. Sitemap dinâmico (buscar blog + samkhya + terapeutas do Supabase no `generate-sitemap.ts`).
6. JSON-LD `Article` no `BlogArticle`, `Product` no `SamkhyaProduto`, `Person` no `TerapeutaPerfil`, `BreadcrumbList` global.
7. Canonicalização: substituir aliases de slug por `<Navigate>`.

**Pacote C — Prerendering (mais invasivo, maior payoff SEO):**
8. Configurar prerender estático para as rotas públicas listadas em §3.A.

Quer que eu implemente **Pacote A** primeiro? Ou prefere outra ordem / só um subset?
