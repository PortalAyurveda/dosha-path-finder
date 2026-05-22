## Objetivo

Reescrever a fonte de dados da página `/admin/vendas-akasha` para usar exclusivamente `user_profiles` (onde `is_premium = true`), removendo a dependência da tabela `assinaturas`.

## Mudanças em `src/pages/AdminVendasAkasha.tsx`

### 1. Nova query (substitui o select de `assinaturas`)

```ts
supabase
  .from("user_profiles")
  .select("nome, nome_completo, email, subscription_status, premium_since, premium_until, is_premium")
  .eq("is_premium", true)
  .order("premium_since", { ascending: false, nullsFirst: false });
```

### 2. Derivação do plano (mensal vs anual)

Para cada registro, calcular a diferença em meses entre `premium_until` e `premium_since`:

- Se `>= 12 meses` (ou ~360 dias) → `anual`, valor R$ 597,00
- Caso contrário → `mensal`, valor R$ 79,90
- Se `premium_until` ou `premium_since` faltarem → fallback `mensal`

Helper local `derivarPlano(premium_since, premium_until)` retornando `{ plano: "mensal"|"anual", valor: number }`.

### 3. Colunas da tabela

| Coluna | Origem |
|---|---|
| Data | `premium_since` (formatado pt-BR) |
| Nome | `nome_completo ?? nome ?? "—"` |
| Email | `email` |
| Plano | badge derivado (`planoBadge`) |
| Valor | `formatBRL(valor derivado)` |
| Status | `subscription_status` via `statusBadge` |

### 4. Cards do topo

- **Assinantes ativos** = `count(is_premium && subscription_status === "active")`
- **Total de assinaturas** = `data.length` (todos com `is_premium = true`)
- **MRR** = `mensaisAtivos * 79.9 + anuaisAtivos * 49.75` (apenas entre os ativos, mesma fórmula atual mas usando o plano derivado)

### 5. Limpeza

- Remover a interface `Assinatura` antiga e o tipo de retorno baseado em `assinaturas`.
- Manter o painel "Ativar Premium Manualmente" intacto (já escreve em `user_profiles`); `loadAssinaturas` continua sendo chamado após ativação para refletir o novo premium.
- Remover o insert em `assinaturas` que foi adicionado no fluxo de ativação manual (não é mais necessário, já que a tabela lê de `user_profiles`).

## Fora de escopo

- Schema do banco, webhooks, RLS — sem mudanças.
- Página `/admin/assinaturas` ou outras páginas que possam ler de `assinaturas`.
