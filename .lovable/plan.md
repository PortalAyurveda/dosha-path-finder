# Por que descrições não aparecem no WhatsApp

## Diagnóstico

A configuração SEO do projeto **está tecnicamente correta**: `index.html` tem todas as tags OG/Twitter, `og-image.jpg` retorna 200, `Seo.tsx` usa `react-helmet-async` para sobrescrever por rota, JSON-LD presente, robots/sitemap ok.

**O problema real:** WhatsApp, Facebook, LinkedIn, Slack, Telegram **não executam JavaScript**. Eles baixam o HTML cru e leem apenas o que está em `index.html`. Como o app é SPA (Vite), toda rota serve o mesmo `index.html`. Confirmado por teste:

```
curl -A "WhatsApp" https://portalayurveda.com/blog
curl -A "WhatsApp" https://portalayurveda.com/teste-de-dosha
```
→ ambas retornam og:title "Portal Ayurveda — Descubra seu Dosha" (genérico do index).

Os `<Seo>` por rota só funcionam para Google (que executa JS) — útil para SEO orgânico, **inútil para preview de link**.

O "ícone de carregamento travado" no WhatsApp é o segundo sintoma do mesmo problema: cache agressivo do WhatsApp (≈7 dias). Se o primeiro raspe veio sem tags certas, fica preso até o cache expirar.

## O que falta — 3 frentes

### 1. Pré-renderização de OG por rota (resolve raiz)

Adicionar `vite-plugin-prerender` ou um script `postbuild` que, no build, gera arquivos HTML estáticos para as rotas-chave com OG/title/description corretos por página. Crawlers buscam `/blog/meu-post/index.html` → recebem HTML com tags certas. Usuários reais continuam recebendo o SPA normal.

Rotas a pré-renderizar (todas as públicas com conteúdo único):
- `/`, `/teste-de-dosha`, `/biblioteca`, `/blog`, `/contato`, `/assinar`
- `/curso/alimentacao`, `/curso/formacao`, `/curso/rotinas`
- `/biblioteca/vata`, `/biblioteca/pitta`, `/biblioteca/kapha`
- `/terapeutas-do-brasil`
- `/samkhya`, `/samkhya/kits`, `/samkhya/todos`
- Dinâmicas: `/blog/:slug` (todos publicados), `/video/:slug`, `/terapeutas-do-brasil/:slug`, `/samkhya/produto/:slug`, `/samkhya/kits/:slug`, `/aula/:slug`

Cada HTML gerado terá `<title>`, `<meta name=description>`, `og:title`, `og:description`, `og:image`, `og:url`, `canonical` específicos do conteúdo.

### 2. Imagens OG por conteúdo

- Confirmar que `Seo.tsx` recebe `image` em todas as páginas com imagem própria (artigo, vídeo, terapeuta, produto). Hoje o default é sempre `og-image.jpg`.
- Adicionar fallback de imagem **quadrada** (600x600) específica para WhatsApp em `index.html` — ele prefere quadradas em chat. A 1200x630 atual fica recortada.
- Garantir `og:image:width/height` em todas as rotas pré-renderizadas (WhatsApp ignora imagens sem dimensões).

### 3. Limpeza de cache + housekeeping

- Documentar processo de "forçar re-raspe" no Facebook Sharing Debugger (também limpa cache do WhatsApp): https://developers.facebook.com/tools/debug/
- Validar com LinkedIn Post Inspector e Twitter Card Validator.
- Pequenos ajustes em `index.html`: remover linha `<meta name="whatsapp:image">` (não é tag oficial, ignorada), adicionar `<meta name="format-detection" content="telephone=no">` para evitar auto-link de números.

## Detalhes técnicos

**Plugin recomendado:** `vite-plugin-prerender-spa` ou abordagem custom com `puppeteer` no `postbuild`. Precisa rodar após o build do Vite e antes do publish do Lovable.

**Para rotas dinâmicas:** o script de pré-render busca a lista de slugs no Supabase (mesma fonte que `scripts/generate-sitemap.ts` deveria usar) e gera um HTML por slug.

**Estrutura final em `dist/`:**
```
dist/
  index.html                       (SPA shell + OG genérico)
  blog/
    index.html                     (OG da listagem)
    meu-artigo/index.html          (OG do artigo)
  video/
    como-equilibrar-vata/index.html
  ...
```

**Custo:** build fica mais lento (~30s extra para ~100 rotas). Bundle final fica maior (HTML é leve, ~5KB cada).

## Antes de começar — 1 confirmação

Pré-renderização adiciona complexidade ao build. Alternativa mais simples (mas inferior): **edge function que detecta user-agent de crawler e serve HTML com tags certas**. Funciona, mas exige rota proxy.

Posso seguir com a pré-renderização (recomendada), ou prefere a abordagem edge function?
