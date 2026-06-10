## Goal
Em `/aula/:slug` (e dependências via `AulaDispatcher` → `Aula.tsx`), o header atualmente entra em modo "immersive" e renderiza uma versão reduzida com botão "Voltar" branco sobre fundo escuro (cores ruins, conforme print). Trocar para o header padrão do site (Menu / lupa / logo / Entrar ou nome do usuário).

## Mudança
Arquivo: `src/pages/Aula.tsx`

1. Remover a chamada `setImmersive(true)` no `useEffect` (linhas ~135-137) e o import/uso do hook `useImmersive` se ficar órfão.
2. Manter o restante da página intacto (player, countdown no rodapé do vídeo, etc.).

Resultado: o `Header` global renderiza seu layout padrão (já é compacto, h-16) em vez do branch `if (immersive)`. O `Footer` também volta a aparecer, o que é o comportamento padrão do site.

## Escopo
- Apenas `src/pages/Aula.tsx`.
- Não alterar `Header.tsx`, `Layout.tsx` nem `ImmersiveContext` (continuam usáveis por outras páginas, ex.: `Webinar`).
- Nenhuma mudança de lógica de negócio.
