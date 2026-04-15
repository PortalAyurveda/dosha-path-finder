
Objetivo:
- Parar o “salto” ao clicar em Akasha no desktop.
- Fazer as abas de /meu-dosha reutilizarem cache em vez de refazer fetch e mostrar loading a cada troca.

Plano

1. Corrigir a origem do salto da aba Akasha
- Em `src/components/meudosha/AkashaTab.tsx`, vou remover a dependência de `scrollIntoView()` no fim do chat.
- Hoje esse método pode rolar a viewport da página inteira para baixo quando a aba monta ou quando o histórico chega.
- Vou trocar por scroll apenas no container interno do chat (`overflow-y-auto`), usando `ref` + `scrollTop/scrollHeight`.
- Também vou evitar autoscroll da página ao abrir a aba no desktop; o chat pode continuar rolando internamente sem “puxar” o usuário para o rodapé.

2. Simplificar a troca de abas em `MeuDosha`
- Em `src/pages/MeuDosha.tsx`, vou revisar/remover o hack atual de `window.scrollTo` com `requestAnimationFrame` e `setTimeout`.
- A ideia é deixar a navegação de abas passiva: clicar em “Akasha” só troca o conteúdo, sem reposicionar a página.
- Se necessário, deixo a aba controlada por estado local para garantir comportamento consistente.

3. Colocar o carregamento do painel sob cache real do React Query
- Em `src/pages/MeuDosha.tsx`, vou migrar as buscas principais que ainda estão em `useEffect/useState` para `useQuery`:
  - registro de `doshas_registros`
  - glossário de `portal_glossario`
  - insights (`gerar_insights_ayurvedicos`)
- Isso centraliza cache, loading e invalidação no React Query e evita que o estado da página pai “brigue” com os filhos.

4. Aplicar cache forte nas abas filhas
- Vou definir `staleTime` e `gcTime` altos para os dados do painel em:
  - `src/components/meudosha/ArtigosTab.tsx`
  - `src/components/meudosha/VideosGeneralTab.tsx`
  - `src/components/meudosha/VideosPersonalizadoTab.tsx`
  - `src/pages/MeuDosha.tsx` (insights/registro/glossário)
- Também vou desligar refetch desnecessário na remontagem dessas queries (`refetchOnMount` / `refetchOnWindowFocus` onde fizer sentido).
- Resultado esperado: depois do primeiro carregamento, trocar entre Perfil, Métricas, Artigos e Vídeos fica instantâneo.

5. Tratar a aba Akasha como cacheada também
- Em `src/components/meudosha/AkashaTab.tsx`, vou mover o carregamento de histórico para React Query.
- O cache será indexado por sessão/usuário (`resolvedEmail` / `idPublico`).
- Ao enviar mensagens, vou atualizar o cache com `queryClient.setQueryData` para que a conversa reapareça imediatamente ao voltar para a aba, sem spinner nem novo fetch.
- Isso também evita recarregar o histórico toda vez que a aba desmonta/remonta.

6. Reduzir requests repetidos dentro da aba Artigos
- Hoje `HeartButton` faz buscas próprias fora do React Query, então ao remontar a lista ele tende a consultar `content_likes` de novo.
- Vou colocar esses dados de curtida em cache também, via React Query ou hook compartilhado em `src/components/HeartButton.tsx`.
- Isso reduz o ruído de rede ao alternar abas com cards/artigos.

Detalhes técnicos
- Não pretendo usar `forceMount` em todas as abas, porque isso faria carregar tudo logo no primeiro render, inclusive Akasha.
- Em vez disso, vou manter montagem sob demanda + cache persistente.
- Vou normalizar query keys onde necessário para evitar cache miss acidental (ex.: listas derivadas de `Set`, como vídeos vistos).
- Onde já existe realtime no `MeuDosha`, vou atualizar/invalidate o cache do React Query em vez de depender só de `setState`.

Arquivos principais
- `src/pages/MeuDosha.tsx`
- `src/components/meudosha/AkashaTab.tsx`
- `src/components/meudosha/ArtigosTab.tsx`
- `src/components/meudosha/VideosGeneralTab.tsx`
- `src/components/meudosha/VideosPersonalizadoTab.tsx`
- `src/components/HeartButton.tsx`

Impacto esperado
- Clicar em “Akasha” no PC não joga mais a tela para baixo.
- As abas deixam de mostrar loading repetidamente após a primeira carga.
- O Supabase deixa de ser consultado de novo a cada troca de aba.
- O cache sobrevive às desmontagens dos componentes filhos, então a alternância fica fluida.
