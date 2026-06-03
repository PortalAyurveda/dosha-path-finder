## Problema
No mobile, a foto do Edson está renderizada no fluxo, abaixo do formulário, criando um grande espaço em branco entre o botão "CONFIRMAR PRESENÇA" e a imagem.

## Solução
Tratar a foto no mobile como elemento absoluto ancorado no canto inferior direito do card (mesma lógica do desktop), mas em escala reduzida, deixando que ela "coma" um pouco do botão e da legenda — fazendo parte do anúncio, sem aumentar a altura do card.

## Mudanças em `src/pages/Webinar.tsx`

1. **Remover** o bloco mobile atual da foto (`<div className="md:hidden ...">` com a `<img>` no fluxo logo abaixo do form).
2. **Unificar** num único `<img>` absoluto, ancorado em `bottom-0 right-0`, com classes responsivas:
   - Mobile: `w-[140px]` (cerca de 1/3 da largura do card), `h-auto`, `max-h-[60%]`, posicionado em `right-0 bottom-0`, sobrepondo levemente o canto inferior direito do botão e da legenda "Evento online e gratuito".
   - Desktop (`md:`): mantém `w-[320px] h-[92%]` como hoje.
   - Mantém `pointer-events-none` e a máscara de fade no rodapé para integrar visualmente.
3. **Garantir espaço para o botão não ficar 100% coberto**: a foto ocupa apenas a faixa direita; o texto da legenda já é centralizado e o botão é full-width, então o overlap visual fica natural (foto cobre ~30% direito da base do card).
4. Manter `md:pr-[300px]` no bloco de descrição/form para o desktop; no mobile não há padding extra (a foto fica fora do fluxo, sobre o conteúdo apenas no rodapé direito).

## Resultado esperado mobile
- Card termina logo após o botão + legenda (sem espaço vazio).
- Foto do Edson aparece pequena, encostada no canto inferior direito, sobrepondo ligeiramente a borda do botão/legenda, como parte do anúncio.
- Altura total do card diminui significativamente.
