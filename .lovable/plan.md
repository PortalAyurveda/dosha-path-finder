# Admin · Revisões

Nova área em `/admin/revisoes` listando todas as revisões já realizadas pelos usuários, com ação de excluir.

## O que será criado

### 1. Nova rota: `/admin/revisoes`
- Protegida por `AdminRoute` (mesmo padrão dos outros admins).
- Adicionada em `src/App.tsx`.
- Link adicionado no `AdminNav.tsx` (ícone `RefreshCw` ou `History`).

### 2. Página `src/pages/AdminRevisoes.tsx`
Lista (tabela) ordenada por `updated_at` desc de `reteste_sessao` com `status = 'concluido'`.

Para cada linha, exibir:
- **Usuário** — `user_email` (e nome quando disponível via join com `doshas_registros.nome` do registro de origem)
- **Data do teste** — `created_at` do `doshas_registros` referenciado por `dosha_registro_origem_id`
- **Data da revisão** — `resultado->>'data_revisao'` (fallback `updated_at`)
- **Vata** — `vatascore_antes → vatascore_depois`
- **Pitta** — `pittascore_antes → pittascore_depois`
- **Kapha** — `kaphascore_antes → kaphascore_depois`
- **Agni** — `agniPrincipal` do teste → `resultado->>'agniNovo'`
- **Ações** — botão "Excluir" (ícone lixeira) com `AlertDialog` de confirmação

Como `resultado` é JSONB, os valores antes/depois vêm direto dele; o Agni anterior e a data do teste vêm de um `select` paralelo a `doshas_registros` por `dosha_registro_origem_id`. Busca feita com `useQuery`.

Filtro simples no topo: input de busca por email.

### 3. Exclusão
Ao confirmar:
- `DELETE FROM reteste_chat_history WHERE sessao_id = :id`
- `DELETE FROM reteste_sessao WHERE id = :id`

Feito via duas chamadas `supabase.from(...).delete()` em sequência (a mesma sessão pode ter mensagens em `reteste_chat_history` ligadas via `sessao_id`). Após sucesso, invalida o `useQuery` e mostra toast.

### 4. RLS / permissões
As tabelas `reteste_sessao` e `reteste_chat_history` já têm policies; será necessário garantir que admins possam ler/deletar todas as linhas (não só as próprias). Verifico as policies atuais antes de implementar e, se faltar, adiciono migration com policies extras usando `public.is_admin()`:

```sql
CREATE POLICY "Admins manage all reteste_sessao" ON public.reteste_sessao
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admins manage all reteste_chat_history" ON public.reteste_chat_history
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
```

(Somente se as policies existentes não cobrirem admin.)

## Arquivos

- novo: `src/pages/AdminRevisoes.tsx`
- editado: `src/App.tsx` (rota)
- editado: `src/components/admin/AdminNav.tsx` (link)
- migration condicional para policies de admin

Sem mudanças em design tokens. UI segue o padrão de `AdminTesteRegistros`/`AdminMensagens` (Card + Table do shadcn).
