## Ajustes no Footer e Akasha mobile

### 1. Footer — remover textos "YouTube" e "Instagram"
Em `src/components/Footer.tsx`:
- Manter apenas os ícones (`<Youtube />`, `<Instagram />`) nos links sociais, removendo o texto adjacente.
- Manter o link "Loja Samkhya" intacto (ícone + texto).
- Ajustar o `gap` da coluna de socials para ficar visualmente equilibrado com só os ícones.
- Adicionar `aria-label` em cada link para acessibilidade ("YouTube", "Instagram").

### 2. Footer — versão mobile mais compacta
Em `src/components/Footer.tsx`:
- Reduzir paddings verticais no mobile: `py-10` → `py-6 md:py-10`.
- Reduzir gaps: `gap-8` → `gap-5 md:gap-8`; `mt-8 pt-6` → `mt-5 pt-4 md:mt-8 md:pt-6`.
- Reduzir tamanho do logo no mobile (h-10 md:h-12).
- Tagline e copyright com `text-xs` no mobile.

### 3. Aba Akasha (mobile) — chat com rolagem isolada
Investigar `src/components/meudosha/AkashaTab.tsx` para entender a estrutura atual do chat. Objetivo:
- Garantir que a área de mensagens tenha sua própria altura limitada (ex.: `max-h-[calc(100vh-Xpx)]`) e `overflow-y-auto` próprio, para que a rolagem do chat não force a rolagem da página inteira no mobile.
- Fixar o input/textarea de envio na base do container do chat (sticky bottom dentro do container, não da viewport, para não conflitar com o footer reduzido).
- Reduzir paddings/espaçamentos internos do chat no mobile para ganhar área útil.
- Considerar `overscroll-contain` na lista de mensagens para evitar "bounce" arrastando a página.

### Arquivos afetados
- `src/components/Footer.tsx` (itens 1 e 2)
- `src/components/meudosha/AkashaTab.tsx` (item 3) — exato ajuste depende de ler o arquivo na implementação.

### Fora de escopo
- Mudanças em outras abas, lógica de negócio do chat, ou no Header.
