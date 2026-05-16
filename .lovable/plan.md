## Próximos Passos — uniformizar ícones

**Problema:** Akasha parece maior porque os SVGs de Alimentação/Horários/Alquimia já trazem uma "moldura" circular colorida dentro do próprio arquivo, ocupando parte da área útil. Akasha não tem essa moldura, então o desenho ocupa o quadrado inteiro.

**Solução (apenas visual, em `src/components/meudosha/DiagnosticoCompleto.tsx`):**

1. Remover o prop `showRing` e o `tint` do `ProximoPassoCard` — nenhum card terá mais a rodela externa nem variação por dosha.
2. Renderizar os 4 ícones diretamente, sem container colorido, todos com o mesmo tamanho de caixa (ex: `w-16 h-16`, `object-contain`).
3. Manter a logo da Akasha um pouco maior dentro da mesma caixa (ela é o único sem padding interno no SVG) — ou aplicar um leve `scale-90` nela para compensar e igualar visualmente aos demais que já têm padding embutido.
4. Limpar props/variáveis não usadas (`tint`, `iconSize`, `showRing`, `corDosha` aqui).

Resultado: 4 ícones com mesma "footprint" visual, sem rodela, mesmo alinhamento.
