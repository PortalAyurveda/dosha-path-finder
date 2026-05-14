# Auditoria: por que /metricas e /metricas/graficos estão vazias

## Causa raiz encontrada

As páginas fazem fetch direto via Supabase JS (com a chave anon) nas tabelas:
- `public.metricas_snapshot` (usada em `/metricas` via `useLatestDate` / `useSnapshot`)
- `public.portal_graficos` (usada em `/metricas/graficos` via `useGraficos`)

Ambas as tabelas:
- Têm dados (2.254 e 9 linhas, respectivamente)
- Têm **RLS habilitado** (`rowsecurity = true`)
- **Não têm nenhuma policy criada** (`pg_policies` retorna 0 linhas para elas)

Resultado: o Postgres bloqueia silenciosamente toda leitura para o role `anon` e devolve array vazio. Foi exatamente o que apareceu na rede:
`GET .../metricas_snapshot?...&order=data_calculo.desc&limit=1` → `[]`

Não é a função `akasha_evolucao_diaria` / `akasha_distribuicao_horas` (essas são `SECURITY DEFINER` e funcionam). Não é cache do Lovable. É RLS sem policy.

## Correção proposta

Criar policies públicas de SELECT (são tabelas de métricas agregadas, sem PII — mesma postura de `portal_conteudo` / `portal_lives`):

```sql
CREATE POLICY "metricas_snapshot leitura pública"
  ON public.metricas_snapshot FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "portal_graficos leitura pública"
  ON public.portal_graficos FOR SELECT
  TO anon, authenticated
  USING (true);
```

Mantém RLS ligado (sem regredir segurança), apenas autoriza leitura — escrita continua bloqueada por padrão.

## Verificação após aplicar

1. Recarregar `/metricas/graficos` → 9 cards renderizam
2. Recarregar `/metricas` → snapshot mais recente aparece
3. Conferir na aba Network que `metricas_snapshot` e `portal_graficos` retornam linhas em vez de `[]`

## Não vou tocar

- Frontend (`MetricasGraficos.tsx`, `useMetricasData.ts`) — está correto
- RPCs de Akasha — funcionam
- Outras tabelas
