## Diagnóstico

Verifiquei o estado atual:

- **Rota existe** em `src/App.tsx` (`/admin/estoque` → `AdminEstoque`, protegida por `AdminRoute`).
- **Link existe** em `src/components/admin/AdminNav.tsx` como "Estoque & Produção" (ícone Package).
- **Migration foi aplicada** no banco: schema `samkhya` está em `pgrst.db_schemas`, RLS ativa em todas as tabelas e policies `admin_all` usando `public.is_admin()` criadas.
- **Views existem** (`v_estoque_ingredientes`, `v_necessidade_ingredientes`).

Ou seja, código e DB estão no lugar. Os sintomas relatados ("não carrega" e "não aparece em /admin") apontam para uma destas três causas:

1. **Preview com cache** — o build anterior ainda está em memória e o usuário não viu o novo link/rota. Resolve com hard reload.
2. **Erro de runtime na página** que faz o React quebrar silenciosamente (a barra de nav aparece mas o conteúdo não renderiza). Suspeitos:
   - O `samkhyaSupabase` é criado com `db.schema: "samkhya"` cast como `never`. Em runtime funciona, mas se o PostgREST ainda não tiver feito reload completo do `pgrst.db_schemas`, as queries respondem 404.
   - As views podem não estar como `security_invoker=on` — nesse caso, dependendo do owner, RLS pode bloquear retorno mesmo com admin.
3. **Policy `is_admin()` retornando false** para o usuário logado — sem dados, a página mostra tabelas vazias (não "não carrega"), mas vale validar.

## Plano

1. **Forçar reload do PostgREST e validar acesso de fato**
   - Disparar `NOTIFY pgrst, 'reload schema'` (além do reload de config já feito).
   - Garantir `ALTER VIEW samkhya.v_estoque_ingredientes SET (security_invoker = on);` e o mesmo para `v_necessidade_ingredientes`, para que as policies de admin se apliquem.
   - Garantir `GRANT SELECT` explícito nas duas views para `authenticated`.

2. **Blindar a página contra erro de runtime**
   - Em `AdminEstoque.tsx`, envolver o conteúdo em um error boundary leve (ou try/catch nos hooks) e mostrar a mensagem de erro do Supabase em tela em vez de quebrar silenciosamente.
   - Em `useSamkhyaEstoque.ts`, logar `error.message` no `console.error` quando uma query falha, para facilitar debug futuro.

3. **Confirmar visualmente o link no /admin**
   - Após o reload, abrir `/admin` e checar que "Estoque & Produção" aparece no `AdminNav`. Se não aparecer, é cache do browser/preview (Ctrl+Shift+R).

4. **Validar as 3 abas carregando**
   - Abrir `/admin/estoque`, conferir Estoque (lista vinda de `v_estoque_ingredientes`), Produção (planejadas + necessidade), Vendas (form + tabela).
   - Se alguma query retornar erro 404/PGRST106, ajustar nome do schema/tabela; se 401/permission, ajustar GRANT/policy.

## Detalhes técnicos

SQL planejado:
```sql
ALTER VIEW samkhya.v_estoque_ingredientes SET (security_invoker = on);
ALTER VIEW samkhya.v_necessidade_ingredientes SET (security_invoker = on);
GRANT SELECT ON samkhya.v_estoque_ingredientes, samkhya.v_necessidade_ingredientes TO authenticated;
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';
```

Arquivos a tocar (mínimo):
- `src/hooks/useSamkhyaEstoque.ts` — adicionar `console.error` nas queries para diagnóstico.
- `src/pages/AdminEstoque.tsx` — exibir estado de erro por aba (já temos toasts, mas faltam fallbacks visíveis quando a query falha sem mutação).

Sem mudanças em escopo funcional — só destravar e dar visibilidade ao erro.
