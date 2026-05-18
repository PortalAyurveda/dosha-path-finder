## Diagnóstico encontrado

O problema mais provável não é falta de coluna: `portal_conteudo` já tem `destaque_index` e `destaque_ordem`, e o banco já está com os 9 destaques numerados de 1 a 9.

O ponto fraco atual é o fluxo do admin:
- O frontend considera a operação “salva” sem exigir que o Supabase retorne a linha alterada.
- Updates podem afetar 0 linhas por RLS/sessão/permissão e ainda não aparecer como erro claro no app.
- A remoção pela estrela atualiza a UI local antes de confirmar por reconsulta real do banco.
- A tela usa dois modelos de permissão: `AdminRoute` libera pelo `perfis.role`, mas a policy do banco usa `is_admin()`, que consulta `user_profiles.email` hardcoded. Isso pode causar divergência entre “vejo o admin” e “posso escrever no banco”.

## Plano de correção

1. **Adicionar uma função RPC segura no Supabase para salvar destaques**
   - Criar `public.admin_set_portal_conteudo_destaques(_items jsonb)`.
   - A função só roda para `is_admin()`.
   - Ela recebe a lista final de IDs e grava tudo em uma transação:
     - itens da lista: `destaque_index = true`, `destaque_ordem = 1, 2, 3...`
     - itens que eram destaque e saíram da lista: `destaque_index = false`, `destaque_ordem = null`
   - Ela retorna a ordem gravada no banco para validação.

2. **Trocar o admin para salvar sempre pela lista final**
   - Reordenar por drag apenas muda estado local.
   - Clicar em “Salvar ordem” chama a RPC com a lista final.
   - Remover estrela no bloco de destaques tira o item da lista local e marca como “alterações não salvas”; só persiste ao clicar em “Salvar ordem”.
   - Marcar/desmarcar estrela no grid também passa a usar o mesmo fluxo consistente, sem autosave silencioso enganoso.

3. **Validar com retorno real do banco**
   - Depois de salvar, reconsultar `portal_conteudo` ordenado por `destaque_ordem`.
   - Só mostrar “salvo” se a ordem e remoções baterem exatamente.
   - Se 0 linhas forem alteradas ou a permissão falhar, mostrar erro explícito: “o banco não confirmou a alteração”.

4. **Ajustar mensagens para evitar falsa confirmação**
   - Remover toasts de sucesso automáticos em cada mexida.
   - Mostrar apenas:
     - “Alterações não salvas” enquanto mexe.
     - “Destaques salvos e confirmados” após o banco confirmar.
     - Erro detalhado se falhar.

5. **Auditar a divergência de permissão admin**
   - Manter a rota visual usando `perfis.role`, mas alinhar a escrita com a mesma regra do banco ou exibir um aviso se o usuário passa na UI mas falha em `is_admin()`.
   - Isso evita a tela parecer funcionar enquanto o banco bloqueia.

## Arquivos/recursos envolvidos

- `src/pages/AdminBlog.tsx`: troca do fluxo de salvar/remover/reordenar.
- Supabase migration: criação da RPC transacional para persistir e confirmar a lista de destaques.

## Resultado esperado

Você poderá mexer livremente na lista, remover itens pela estrela, ordenar 1-2-3-4-5, e nada vai fingir que salvou. O app só confirma quando o banco devolver a ordem realmente persistida.