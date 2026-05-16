## Substituir banner do Hero por card de 4 recursos

Substituir o `<img>` banner na coluna esquerda do Hero por um card construído em JSX, alinhado em largura com o card superior ("Faça o teste...") e com rodapé alinhado ao card da direita ("Seu guia completo...").

### Arquivo
- `src/components/home/Hero.tsx` — substituir apenas o bloco do `<img>` banner (linhas ~165-170).

### Estrutura do novo card
- Wrapper: `bg-card/80 backdrop-blur-sm rounded-3xl border border-border shadow-lg w-full max-w-xl mx-auto flex-1 min-h-0 flex items-stretch` (mesma largura/estilo do card de cima, mas com `flex-1` para esticar e alinhar rodapé com a coluna direita).
- Conteúdo interno: `grid grid-cols-4 divide-x divide-border w-full` para os 4 itens lado a lado com divisórias verticais finas.
- Cada item: `flex items-center gap-3 px-4 py-5` com ícone Lucide à esquerda (h-6 w-6) + bloco com título (texto pequeno, font-semibold, foreground) e subtítulo (text-xs, text-muted-foreground).

### Itens (ícone + título + subtítulo)
1. `Calendar` (índigo) — "Rotinas Diárias" / "Dinacharya personalizada"
2. `Play` (índigo) — "Artigos e Vídeos" / "Conteúdo atualizado diariamente"
3. `BookOpen` (índigo) — "Aulas Exclusivas" / "Escolha a próxima aula que quer no Portal"
4. `Brain` (terracota/salmon) — "Akasha, sua consultora" / "Assistente de Ayurveda 24h"

### Cores dos ícones
- Os 3 primeiros: `style={{ color: "#6B7FF2" }}` (token secondary do sistema, já usado no Hero).
- Akasha: `style={{ color: "#F28888" }}` (mesmo tom salmon usado nas decorações do Hero).

### Alinhamento (manter o que já funciona)
- Remover o offset `-mx-[14px]` e `max-w-[calc(36rem+28px)]` que existiam para compensar bordas da imagem — agora o card usa `max-w-xl` igual ao card superior, ficando naturalmente alinhado.
- Manter `flex-1 min-h-0` para que o card estique verticalmente e o rodapé alinhe com o card da direita (graças ao `items-stretch` do grid pai já existente).

### Acessibilidade
- Ícones decorativos com `aria-hidden`.
- Títulos em `<p>` semântico simples (não headings — não competem com o H1 do Hero).
