# Indexação no Google — 10 mudanças + sitemap de reserva

Objetivo: parar de gerar "soft 404" para o Google, evitar que páginas boas herdem o corpo/canonical da home, e fazer a build falhar em voz alta quando o pré-render vier vazio.

## O que muda

1. **Tela de erro (`src/pages/NotFound.tsx`)** — passa a se declarar erro: `noindex, follow` + título/descrição via `react-helmet-async`, remoção do canonical por manipulação direta do `document.head` (com `setTimeout(…, 0)`, no mesmo desenho de `RegistroAkashico.tsx`, para o `useCanonical` do pai não recriar a tag) e os três textos visíveis em português. `src/hooks/useCanonical.ts` fica intacto.

2. **`src/pages/BlogArticle.tsx`** — separa "não existe" de "a busca falhou": o `useQuery` também expõe `isError`/`isSuccess`; um ramo novo de erro (sem `robots`, sem remover canonical) vem antes; e só `isSuccess && !article` emite `noindex, follow`, título "Artigo não encontrado" e remove o canonical. `src/pages/Video.tsx` não é tocado.

3. **`src/components/Footer.tsx`** — `ColumnLink` aceita `rel` e repassa ao `Link`; `rel="nofollow"` em Meu Dosha, Minha Rotina, Revisão Mensal, Métricas do Portal e no link `/devlog` da barra de baixo. Rótulos, ordem e visual não mudam.

4. **`index.html`** — o script "Salvaguarda SEO" ganha `/devlog`, `/revisao`, `/meu-perfil`, `/pesquisa`, `/imprimir`, `/escola`, `/rpg`, `/cobranca` em `privatePrefixes` (as existentes permanecem), e o bloco `isPrivate` passa a **remover** a meta `robots` quando a rota não é privada.

5. **`scripts/prerender-og.ts`** — saem de `staticRoutes` as entradas `/artigos`, `/samkhya/produto` e `/samkhya/categoria` (endereços que abriam 404 com título próprio). As rotas dinâmicas com slug continuam.

6. **`scripts/prerender-og.ts`** — apaga o bloco morto de `/registros-akashikos/{slug}` (lê `akasha_memory`, bloqueada por RLS, gera zero arquivos) e no lugar entra o comentário explicativo com as três condições para reativar. `bakeHome` é desligado: `HOME_SOURCE = process.env.HOME_BAKE_URL || "off"` e `HOME_BAKE_DISABLED = HOME_SOURCE === "off"`, com religamento via `HOME_BAKE_URL`.

7. **`scripts/prerender-og.ts`** — em `renderHtml`, o `h1` e o `p` do `#boot-shell` passam a trazer o título curto (sem sufixo de marca) e a descrição da própria rota, limitada a 110 caracteres; substituição por função para não interpretar `$`. A home (`/`) fica de fora e o `dist/index.html` mantém os textos atuais. CSS e estrutura do boot-shell não mudam.

8. **`scripts/prerender-og.ts`** — a build grita: aviso de `ZERO itens` em `fetchRest` quando a resposta é 200 com lista vazia; no fim de `main()` (no lugar do laço atual, depois de `writeSitemap`) mínimos por família (`blog` 100, `video` 150) que interrompem a build, avisos para terapeutas e samkhya, escape por `PRERENDER_IGNORAR_MINIMO=1`; e, logo após ler o template, uma conferência de forma do boot-shell que interrompe a build se o padrão do `h1`/`p` mudar.

9. **`src/App.tsx`** — `/artigos` → `/blog`, `/samkhya/produto` → `/samkhya/todos`, `/samkhya/categoria` → `/samkhya`, com `Navigate replace`.

10. **`src/App.tsx`** — novo `TerapeutaRedirect` (ao lado de `PostsRedirect`) e a rota `/terapeutas-do-brasil/:slug` passa a redirecionar para `/terapeutas/{slug}`. A listagem sem slug fica como está.

11. **`public/sitemap.xml`** — criado com uma cópia do conteúdo atual de `https://portalayurveda.com/sitemap.xml`, como reserva: o postbuild sobrescreve quando a geração funciona, e quando falha o site serve essa cópia em vez de erro.

## Detalhes técnicos

- Verificado: `public/sitemap.xml` ainda não existe; `staticRoutes`, `bakeHome`, `fetchRest`, `writtenBy` e o laço final estão em `scripts/prerender-og.ts`; `App.tsx` já importa `Navigate` e `useParams` e já tem `PostsRedirect`; `RegistroAkashico.tsx` já usa o padrão de remoção do canonical.
- A remoção do canonical no NotFound e no ramo "artigo não encontrado" é por DOM (não por Helmet) porque quem escreve o canonical é o `useCanonical`; pelo Helmet o resultado seria canonical duplicado.
- Nada de texto de venda, título ou descrição já existente é reescrito.

## Verificação após publicar

Conferir primeiro as duas que protegem o que já indexa: HTMLs de `/blog/{slug}` e `/video/{slug}` acima de 9.000 bytes com título, canonical próprio e JSON-LD; e o log `[prerender]` com centenas de arquivos em `blog` e `video` e nenhuma linha `ZERO itens`. Depois: sitemap com mais de 800 URLs e sem `registros-akashikos`; `h1` cru do artigo igual ao título do artigo; numa URL inexistente o console devolve `noindex, follow | canonical: 0`; num artigo real, `undefined | canonical: 1`; e os redirecionamentos de `/artigos` e `/terapeutas-do-brasil/edson-osorio`.
