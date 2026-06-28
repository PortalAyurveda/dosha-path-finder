## Plano

1. **Diagnosticar a chamada real do browser**
   - Testar diretamente a API REST do Supabase no schema `rpg` usando a mesma sessão/admin do app, para capturar o erro exato que a tela está escondendo.
   - Confirmar se o problema atual é schema não recarregado, JWT/admin, header `Accept-Profile`, ou algum erro de tabela específica.

2. **Corrigir o acesso sem abrir escrita**
   - Se o REST ainda negar acesso, aplicar uma migration mínima só para leitura no schema `rpg`:
     - manter `USAGE` no schema `rpg` para usuários autenticados;
     - garantir `SELECT` em todas as tabelas `rpg.*` para `authenticated`;
     - garantir RLS com leitura apenas para admin;
     - manter `service_role` com acesso operacional.
   - Se o erro for desalinhamento de admin, ajustar a policy para aceitar o mesmo mecanismo que o app usa hoje (`perfis.role = 'admin'`) ou deixar uma função compatível com ambos (`user_roles` e `perfis`).

3. **Melhorar a tela `/rpg/admin`**
   - Fazer a página exibir erros reais de carregamento em vez de parecer “vazia”.
   - Adicionar um bloco de diagnóstico discreto quando qualquer tabela falhar, mostrando tabela e mensagem do Supabase.
   - Preservar a versão somente leitura.

4. **Validar**
   - Verificar que o admin consegue listar contagens e registros em pelo menos `campaigns`, `monster_templates`, `item_templates`, `npcs` e `devlog`.
   - Confirmar que a rota continua protegida pelo mesmo `AdminRoute` usado no restante do admin.