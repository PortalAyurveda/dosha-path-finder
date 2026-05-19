# Edge function de saúde + correção da tabela de testes

## 1. Correção: tabela de testes

`doshas_registros2` está parada desde abril. A tabela ativa é `doshas_registros` (143 testes nos últimos 7d, último hoje).

**Edit em `src/hooks/useAdminDashboard.ts`:**
- `useTestesRange` → trocar `doshas_registros2` por `doshas_registros` (count e distribuição dosha).
- `useConversaoTesteAssinatura` → trocar `doshas_registros2` por `doshas_registros`.

Nada muda na UI nem no schema.

## 2. Edge function `admin-system-health`

Consigo sim. A via é a **Management API do Supabase** (que cobre logs do Logflare), via uma edge function que segura o token. Da browser direto não dá — precisa do token do dono da conta.

### Requisito: 1 secret novo
- **`SUPABASE_ACCESS_TOKEN`** — Personal Access Token criado em https://supabase.com/dashboard/account/tokens. Vou pedir via add_secret depois de você aprovar o plano. (Sem isso a função retorna `{ disponivel: false }` e os cards mostram "configurar token").

### O que a function retorna
Chama `GET https://api.supabase.com/v1/projects/{ref}/analytics/endpoints/logs.all?sql=...` rodando 4 queries (window: 24h):

| Métrica | SQL (Logflare) |
|---|---|
| `edgeErrors` | `select count(*) from function_edge_logs cross join unnest(metadata) m cross join unnest(m.response) r where r.status_code >= 500 and timestamp > timestamp_sub(current_timestamp(), interval 24 hour)` |
| `edgeTopFn` | mesma query agrupando por `m.function_id` + `order by 2 desc limit 1` |
| `dbErrors` | `select count(*), any_value(event_message) from postgres_logs cross join unnest(metadata) m cross join unnest(m.parsed) p where p.error_severity in ('ERROR','FATAL') and timestamp > timestamp_sub(current_timestamp(), interval 24 hour)` |
| `authFailures` | `select count(*) from auth_logs cross join unnest(metadata) m where m.status >= '400' and timestamp > timestamp_sub(current_timestamp(), interval 24 hour)` |

Resposta:
```json
{
  "disponivel": true,
  "janelaHoras": 24,
  "edge": { "erros5xx": 3, "topFunction": "create-subscription-checkout" },
  "db":   { "erros": 12, "ultimaMensagem": "duplicate key value..." },
  "auth": { "falhas": 45 },
  "geradoEm": "2026-05-19T..."
}
```

### Segurança
- `verify_jwt = false` (padrão Lovable), valida no código:
  - Lê `Authorization: Bearer <jwt>` → `supabase.auth.getClaims(token)` → pega `sub` (user id).
  - Chama RPC `is_admin()` no banco (ou consulta `perfis.role='admin'`).
  - Não-admin → 403.
- `SUPABASE_ACCESS_TOKEN` fica só no servidor.
- Cache em memória de 60s pra não bater na Management API a cada render.
- CORS habilitado.

## 3. Frontend

**Novo hook em `useAdminDashboard.ts`:**
- `useSystemHealth()` → `supabase.functions.invoke('admin-system-health')`. `staleTime: 60_000`, `refetchInterval: 5min`.

**Edit em `AdminDashboard.tsx`:**
- Na seção "Saúde do sistema", adicionar 3 cards à frente dos atuais:
  - **Erros edge (24h)** — vermelho se > 5, amarelo 1-5, verde se 0. Sublabel = top function que errou.
  - **Erros banco (24h)** — vermelho > 10. Sublabel = última mensagem (truncada).
  - **Falhas auth (24h)** — só amarelo se > 50 (login errado é normal).
- Se `disponivel: false` (token não configurado), os 3 cards viram um único aviso com link pra criar o token.

## Arquitetura técnica

**Novos arquivos:**
- `supabase/functions/admin-system-health/index.ts`

**Edits:**
- `src/hooks/useAdminDashboard.ts` — fix tabela testes + novo `useSystemHealth`
- `src/pages/AdminDashboard.tsx` — 3 cards novos na seção

## Fora do escopo
- Sem mudança no schema.
- Sem alertas por e-mail/push.
- Não vou criar UI pra editar/rotacionar o token (gerencia no Supabase dashboard).

## Pergunta
Topa eu já criar a edge function e te pedir o `SUPABASE_ACCESS_TOKEN` na sequência, ou quer que eu deixe a function pronta primeiro pra você revisar antes de gerar o token?