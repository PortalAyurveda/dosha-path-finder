## Objetivo

Criar uma página de preview isolada que reproduza exatamente a sequência de 5 imagens (interstitial) exibida entre o clique em "calcular" no /teste-de-dosha e a chegada ao /meu-dosha, sem precisar refazer o teste a cada ajuste visual.

## Abordagem

O componente `src/components/dosha/InterstitialLoading.tsx` já encapsula toda a esteira (5 cenas, dots de progresso, animações, textos e imagens). Ele é a fonte única de verdade — basta reutilizá-lo na página de preview para garantir que qualquer alteração feita nele apareça automaticamente nos dois lugares (teste real e preview).

A rota `/preview` hoje já está ocupada pela `Index` antiga. Para evitar conflito, vou usar `/preview-loading` (rota nova, dedicada).

## O que será criado

1. **Nova página `src/pages/PreviewLoading.tsx`**
   - Botão "Calcular" centralizado (mesmo estilo visual do botão final do teste).
   - Ao clicar, renderiza `<InterstitialLoading redirectTo="/preview-loading" />` — assim, ao final da sequência, ele volta para a própria página de preview e mostra o botão "Calcular" novamente, permitindo rodar quantas vezes quiser.
   - Pequeno cabeçalho explicativo: "Preview da esteira de carregamento".

2. **Nova rota em `src/App.tsx`**
   - `<Route path="/preview-loading" element={<PreviewLoading />} />`

## Garantias

- Nenhuma alteração no `InterstitialLoading.tsx`, no `TesteDeDosha.tsx` ou no fluxo real — a página de preview apenas consome o mesmo componente.
- Qualquer mudança futura nas imagens/textos/tempos do interstitial reflete automaticamente em `/preview-loading`.

## Detalhes técnicos

- Componente reusado: `src/components/dosha/InterstitialLoading.tsx` (já recebe `redirectTo` como prop).
- Estado local na página: `started: boolean` para alternar entre tela do botão e a esteira.
- Após o redirect, `started` reseta (a página remonta), então o botão reaparece pronto para nova execução.
