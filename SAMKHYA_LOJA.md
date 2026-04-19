# Loja Samkhya — Documentação técnica

Seção independente do Portal Ayurveda dedicada à venda de produtos da marca Samkhya.

## Rotas

| Rota | Componente | Função |
|------|-----------|--------|
| `/samkhya` | `src/pages/Samkhya.tsx` | Página principal — grid de produtos + seção de kits |
| `/samkhya/produto/:slug` | `src/pages/SamkhyaProduto.tsx` | Página individual de produto |
| `/samkhya/kits/:slug` | `src/pages/SamkhyaKit.tsx` | Página individual de kit |

A categoria ativa do grid é controlada pelo query param `?cat=todos|vata|pitta|kapha|kits`.
A seção de kits tem âncora `#kits`.

## Banco de dados

As tabelas do catálogo vivem no schema `loja` (não em `public`):

- `loja.produtos` — 16 produtos (samkhya_id aponta para `public.samkhya`)
- `loja.categorias` — 6 categorias: vata, pitta, kapha, detox, rasayana, gold
- `loja.produto_categorias` — vínculo M:N
- `loja.kits` — 11 kits com `tipo_kit`: anti_dosha, mini_kit, especial, viagem
- `loja.kit_itens` — produtos de cada kit, com `quantidade` e `nota`
- `public.samkhya` — conteúdo clínico (colunas com nomes acentuados/com espaços: `"O que é"`, `"Indicações"`, `"Posologia"`, `"Efeitos esperados"`)

### Exposição na API REST

O schema `loja` foi adicionado a `pgrst.db_schemas` via migration. Sem isso o cliente Supabase devolveria "schema not found".

```sql
ALTER ROLE authenticator SET pgrst.db_schemas = 'public,graphql_public,loja';
```

Todas as tabelas `loja.*` têm RLS habilitado com policy de leitura pública.

## Cliente Supabase dedicado

`src/integrations/supabase/loja-client.ts` exporta `lojaSupabase`, configurado com `db.schema = 'loja'`. Use-o para qualquer query no catálogo:

```ts
import { lojaSupabase } from "@/integrations/supabase/loja-client";

const { data } = await lojaSupabase
  .from("produtos")
  .select(`*, produto_categorias ( categorias ( slug, nome ) )`)
  .eq("ativo", true)
  .order("ordem_exibicao");
```

Para conteúdo clínico (schema public, colunas acentuadas) continue usando o cliente padrão `supabase`:

```ts
const { data } = await supabase
  .from("samkhya")
  .select(`"O que é", "Indicações", "Posologia", "Efeitos esperados"`)
  .eq("id", produto.samkhya_id);
```

## Identidade visual

Tokens em `src/components/samkhya/tokens.ts`. Não usar tokens do Portal Ayurveda — a loja tem identidade própria.

| Token | Cor | Uso |
|-------|-----|-----|
| `roxo` | `#7b4963` | Logo, menu, títulos serif |
| `roxoDark` | `#5c3249` | Hover do menu |
| `roxoLight` | `#f3eaf0` | Background suave de seção |
| `ouro` | `#C8922A` | Botões de compra, preço pix |
| `ouroDark` | `#A67420` | "no Pix" texto |
| `fundo` | `#FAF8F5` | Fundo geral |
| `cardBg` | `#FFFFFF` | Cards |
| `cardBorder` | `#EDE4D3` | Borda dos cards |
| `texto` | `#2C1A0E` | Texto principal |
| `textoSec` | `#6B4C2A` | Texto secundário |
| `goldBadge` | `#8B6914` | Badge "GOLD" |

Tipografia serif (Georgia / Times New Roman) para títulos e logo. Texto corrido herda o sans-serif do portal.

## Componentes (`src/components/samkhya/`)

- `SamkhyaLayout` — wrapper das rotas `/samkhya/*`. Aplica fundo, header e nav. Renderiza dentro do `Layout` global do portal (Header global do portal continua no topo).
- `SamkhyaHeader` — logo + slot opcional `bannerUrl` para o banner do elefante.
- `SamkhyaLogo` — texto "samkhya" serif lowercase OU `<img src={logoUrl} />` quando fornecido.
- `SamkhyaNavBar` — segundo menu sticky, fundo `roxo`, links via query param `?cat=`.
- `ProdutoCard` — card reutilizável com badge GOLD condicional.
- `KitCard` — card de kit com badge de tipo.
- `PrecoDisplay` — preço normal riscado, preço pix em ouro, parcelas opcionais (`precoNormal / 3`).
- `BotaoWhatsApp` — verde, link para `wa.me/5511998076111` com mensagem dinâmica.
- `BotaoStripe` — desabilitado, tooltip "Em breve — pagamento via Stripe".
- `AcordeoConteudo` — 4 seções: O que é, Para quem é, Como usar, O que esperar.

## WhatsApp

Número fixo: `5511998076111`. Mensagem: `Olá! Tenho interesse: {nome_display}` (URL encoded).

## Login

Usa o sistema de auth existente do portal (`UserContext`, magic link). Não é necessário login para navegar ou comprar via WhatsApp.

## Fora de escopo (Fase 2)

- Carrinho de compras
- Checkout via Stripe (campo `stripe_price_id` existe mas está vazio)
- Painel administrativo
- Reviews / avaliações

## Banner do elefante

Quando o asset chegar:

1. Adicione a imagem em `src/assets/samkhya-banner-elefante.png` (ou similar)
2. Importe e passe como prop em `Samkhya.tsx`, `SamkhyaProduto.tsx`, `SamkhyaKit.tsx`:
   ```tsx
   import banner from "@/assets/samkhya-banner-elefante.png";
   <SamkhyaLayout bannerUrl={banner}>...</SamkhyaLayout>
   ```

Atualmente, o `SamkhyaHeader` mostra um placeholder neutro com texto "Banner em breve".
