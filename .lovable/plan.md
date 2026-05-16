## Ajuste fino do banner no Hero

O banner já está com `max-w-xl` (mesmo do card acima), mas a imagem `banner-zero-sf300x.webp` tem **padding/margem branco embutido no próprio arquivo**, fazendo o conteúdo visível parecer mais estreito que o card de cima (~12px de cada lado).

Como não vamos editar o asset, a correção é **alargar visualmente a tag `<img>`** para compensar esse padding interno, mantendo o conteúdo central alinhado com as bordas do card.

### Mudança

Em `src/components/home/Hero.tsx`, no `<img>` do banner:

- Trocar `max-w-xl mx-auto` por uma largura ~28px maior que o card, usando estilo inline:
  ```
  className="w-[calc(100%+28px)] max-w-[calc(36rem+28px)] -mx-[14px] h-auto rounded-3xl object-contain"
  ```
  (`max-w-xl` = 36rem = 576px; vamos para 604px e usamos margem negativa de 14px para manter o centro alinhado).

- Remover `mx-auto` (substituído pela margem negativa simétrica).

Resultado: o conteúdo visível do banner passa a ter aproximadamente a mesma largura aparente que o card de preview acima.

### Pontos de atenção

- Não mexer em mais nada do hero.
- Se 14px não for suficiente, ajusto para 16-20px depois — é um número fácil de tunar.
- O `rounded-3xl` continua, mas como o asset já tem fundo claro, a borda arredondada não aparece visivelmente — é só uma salvaguarda.
