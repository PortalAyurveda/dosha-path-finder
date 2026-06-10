---
name: Frete grátis Samkhya
description: Regras de frete grátis da loja, schema de configuração e per-produto, integração frontend/edge function
type: feature
---

# Frete grátis na loja Samkhya

Padrão: **frete grátis acima de R$ 350**. Limiar é configurável no banco — NÃO hardcodar.

## Schema

- `loja.config_frete` (singleton, `id=1`): `frete_gratis_ativo bool`, `frete_gratis_minimo numeric`. Leitura pública (RLS), UPDATE só admin via `public.is_admin()`.
- `loja.produtos.frete_gratis_sempre bool default false` — quando true, o produto força frete grátis no carrinho independente do subtotal. **Edge function `calcular-frete` ainda não respeita essa coluna nem lê `config_frete`** — está com R$350 hardcoded. Atualizar quando for criar o admin UI.

## Frontend

- Hook `src/hooks/useFreteGratisConfig.ts` — lê `loja.config_frete` via `lojaSupabase`, com defaults `{ ativo: true, minimo: 350 }`. TanStack Query staleTime 10min.
- `CartDrawer`:
  - Envia `frete_gratis_cupom: boolean` no body do `calcular-frete` (true só se `cupomAplicado.tipo_desconto === 'frete_gratis'`, tipo não existe ainda).
  - Auto-seleciona opção com `id === 'gratis'` ou `frete_gratis: true`.
  - Banner verde "🎉 Seu pedido tem frete grátis!" acima das opções quando alguma é grátis.
  - Banner de progresso no topo do carrinho: "Faltam R$ X" com barra, ou "🎉 Frete grátis desbloqueado!" — só aparece se `frete_gratis_ativo`.
  - Resumo mostra "Grátis" em verde quando `preco === 0`.

## Pendências (próximas iterações)

1. Atualizar edge function `calcular-frete` para ler `loja.config_frete` e `produtos.frete_gratis_sempre`.
2. Admin UI em `/admin/loja` com toggle global + checkbox por produto.
3. Novo `tipo_desconto = 'frete_gratis'` em `loja.cupons` (frontend já envia a flag).
