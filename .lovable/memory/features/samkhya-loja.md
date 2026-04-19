---
name: Loja Samkhya
description: Standalone e-commerce section at /samkhya — schema 'loja', dedicated client, own design tokens, WhatsApp checkout
type: feature
---

# Loja Samkhya

Seção independente em `/samkhya/*`. Documentação completa em `SAMKHYA_LOJA.md` na raiz.

## Pontos críticos

- **Schema dedicado**: tabelas em `loja.*` (não `public.*`). Schema exposto via `pgrst.db_schemas` (migration aplicada).
- **Cliente próprio**: `src/integrations/supabase/loja-client.ts` — `lojaSupabase` com `db.schema='loja'`. NÃO usar `supabase` padrão para tabelas da loja.
- **Conteúdo clínico**: vem de `public.samkhya` (colunas com acento e espaços: `"O que é"`, `"Indicações"`, `"Posologia"`, `"Efeitos esperados"`). Join via `produto.samkhya_id`. Usar cliente padrão.
- **Tokens próprios**: `src/components/samkhya/tokens.ts`. NÃO misturar com tokens do portal — identidade visual separada (roxo `#7b4963` + ouro `#C8922A` + fundo `#FAF8F5`).
- **Tipografia**: serif (Georgia) para títulos e logo. Sans herda do portal.
- **Layout**: `SamkhyaLayout` renderiza dentro do `Layout` global → Header do portal continua no topo, depois SamkhyaHeader (logo + banner) e SamkhyaNavBar (sticky, fundo roxo).

## Rotas

- `/samkhya` (`?cat=todos|vata|pitta|kapha|kits`, hash `#kits`)
- `/samkhya/produto/:slug`
- `/samkhya/kits/:slug`

## Checkout

Apenas WhatsApp (`5511998076111`) nesta fase. Botão Stripe existe mas desabilitado (campo `stripe_price_id` vazio no banco). Carrinho/admin/reviews → fase 2.

## Banner do elefante

Asset não fornecido → `SamkhyaHeader` mostra placeholder neutro. Quando chegar, importar de `src/assets/` e passar como prop `bannerUrl` para `SamkhyaLayout`.
