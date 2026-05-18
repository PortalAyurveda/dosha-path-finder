## Diagnóstico

- A tela `/admin/blog` já tem drag-and-drop, mas hoje ela salva automaticamente no `drop`.
- Isso explica vários avisos “Ordem salva” aparecendo um atrás do outro, sem clicar em salvar.
- No banco, os 9 artigos destacados estão com `destaque_ordem = null`, então a ordem não está persistindo de verdade.
- A home (`FundamentosAyurveda`) já tenta ordenar por `destaque_ordem`, mas como está tudo `null`, ela cai para `created_at desc`, parecendo que a ordem escolhida não foi respeitada.

## Plano de correção

1. **Separar arrastar de salvar**
   - Ao arrastar um artigo, atualizar apenas a ordem local da lista.
   - Marcar a ordem como “alterações pendentes”.
   - Não chamar Supabase automaticamente no `drop`.
   - Não mostrar toast “Ordem salva” ao arrastar.

2. **Salvar somente pelo botão “Salvar ordem”**
   - O botão será o único ponto que grava `destaque_ordem` no banco.
   - Depois de salvar, recarregar os destaques do Supabase para confirmar a ordem persistida.
   - Mostrar “Ordem salva” só depois da gravação bem-sucedida.

3. **Evitar salvamentos concorrentes e estados confusos**
   - Desabilitar o botão enquanto estiver salvando.
   - Mostrar visualmente quando há alterações não salvas.
   - Evitar múltiplos toasts acumulados.

4. **Normalizar a ordem atual no banco**
   - Como todos os destaques atuais estão com `destaque_ordem = null`, criar uma migração para preencher uma ordem inicial `0..8` baseada na ordem atual exibida.
   - Assim a home deixa de depender de `created_at` como fallback.

5. **Ajustar remoção/adição de destaque**
   - Ao adicionar um novo destaque, colocar no fim da lista.
   - Ao remover, reordenar localmente e deixar o botão salvar gravar a sequência final.
   - Se preferirmos manter remoção imediata no banco, ela ainda deve normalizar a ordem restante sem gerar toast repetido.

6. **Validar**
   - Conferir via consulta no Supabase que `destaque_ordem` ficou preenchido e sequencial.
   - Conferir que a query da home retorna os 9 artigos na ordem salva.
   - Conferir que arrastar não dispara mais “Ordem salva” automaticamente.