## Problema

A página `/video/:slug` fica travada em "Carregando..." (esqueleto + title) para qualquer vídeo acessado por URL direta (links do index, Google, compartilhamento).

## Causa raiz

`src/pages/Video.tsx` viola as **Regras dos Hooks** do React:

```text
linha 100:  if (isLoading) return <Skeleton .../>;   ← early return
linha 114:  useEffect(() => { ... navigate("/biblioteca") ... });  ← hook DEPOIS do return
```

Na primeira renderização `isLoading=true` → o componente retorna cedo e o `useEffect` nunca é registrado. Quando a query termina e `isLoading=false`, o React tenta executar o `useEffect` que não existia antes → erro "Rendered more hooks than during the previous render" → a árvore quebra e a UI fica congelada no esqueleto.

Confirmei via `find_video_by_slug('leitura-de-lingua-no-ayurveda')` que o backend devolve os dados corretamente — o bug é 100% no client.

## Correção

Em `src/pages/Video.tsx`:

1. Mover o bloco `useEffect` (linhas 113–118) para **antes** de qualquer early return — logo após os outros hooks (`useMemo`, etc.) e antes do `if (isLoading) return ...`.
2. Manter as duas guardas de render (`if (isLoading)` → skeleton; `if (!video) return null`) inalteradas.

Nenhuma outra mudança de lógica, estilo ou backend. Sem mexer em ContentHub, RPC ou rotas.

## Verificação

Após o fix, abrir `/video/leitura-de-lingua-no-ayurveda` e `/video/como-fazer-grao-de-bico-com-leite-de-coco` direto na URL — devem carregar título, player do YouTube e índice de minutos normalmente.
