## Mudanças

**1. `src/components/home/MetricasMiniBanner.tsx`**
- Remover a linha "Métricas calculadas diariamente com base no nosso banco de dados." (rodapé do banner)
- Remover também o padding/margem extra do container que ficaria sobrando, para que o banner encolha em altura.

**2. `src/components/home/Hero.tsx` (coluna da direita — formulário "Comece seu Teste de Dosha Gratuito")**

Hoje o card usa `justify-center` + `h-full`, então quando a coluna esquerda é alta ele estica e sobram faixas brancas no topo e no rodapé. Ajustes:

- Trocar `justify-center` por `justify-between` no card, OU remover `h-full` e deixar o card com altura natural alinhado ao topo.
- Reduzir o padding vertical interno (`p-6 xl:p-8` → `p-6 xl:p-7`) e o `space-y-5` se necessário, para o card respirar sem ficar vazio.
- Diminuir levemente o botão "Começar" (`py-7 md:py-8` → `py-5 md:py-6`) já que ele estava exagerado no desktop ocupando o espaço vazio.

Resultado esperado: banner da esquerda mais baixo (sem a frase), e card da direita sem faixas brancas a esmo no topo/rodapé, com proporções equilibradas no desktop. Mobile permanece igual em comportamento.

Nenhuma mudança de lógica/funcionalidade — apenas presentation.
