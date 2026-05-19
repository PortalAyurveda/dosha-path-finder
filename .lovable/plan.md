## Problema identificado

**1. Akasha · Sessões mostra 0 mesmo havendo dados**
A tabela `auditoria_rag` tem RLS habilitado mas **sem nenhuma policy** → o client autenticado (anon/admin via JWT) recebe sempre 0 linhas. Conferi no banco: hoje há 1 entrada e nos últimos 7 dias há 283 entradas, mas o frontend não consegue ler.

**2. Distribuição dosha está agrupando errado**
Hoje o código junta tudo que não é "puro" no bucket "Outro" (60%). Os 6 doshas reais nos últimos 7 dias são: Vata (41), Vata-Pitta (42), Vata-Kapha (31), Pitta-Kapha (13), Kapha (8), Pitta (8).

## Correções

### A) Criar policy de leitura admin em `auditoria_rag`
Migration para permitir admins lerem (mantém escrita pelo service_role do n8n intacta):
```sql
CREATE POLICY "admins_read_auditoria_rag" ON public.auditoria_rag
FOR SELECT TO authenticated USING (is_admin());
```

### B) Ajustar `useAkashaHoje` em `src/hooks/useAdminDashboard.ts`
- Cada linha de `auditoria_rag` = 1 mensagem (independente de usuário).
- "Sessões" = nº de `email_aluno` distintos (apenas como métrica secundária, opcional).
- Usar `count: exact, head: true` para a contagem de mensagens (rápido, sem trazer payload).

### C) Ajustar `useTestesRange` em `src/hooks/useAdminDashboard.ts`
Distribuição com 6 buckets fixos:
- `vata`, `pitta`, `kapha`, `vata_pitta`, `vata_kapha`, `pitta_kapha`
- Match normalizando lowercase e separadores (-, espaço).

### D) Substituir barra única no `AdminDashboard.tsx`
Trocar a barra horizontal "Vata/Pitta/Kapha/Outro" por uma **lista compacta com 6 linhas**, cada uma com:
- bolinha colorida do dosha (cor monodosha para puros; gradiente/duas cores para bidoshic)
- nome + contagem + percentual + mini barra de progresso individual

Mantém o card "Distribuição dosha · últimos 7 dias (N testes)" no mesmo lugar.

## Arquivos afetados
- nova migration (policy SELECT admin em `auditoria_rag`)
- `src/hooks/useAdminDashboard.ts` (useAkashaHoje + useTestesRange)
- `src/pages/AdminDashboard.tsx` (card de distribuição → lista de 6)