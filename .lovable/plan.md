

## Adicionar Vídeos do YouTube ao Content Hub

### O que muda
Adicionar uma nova aba **"Vídeos"** no Content Hub com vídeos do YouTube embeddados inline usando iframes.

### Implementação em `src/components/home/ContentHub.tsx`

1. **Nova interface `VideoMock`** com `id`, `title`, `youtubeId` e `tag`

2. **Array de vídeos mock** com 3-4 vídeos do canal Portal Ayurveda (usando IDs placeholder até você fornecer os reais)

3. **Nova aba "Vídeos"** no `TabsList` com ícone `Play` do lucide-react

4. **Componente `VideoCard`** — card no formato Folha com:
   - `iframe` embed do YouTube (aspect-ratio 16/9, lazy loading)
   - Título abaixo do player
   - Badge de tag

5. **Filtro atualizado** — a aba "Recentes" mostra artigos + vídeos misturados; a aba "Vídeos" filtra só vídeos

### Detalhes técnicos
- Iframe com `allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"` e `allowFullScreen`
- `loading="lazy"` para performance
- Grid responsivo: 1 col mobile → 2 cols tablet → 3 cols desktop (vídeos são maiores que cards de artigo)
- Sem dependências externas — apenas iframe nativo do HTML5

