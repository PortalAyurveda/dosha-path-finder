## Alinhar rodapé do banner com o card da direita

Hoje a coluna esquerda (preview + banner) tem altura "natural" e fica maior que o card da direita, então o banner ultrapassa a linha de baixo. Precisamos forçar a coluna esquerda a ter exatamente a mesma altura do card da direita e fazer o banner se acomodar dentro do espaço restante.

### Mudanças em `src/components/home/Hero.tsx`

1. **Grid `items-stretch`** (em vez de `items-start`) para que ambas as colunas tenham a mesma altura.

2. **Coluna esquerda em flex coluna com `h-full`**, para ocupar toda a altura do grid.

3. **Card de preview** mantém altura natural (não cresce).

4. **Banner ocupa o espaço restante** com `flex-1 min-h-0` e a `<img>` usando `h-full w-auto max-w-full object-contain mx-auto`. Assim:
   - Se sobra altura suficiente, o banner aparece com a largura desejada (`max-w-[calc(36rem+28px)]`).
   - Se sobra menos altura, ele encolhe proporcionalmente (mantém o aspecto), mas o **rodapé fica exatamente alinhado** com o card da direita.

5. Manter o offset `-mx-[14px]` aplicado no wrapper do banner (não no `<img>`) para preservar o alinhamento visual com o card de cima quando há espaço.

### Trade-off transparente

Como a aspect-ratio do banner é fixa, garantir simultaneamente "mesma largura do card de cima" + "rodapé colado no card da direita" só é possível se a altura do card direito comportar isso. Quando não comporta, o banner encolhe um pouco (largura aparente diminui), mas o rodapé fica alinhado — que é o que o usuário pediu agora.

### Arquivo
- `src/components/home/Hero.tsx` (apenas classes do grid e do bloco do banner).
