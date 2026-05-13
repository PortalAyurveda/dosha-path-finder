## Carrinho de Compras — Loja Samkhya

Implementação em 5 partes. Tudo client-side reaproveitando `lojaSupabase` (schema `loja`) e as Edge Functions `calcular-frete` e `create-checkout` (que assumo já estarem deployadas no Supabase — se não estiverem, preciso criá-las também; ver "Pontos a confirmar").

### 1. CartContext global

`src/contexts/CartContext.tsx` — Context + Provider + hook `useCart()`.

State persistido em `localStorage` (chave `samkhya:cart`) para sobreviver a refresh, com versionamento simples.

```ts
type CartItem = {
  id: number;
  slug: string;
  nome: string;
  preco_normal: number;
  preco_pix: number;
  stripe_price_id: string | null;
  imagem_url: string | null;
  peso_gramas: number;
  quantidade: number;
  tipo: 'produto' | 'kit';
};
```

API: `itens`, `adicionarItem(item)` (faz merge por `slug+tipo`), `removerItem`, `atualizarQuantidade`, `limparCarrinho`, `totalItens`, `subtotal`, `isOpen`, `abrirCarrinho()`, `fecharCarrinho()`.

Provider envolve `<Routes>` em `App.tsx` (dentro de `UserProvider`).

### 2. CartDrawer

`src/components/loja/CartDrawer.tsx` — usa o `Sheet` do shadcn (lado direito), tokens `samkhyaTokens`. Renderizado uma única vez dentro de `SamkhyaLayout` para estar disponível em toda `/samkhya/*`.

Estrutura interna por etapas (state local `step: 'cart' | 'checkout'`):

**Etapa carrinho:**
- Lista de itens: thumb, nome, controles `−` / qty / `+`, preço pix × qty, botão remover (ícone trash).
- Bloco frete: input de CEP (mask `00000-000`) + botão "Calcular frete". Loading state. Lista de opções retornadas como `RadioGroup` (nome transportadora, prazo, preço formatado). Persiste CEP no localStorage.
- Resumo: subtotal, frete selecionado, total. Botão "Continuar" (desabilitado até frete escolhido) que avança para `checkout`.
- Estado vazio: mensagem + CTA "Ver produtos".

**Etapa checkout (mesmo drawer):**
- Form com `react-hook-form` + zod: nome, email, telefone (mask), CPF (mask + validação dígitos), CEP (preenchido), logradouro, número, complemento, bairro, cidade, estado.
- Auto-preencher logradouro/bairro/cidade/estado via ViaCEP (`https://viacep.com.br/ws/{cep}/json/`) quando CEP muda. Cidade/estado read-only após preenchidos.
- Botão "Voltar" e "Finalizar compra" (chama `create-checkout`, mostra loading, `window.location.href = data.url`). Trata erro com toast (`sonner`).

**Chamadas Edge Function:**
```ts
const FUNCTIONS_URL = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.functions.supabase.co`;
// ou usar supabase.functions.invoke('calcular-frete', { body }) — mais limpo.
```
Vou usar `supabase.functions.invoke()` (cliente padrão `supabase`, schema `public`, mas para edge functions o schema não importa) — assim apikey e Authorization são injetados automaticamente.

### 3. "Adicionar ao carrinho" em produto e kit

Substituir o par `BotaoWhatsApp` + `BotaoStripe` em `SamkhyaProduto.tsx` e `SamkhyaKit.tsx` por:
- Botão primário "Adicionar ao carrinho" (estilo ouro, fullWidth) → chama `adicionarItem({...produto, tipo: 'produto', quantidade: 1})` e `abrirCarrinho()`.
- Manter `BotaoWhatsApp` como secundário ("Comprar pelo WhatsApp") — não foi pedido para remover, mas posso esconder se quiser. Ver "Pontos a confirmar".
- Remover `BotaoStripe` (substituído pelo carrinho).

Para kits: `tipo: 'kit'`, `nome: kit.nome`.

### 4. Ícone do carrinho no header da loja

Em `SamkhyaNavBar` (já é sticky e roxo, presente em `/samkhya/*`), adicionar à direita um botão com `<ShoppingBag />` (lucide) + badge circular com `totalItens` quando > 0. Click → `abrirCarrinho()`. Não mexer no `Header` global.

### 5. Página /samkhya/obrigado

`src/pages/SamkhyaObrigado.tsx`:
- Usa `SamkhyaLayout`.
- Mensagem central serif "Obrigado pela sua compra" + texto curto "Você receberá os detalhes por email."
- Botão "Voltar à loja" → `/samkhya`.
- `useEffect` → `limparCarrinho()` no mount.
- Rota adicionada em `App.tsx`: `<Route path="/samkhya/obrigado" element={<SamkhyaObrigado />} />`.
- A `success_url` configurada na edge function `create-checkout` deve apontar para essa rota (assumido).

---

### Detalhes técnicos

- **Persistência**: `localStorage` com try/catch. Hidratação no primeiro render do Provider via `useState(() => load())`.
- **Validação**: zod schemas para checkout form e CEP (8 dígitos numéricos).
- **Máscaras**: implementação inline simples (sem dep nova) para CEP/telefone/CPF. Validação CPF com cálculo dos dígitos verificadores.
- **Sem login obrigatório** — o carrinho funciona anônimo, alinhado com a fase atual da loja.
- **Tipagem**: `LojaProduto` e `LojaKit` em `loja-client.ts` já têm os campos necessários (`peso_gramas` confirmado no banco em ambas as tabelas).

### Pontos a confirmar antes de codar

1. **Edge functions já existem?** Não há `supabase/functions/` no projeto local. Você confirma que `calcular-frete` e `create-checkout` já estão deployadas no Supabase (provavelmente via outro caminho), ou preciso criá-las também? Se sim, preciso saber a integração de frete (Melhor Envio? token `MELHORENVIO_TOKEN` está nos secrets) e o fluxo Stripe (criar Checkout Session com `stripe_price_id` ou `price_data` dinâmico, dado que muitos produtos têm `stripe_price_id` vazio).
2. **Manter botão WhatsApp** ao lado do "Adicionar ao carrinho" nas páginas de produto/kit, ou remover de vez?
3. **Botão flutuante** do carrinho em mobile (FAB) ou só o ícone na navbar basta?
