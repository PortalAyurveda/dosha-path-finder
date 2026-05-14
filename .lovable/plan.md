## Diagnóstico

Hoje o `index.html` tem título/descrição/OG genéricos, `og:image` aponta pra cache do Lovable, favicon vem do Supabase, não há sitemap, e nenhuma rota é prerenderizada — então qualquer link colado no WhatsApp/LinkedIn mostra a mesma OG (a do `index.html`), e o Google demora mais pra indexar.

A solução completa tem **4 camadas**: OG sitewide caprichada, Helmet por rota, sitemap+robots, e **prerender estático** que renderiza o HTML de cada rota pública no build.

## O que vou fazer

### 1. Imagem OG da marca (1200×630)

Gerar `public/og-image.jpg` (servida do próprio domínio):
- Fundo `#352F54` com leve gradiente para `#1f1a3a`
- `simbolo-positivo` da marca em destaque
- Wordmark "Portal Ayurveda" em Roboto Serif itálico
- Tagline "Descubra seu Dosha · Viva o Ayurveda"

### 2. Favicon próprio + ícones de plataforma

Baixar `simbolo-positivo.svg` do bucket `portal_images` para `public/favicon.svg`. Gerar via ImageMagick:
- `public/favicon.ico` (32×32, fallback de browser antigo / `/favicon.ico` padrão)
- `public/apple-touch-icon.png` (180×180, iOS)
- `public/icon-192.png` e `public/icon-512.png` (Android/PWA)
- `public/site.webmanifest` mínimo

Atualizar `<link rel="icon">` no `index.html` cobrindo todos.

### 3. Reescrever o `<head>` do `index.html`

- `<title>`: "Portal Ayurveda — Teste de Dosha, Vídeos, Artigos e Akasha IA"
- `<meta name="description">` persuasiva (~150 chars)
- OG completas (`og:title/description/url/type/site_name/locale/image` com width/height)
- Twitter card `summary_large_image`
- Remover `<link rel="canonical">` estático (o hook `useCanonical` já injeta dinâmico — hoje há duplicidade)
- JSON-LD `Organization` + `WebSite` (com `SearchAction` apontando pro `/blog`)
- `<meta name="theme-color" content="#352F54">`

### 4. Helmet por rota nas páginas-chave

Título + description + canonical + og + JSON-LD por rota:

- `/` (Index)
- `/teste-de-dosha`
- `/blog` (lista) e `/blog/:slug` (Article: headline, datePublished, image, author)
- `/biblioteca` e `/biblioteca/{vata,pitta,kapha}` (com subabas)
- `/terapeutas-do-brasil` e `/terapeutas-do-brasil/:slug` (Person)
- `/samkhya`, `/samkhya/produto/:slug` (Product), `/samkhya/categoria/:slug`, `/samkhya/kits`, `/samkhya/kits/:slug`
- `/curso/{alimentacao,formacao,rotinas}` (Course)
- `/assinar` (já tem)
- `/politica-de-privacidade`, `/termos-de-uso`

Páginas privadas/admin (`/meu-dosha`, `/metricas/*`, `/admin/*`, `/entrar`, `/aovivo`, `/registros/:id`) ganham `<meta name="robots" content="noindex,nofollow">`.

### 5. Sitemap dinâmico + robots

Criar `scripts/generate-sitemap.ts` (rodando via `predev` e `prebuild`) que monta `public/sitemap.xml` com:
- Rotas estáticas públicas
- Posts publicados de `blog_posts` → `/blog/{slug}`
- Terapeutas ativos → `/terapeutas-do-brasil/{slug}`
- Produtos publicados Samkhya → `/samkhya/produto/{slug}`, kits, categorias
- `lastmod` baseado em `updated_at` de cada registro

Atualizar `public/robots.txt` com `Sitemap:` apontando para o sitemap e `Disallow: /admin`, `/meu-dosha`, `/entrar`, `/metricas`.

### 6. Prerender estático no build (a parte nova)

Adicionar **`react-snap`** (headless Chromium que crawla o app após `vite build`):

- Roda automaticamente no `postbuild`
- Visita cada rota pública listada (mesma fonte do sitemap)
- Espera o React renderizar com dados do Supabase
- Salva HTML pronto em `dist/<rota>/index.html`
- Resultado: WhatsApp/LinkedIn/Facebook/Google leem HTML completo com OG/título/conteúdo corretos por rota

Ajustes no app:
- `main.tsx` usa `hydrateRoot` quando `document.getElementById("root")` já tem conteúdo (HTML prerenderizado), `createRoot` quando não
- Componentes que tocam `window`/`document` no top-level recebem guards (`typeof window !== 'undefined'`) — auditarei e corrijo onde precisar
- Rotas com auth/conteúdo dinâmico (`/meu-dosha`, `/admin/*`, `/metricas/*`) ficam **fora** da lista de prerender — só o JS roda
- Loaders client-only (Akasha, métricas) já carregam após hidratação — não viram parte do snapshot

### 7. Verificações finais

Após deploy:
- Testar 3 URLs no Facebook Sharing Debugger e LinkedIn Post Inspector (`/`, `/assinar`, um post do blog) — confirmar que cada uma mostra OG própria
- Submeter sitemap no Google Search Console
- Rodar Lighthouse SEO em 3 rotas — meta de 100/100

## Detalhes técnicos

- Imagem OG via `imagegen` (model `premium` — texto legível), salva direto em `public/og-image.jpg`
- Favicon: ImageMagick via `nix run nixpkgs#imagemagick`
- `react-snap` configurado no `package.json` com `reactSnap: { source: "dist", include: [...rotas...], puppeteerArgs: ["--no-sandbox"] }`
- Sitemap script usa o cliente Supabase com a anon key (já disponível em env)
- BASE_URL = `https://portalayurveda.com`
- HelmetProvider já existe — só adiciono `<Helmet>` em cada página

## Trade-offs aceitos

- **Build +30s a +2min** dependendo de quantos posts/produtos existirem — aceitável
- Conteúdo novo do blog/Samkhya só aparece no snapshot após o próximo `Update` no Lovable — comportamento esperado pra blog/loja
- Algumas libs podem precisar de pequenos guards SSR — corrijo durante a implementação se aparecer

## Fora do escopo

- SSR completo com servidor Node (overkill — prerender estático resolve)
- Tradução de meta tags (mantém pt-BR)
- Imagens OG dinâmicas por post/produto (próximo passo se quiser depois)