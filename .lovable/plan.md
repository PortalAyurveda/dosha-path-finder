

## Problemas Identificados

1. **Timestamps duplicados**: O `VideoPlayerDialog` mostra os timestamps clicáveis E depois renderiza o `textoParaEmbedding` bruto (que contém os mesmos timestamps como texto). Resultado: tudo aparece duas vezes.

2. **Scroll quebrado**: O conteúdo longo fica cortado porque o dialog tem `max-h-[90vh]` mas a área interna não tem scroll adequado — há dois `ScrollArea` separados (um para timestamps, outro para descrição) em vez de um único scroll para todo o conteúdo abaixo do vídeo.

3. **Conteúdo rico sem SEO**: O `textoParaEmbedding` tem conteúdo rico e detalhado, mas está preso dentro de um dialog (modal) que não é indexável por buscadores.

## Plano

### 1. Corrigir VideoPlayerDialog — timestamps e scroll

**Arquivo**: `src/components/biblioteca/VideoPlayerDialog.tsx`

- Remover o bloco que renderiza `textoParaEmbedding` bruto abaixo dos timestamps (linhas 114-119). Mostrar apenas `description` (`nova_descricao`) como texto descritivo, SEM o `textoParaEmbedding`.
- Envolver título + timestamps + descrição em um único `ScrollArea` com `max-h` adequado para que todo o conteúdo seja rolável.
- Manter os timestamps clicáveis como estão (funcionam bem).

### 2. Páginas CMS para SEO — criar rota `/video/:videoId`

Sim, gerar páginas dedicadas por vídeo é a melhor abordagem para SEO. Cada vídeo terá uma URL própria (`/video/ABC123`) indexável pelo Google.

**Novo arquivo**: `src/pages/Video.tsx`

- Rota `/video/:videoId` que recebe o ID do vídeo na URL.
- Faz fetch em `portal_oficial`, `portal_receitas` e `portal_lives` pelo `video_id`.
- Renderiza uma página completa com:
  - `<Helmet>` com título, descrição e meta tags OpenGraph/Twitter para compartilhamento.
  - Player do YouTube embedado.
  - Timestamps clicáveis (reaproveitando a lógica existente).
  - `nova_descricao` como conteúdo textual formatado.
  - Tags renderizadas como badges.
  - Schema.org `VideoObject` JSON-LD para rich snippets no Google.
- Botão "Voltar à Biblioteca".

**Arquivo**: `src/App.tsx` — adicionar rota `/video/:videoId`.

**Arquivos**: `VideoResultCard.tsx`, `DoshaVideosContent.tsx`, `Biblioteca.tsx` — ao clicar num vídeo, navegar para `/video/:videoId` em vez de abrir o dialog (ou oferecer ambos: clique abre a página, um botão de play rápido abre o dialog).

### 3. Atualizar navegação

- No `VideoResultCard`, o clique principal leva a `/video/${videoId}`.
- O `VideoPlayerDialog` continua existindo para uso em contextos onde faz sentido (busca avançada, páginas de dosha).

### Resumo de arquivos

| Arquivo | Ação |
|---|---|
| `VideoPlayerDialog.tsx` | Remover texto duplicado, unificar scroll |
| `src/pages/Video.tsx` | **Novo** — página CMS por vídeo com SEO |
| `src/App.tsx` | Adicionar rota `/video/:videoId` |
| `Biblioteca.tsx` | Navegar para página em vez de dialog |
| `DoshaVideosContent.tsx` | Idem |

