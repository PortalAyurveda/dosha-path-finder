## Problema

Hoje a foto fica numa coluna lateral fixa (`grid md:grid-cols-[1fr_320px]`) que começa só na altura da data/formulário. Como o formulário é mais alto que a foto não preenche, sobra um grande bloco branco abaixo do botão "CONFIRMAR PRESENÇA" e a foto fica visualmente solta, sem alinhar com a borda direita do card.

## Solução

Tratar a foto como elemento gráfico ancorado ao canto inferior direito do card, fluindo junto com o conteúdo (como um "float" editorial), e fazê-la encostar nas bordas direita/inferior do card branco — sem espaço em branco.

### Desktop (≥ md)

1. Adicionar `relative` ao card branco e manter `overflow-hidden` (já existe).
2. Posicionar a foto como elemento absoluto no canto inferior direito do card:
   - `absolute bottom-0 right-0`
   - largura ~300–340px, altura ~ 92% do card, `object-contain object-bottom`
   - Manter o mask gradient atual para suavizar o corte da camisa.
   - `pointer-events-none` para não atrapalhar o form.
3. Reservar espaço à direita do conteúdo textual com `md:pr-[320px]` no container interno, para que título, descrição, data e formulário não passem por baixo da foto.
4. Remover o grid `md:grid-cols-[1fr_320px]` — título/descrição/data/form ficam numa coluna única ocupando o lado esquerdo, e a foto fica ancorada no canto inferior direito independente da altura do form.

### Mobile (< md)

1. Foto sai do absolute e volta ao fluxo normal: renderizada **abaixo** do formulário (ou pode ser escondida em telas muito pequenas — confirmar).
2. Tamanho menor: `w-[220px]` centralizada, com o mesmo mask gradient.
3. Sem reserva de padding lateral (`pr-0` no mobile).

### Estrutura final (resumo)

```text
<card relative overflow-hidden>
  envelope icon
  h1 (centralizado)
  descrição (esquerda)
  <div md:pr-[320px]>
     data 10/06
     form (email, whatsapp, botão, "Evento online e gratuito")
  </div>
  <img mobile: bloco normal no fluxo, centralizado />
  <img desktop: absolute bottom-0 right-0 />
</card>
```

Usar duas tags `<img>` separadas controladas por `hidden md:block` / `md:hidden` é a forma mais limpa de evitar conflitos entre layout fluido (mobile) e absolute (desktop).

## Detalhes técnicos

- Arquivo único: `src/pages/Webinar.tsx`.
- Remover bloco do grid `md:grid-cols-[1fr_320px]` (linhas ~166 e 237–252) e a div `order-first md:order-last`.
- Manter cores, tipografia, mask gradient, botão verde escuro com texto NAVY (já implementados).
- Não tocar em lógica de submit, fetch ou rotas.
