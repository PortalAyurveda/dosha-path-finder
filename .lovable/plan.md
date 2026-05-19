# Ajustes no Dashboard /admin

## 1. Limpeza
- Remover do rodapé o link **"Ver métricas clínicas completas →"** (em `AdminDashboard.tsx`). Métricas clínicas são dos usuários, não do operador.

## 2. Confirmação das fontes atuais (sem mudança)
- **Testes feitos** → `doshas_registros2.created_at` (entradas novas de hoje / 7d). ✓
- **Akasha mensagens/sessões** → `chat_histories` filtrando por `data_hora` (msgs novas + `distinct session_id`). ✓

## 3. Nova seção: "Saúde do sistema"

Adicionar uma seção no final do dashboard (antes do rodapé) com cards de operação. Tudo via `supabase--analytics_query` chamado por uma edge function nova `admin-system-health` (não dá pra chamar essas tools direto do browser).

| Card | Fonte | O que mostra |
|---|---|---|
| **Erros nas Edge Functions (24h)** | `function_edge_logs` filtrando `status_code >= 500` | Total + nome da função que mais errou |
| **Erros do banco (24h)** | `postgres_logs` onde `error_severity in ('ERROR','FATAL')` | Total + última mensagem |
| **Falhas de login (24h)** | `auth_logs` onde `status >= 400` ou `level='error'` | Total + tipo mais comum (ex: invalid_credentials) |
| **Edge function mais lenta (24h)** | `function_edge_logs` média de `execution_time_ms` | Top 1 com tempo médio |
| **Auditoria RAG pendente** | `auditoria_rag` onde `akasha_status='pendente'` | Total que precisa revisão |
| **Mensagens da Akasha sem resposta?** | já temos "mensagens não-lidas" — manter |

Cada card vira verde / amarelo / vermelho conforme limiar (ex: erros 5xx > 10 em 24h = vermelho).

### Extras menores (cards rápidos, dados que já temos)
- **Novos usuários (hoje / 7d)** — `perfis.created_at`. Falta hoje no dashboard.
- **Conversão teste → assinatura (7d)** — `assinaturas` joinado por email com `doshas_registros2` da mesma janela. Útil pra ver se o teste tá puxando paid.
- **Top tag de agravamento da semana** — mais frequente em `agravVataTags/PittaTags/KaphaTags` dos testes de 7d. Mostra qual desequilíbrio dominou.

## Arquitetura técnica

**Nova edge function:** `supabase/functions/admin-system-health/index.ts`
- Recebe nada, retorna JSON `{ edgeErrors, dbErrors, authFailures, slowestFn, ragPendente }`.
- Internamente chama `supabase--analytics_query` (Logflare SQL) via API REST do projeto Supabase.
- Cache 2 min (responde com `Cache-Control` e/ou guarda em memória).
- Verifica `is_admin()` via JWT do caller — não exposta publicamente.

**Novo hook:** `useSystemHealth()` em `useAdminDashboard.ts` — chama a edge function via `supabase.functions.invoke('admin-system-health')`. Refetch a cada 5 min.

**Novos componentes:**
- `HealthCard.tsx` — card colorido com label + número grande + sub + ícone de status (✓ / ⚠ / ✗).

**Edits em `AdminDashboard.tsx`:**
- Remover o `<Link to="/metricas">` do rodapé.
- Adicionar seção `<Section title="Saúde do sistema">` com grid 2x3 de `HealthCard`.
- Adicionar 2 `StatCard` para "Novos usuários hoje" + "Conversão teste→assinatura".

## Fora do escopo
- Não vou criar tabela de tracking de erros próprios (logs já existem em Supabase analytics).
- Não vou criar alertas por e-mail/push — só visualização.
- Sem mudanças de auth/RLS.

## Pergunta antes de implementar
Quer todas as 3 categorias da seção "Saúde do sistema" (erros + extras + conversão), ou prefere começar só com os 4 cards de erro/auditoria e a gente vê o resto depois?