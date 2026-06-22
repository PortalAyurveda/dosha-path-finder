# Loja Samkhya — Documentação técnica

Seção de e-commerce do Portal Ayurveda dedicada à venda de produtos da marca Samkhya. Loja completa e operacional com carrinho, checkout Stripe, cálculo de frete, cupons e emissão de NF-e.

Última atualização: junho/2026. Esta doc reflete o estado real em produção.

## Rotas (definidas em `src/App.tsx`)

| Rota | Componente | Função |
|---|---|---|
| `/samkhya` | `src/pages/Samkhya.tsx` | Página principal — grid de produtos + kits |
| `/samkhya/produto/:slug` | `src/pages/SamkhyaProduto.tsx` | Página individual de produto |
| `/samkhya/kits` | `src/pages/SamkhyaKits.tsx` | Lista de kits |
| `/samkhya/kits/:slug` | `src/pages/SamkhyaKit.tsx` | Página individual de kit |
| `/samkhya/todos` | `src/pages/SamkhyaTodos.tsx` | Todos os produtos |
| `/samkhya/categoria/:slug` | `src/pages/SamkhyaCategoria.tsx` | Produtos por categoria |
| `/samkhya/obrigado` | `src/pages/SamkhyaObrigado.tsx` | Página pós-compra (recebe `?session_id=`) |

O carrinho **não é uma rota** — é um drawer global (`CartDrawer`) montado no `App.tsx`, controlado pelo `CartContext`. Não existe rota `/carrinho`.

## Carrinho e Checkout

### Fluxo completo

1. Cliente adiciona itens → `CartContext` guarda no estado (persiste no navegador)
2. Abre o drawer (`CartDrawer.tsx`) → etapa "cart"
3. Calcula frete (CEP) → edge function `calcular-frete` (MelhorEnvio)
4. Aplica cupom opcional → edge function `validar-cupom`
5. Avança para etapa "checkout" → preenche dados (nome, email, tel, CPF, endereço)
6. ViaCEP autopreenche endereço pelo CEP
7. "Finalizar compra" → edge function `create-checkout` → redireciona para Stripe
8. Stripe processa → `success_url = /samkhya/obrigado`, `cancel_url = /samkhya?checkout=cancelado`
9. `stripe-webhook` recebe o evento → cria o pedido em `loja.pedidos`

**Retorno de checkout cancelado:** quando o cliente desiste no Stripe, ele volta para `/samkhya?checkout=cancelado`. A página detecta o parâmetro e reabre automaticamente o `CartDrawer` com um toast "Seus itens continuam aqui". Também há fallback via `document.referrer` (qualquer URL `stripe.com`).

### Componente principal

`src/components/loja/CartDrawer.tsx` — drawer com duas etapas (cart/checkout). Faz:

- Validação de CPF (algoritmo completo), máscaras de CEP/CPF/telefone
- Cálculo de frete e seleção de opção
- **Frete grátis**: quando subtotal ≥ mínimo (`useFreteGratisConfig`, padrão R$350) OU cupom `frete_grátis`, consolida em linha única "Samkhya Frete Grátis"
- **Cupom**: validação via edge function, auto-aplica cupom pessoal do usuário logado
- Pré-preenche dados do usuário logado (sem sobrescrever edições)

### Contextos

- `src/contexts/CartContext.tsx` — estado do carrinho (itens, abrir/fechar, subtotal)
- `src/contexts/UserContext.tsx` — usuário, perfil, resultado do dosha

### Métodos de pagamento

Habilitados no `create-checkout`: **cartão** e **boleto**.

**Pix**: ainda NÃO habilitado (Stripe não liberou para a conta). Quando liberar, adicionar `params.append('payment_method_types[]', 'pix')` no `create-checkout` — o resto do fluxo já está pronto.

- Cartão: pago na hora → pedido criado como `pago`
- Boleto: 2 etapas → criado como `aguardando_pagamento`, depois `payment_intent.succeeded` atualiza para `pago`

A maioria das compras é feita **sem login** (visitante). Login não é obrigatório.

## Edge Functions (Supabase)

| Função | `verify_jwt` | Papel |
|---|---|---|
| `create-checkout` | true | Cria sessão de checkout no Stripe. Lê itens/frete/cupom, monta `line_items`, salva tudo em `metadata`. `cancel_url = /samkhya?checkout=cancelado`. |
| `stripe-webhook` | false | Recebe eventos do Stripe. Cria pedido em `loja.pedidos`. Valida assinatura HMAC. Trata frete grátis, duplicatas, detecta método de pagamento |
| `calcular-frete` | true | Cota frete via MelhorEnvio por CEP/peso |
| `validar-cupom` | false | Valida cupom (escopo loja), calcula desconto |
| `enviar-melhorenvio` | true | Adiciona pedido ao carrinho do MelhorEnvio para gerar etiqueta |

### Pontos críticos do `stripe-webhook` (v31+)

- **Proteção de tipos**: `toIntOrNull()` para `frete_servico_id` e `frete_prazo_dias` (integer); `toNumOrZero()` para `frete_valor`/`desconto` (numeric). Frete grátis pode mandar `"gratis"`/`null` — tudo é convertido com segurança.
- **Anti-duplicata**: verifica `maybeSingle()` antes de inserir + captura erro de unique constraint. Eventos `checkout.session.completed` e `payment_intent.succeeded` chegam quase juntos no boleto.
- **Detecção de método**: infere boleto (não-pago) vs card/pix (pago) pelo contexto.
- **Assinatura**: verifica HMAC SHA-256 com `STRIPE_WEBHOOK_SECRET`.

## Banco de dados

### Schema `loja` (catálogo)

- `loja.produtos` — 16 produtos. Campos: `slug`, `nome_display`, `preco_normal`, `preco_pix`, `peso_gramas`, `imagem_url`, `imagens` (text[]), `stripe_price_id`, `bling_produto_id`, `custo_producao` (15% do preço, p/ NF-e de brinde), `samkhya_id` (→ `public.samkhya`)
- `loja.categorias` — vata, pitta, kapha, detox, rasayana, gold
- `loja.produto_categorias` — vínculo M:N
- `loja.kits` / `loja.kit_itens` — kits e seus produtos
- `public.samkhya` — conteúdo clínico (colunas acentuadas: `"O que é"`, `"Indicações"`, `"Posologia"`, `"Efeitos esperados"`)

### Pedidos

`loja.pedidos` — campos: dados do comprador, `endereco_entrega` (jsonb), `itens` (jsonb), `subtotal`/`frete_valor`/`total`, `stripe_session_id`/`stripe_payment_intent_id` (unique), `metodo_pagamento`, `frete_servico`/`frete_servico_id`/`frete_prazo_dias`, `frete_melhorenvio_cart_id`, `frete_codigo_rastreio`, `frete_entregue_at`, `bling_pedido_id`, `nfe_*`, `cupom_*`, `status`, `status_pagamento`, `paid_at`

`numero_pedido` gerado por trigger `BEFORE INSERT` (formato `SAM-XXXX`)

- Status: `aguardando_pagamento` → `pago` → `entregue` (ou `cancelado`, `processando`)
- `status_pagamento`: `pending` → `paid`

### Triggers de pedido

- `pedido_notify_n8n` (AFTER INSERT) — dispara email via n8n conforme status (`aguardando_pagamento` → email com boleto; `pago` → confirmação)
- `pedido_notify_n8n_update` (AFTER UPDATE quando vira `'pago'`) — dispara email de confirmação quando boleto é pago
- A função `notify_pedido_n8n()` decide o tipo de email; não há duplicação

### Exposição REST

Schema `loja` adicionado a `pgrst.db_schemas`. Todas as tabelas `loja.*` têm RLS com leitura pública; UPDATE restrito a admin.

### Cliente Supabase dedicado

`src/integrations/supabase/loja-client.ts` exporta `lojaSupabase` (`db.schema='loja'`). Use para catálogo. Para conteúdo clínico (`public.samkhya`) use o cliente padrão `supabase`.

## Integrações externas

- **Stripe** — checkout e pagamento (cartão + boleto)
- **MelhorEnvio** — cálculo de frete + geração de etiqueta + rastreio (token `"portal"`, válido até 06/2027). Workflow n8n de rastreio dispara emails (rastreio/entregue)
- **Bling** — emissão de NF-e via workflow n8n `bling-nfe` (com auto-refresh de token OAuth). Suporta brinde (usa `custo_producao` + sem NF-e automática)
- **n8n** — orquestra emails (webhook `samkhya-pedido`) e NF-e (webhook `bling-nfe`). Self-hosted em `n8n.portalayurveda.com`
- **Brevo** — envio dos emails transacionais

## Painel administrativo

| Rota | Função |
|---|---|
| `/admin/loja` | Editar produtos e kits (preços, imagens, descrições) |
| `/admin/loja/vendas` | Lista de pedidos, marcar como pago, enviar MelhorEnvio, marcar brinde |
| `/admin/loja/vendas/:id` | Detalhe do pedido, enviar email manual |
| `/admin/estoque` | Gestão de produção/estoque Samkhya |
| `/admin/cupons` | Gestão de cupons |

Todas restritas a role `admin` (via `AdminRoute`).

## Identidade visual

Tokens em `src/components/samkhya/tokens.ts`. Roxo `#7b4963`, ouro `#C8922A`, fundo `#FAF8F5`. Tipografia serif (Georgia) para títulos/logo. **NÃO usar tokens do Portal.**

## Pendências / Fase futura

- **Pix**: aguardando liberação do Stripe
- **Recuperação de boleto**: cliente sem login não tem como voltar e repagar o boleto (proposta: salvar `boleto_url`, mandar no email, página pública de status)
- **Área do cliente**: não existe histórico de pedidos para o comprador (maioria compra sem conta)
- **Reviews/avaliações**: não implementado
