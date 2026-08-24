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
- **Tokens próprios**: `src/components/samkhya/tokens.ts` é a FONTE ÚNICA de cor e fonte da loja. NÃO misturar com tokens do portal.
- **Paleta 2026**: roxo profundo `#581C50` (barra do menu, títulos, logo), laranja `#C75100` (destaques, preços, botões; texto pequeno usa `#8F3B00`), creme `#E0DCAF` (fundo das páginas), cards brancos com borda `#C9C494`, ouro `#D9933D` (selos, linha GOLD, badge do carrinho; texto `#8B5A16`), texto corpo verde escuro `#384026` / secundário `#5F674E`, rosa de apoio `#B55474`.
- **APOSENTADO**: o roxo/ouro antigo (`#7b4963` / `#C8922A` / fundo `#FAF8F5`) não deve voltar em nada da loja.
- **Tipografia**: `Acid Green` (títulos, logo, nomes de produto, preços em destaque) e `Brandon Grotesque` (corpo, navegação, botões). `@font-face` em `src/components/samkhya/samkhya-fonts.css` (assets CDN, font-display swap), importado por `SamkhyaLayout` e `CartDrawer`. Usar sempre `samkhyaTokens.fonteTitulo` / `fonteCorpo` — nunca pilhas cravadas.
- **Portal segue intocado**: `#352F54`, Roboto Serif + DM Sans, `index.css`/`tailwind.config.ts` fora do escopo da loja.
- **Layout**: `SamkhyaLayout` renderiza dentro do `Layout` global → Header do portal continua no topo, depois SamkhyaHeader (logo + banner) e SamkhyaNavBar (sticky, fundo roxo).

## Rotas

- `/samkhya` (`?cat=todos|vata|pitta|kapha|kits`, hash `#kits`)
- `/samkhya/produto/:slug`
- `/samkhya/kits/:slug`

## Checkout

Apenas WhatsApp (`5511998076111`) nesta fase. Botão Stripe existe mas desabilitado (campo `stripe_price_id` vazio no banco). Carrinho/admin/reviews → fase 2.

## Banner do elefante

Asset não fornecido → `SamkhyaHeader` mostra placeholder neutro. Quando chegar, importar de `src/assets/` e passar como prop `bannerUrl` para `SamkhyaLayout`.
