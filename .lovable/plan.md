## Problema

No `src/components/dosha/InterstitialLoading.tsx`, cada cena renderiza uma imagem diferente (`IMG1`–`IMG5`) sem dimensões fixas no container. Quando a cena troca, a imagem ainda não está em cache, então:

1. O `<img>` aparece com altura 0 → o texto sobe.
2. Quando carrega, o layout "salta" para acomodar a altura real.
3. Cada cena tem tamanhos diferentes (`max-w-[240px]` vs `w-[200px] h-[200px]`), agravando o salto.

## Solução

Duas mudanças combinadas no mesmo arquivo (`src/components/dosha/InterstitialLoading.tsx`):

### 1. Pré-carregar todas as imagens antes da primeira cena

- Criar um `useEffect` que, ao montar, instancia `new Image()` para cada uma das 5 URLs e seta `.src`. Isso força o browser a baixar e cachear tudo enquanto a cena 1 já está visível.
- Opcional: manter um state `preloaded` e só iniciar o timer da cena após o `onload` da primeira imagem (garantia mínima). As demais carregam em paralelo durante os 2,5s da cena 1.

### 2. Reservar espaço fixo para imagem + texto

- Envolver `scene.render()` num wrapper com altura fixa (ex.: `h-[260px] w-[260px] flex items-center justify-center`) para todas as cenas, eliminando variação entre cenas.
- Padronizar todas as imagens com `className="max-h-full max-w-full object-contain"` dentro desse wrapper.
- Envolver o bloco do texto com `min-h-[80px]` (ou similar, calculado para 2 linhas no mobile) para que mudanças de comprimento de texto também não saltem.
- Manter o container externo com `min-h-[60vh]` que já existe.

### 3. Pequenos extras

- Adicionar `loading="eager"` e `decoding="async"` nas `<img>` (já que são críticas e pré-carregadas).
- Adicionar `width`/`height` explícitos nas tags `<img>` que ainda não têm (IMG1, IMG2, IMG3) para o browser reservar espaço mesmo antes do load.

## Arquivos afetados

- `src/components/dosha/InterstitialLoading.tsx` — único arquivo. Sem mudanças de lógica, rotas ou backend.

## Validação

- Abrir `/teste-de-dosha`, completar e clicar em "Calcular".
- Observar que o texto e a imagem permanecem na mesma posição vertical durante todas as 5 cenas, sem reflow.
