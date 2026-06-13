# Reteste de Dosha — Card no hero de /meu-dosha + página /revisao

Fluxo exclusivo para usuário logado. Reutiliza o visual da Akasha mas chama outro webhook (`/reteste-dosha`).

## 1. Card de revisão no hero de /meu-dosha

Novo componente `src/components/meudosha/RetesteCard.tsx`, renderizado no topo (dentro do hero, abaixo do nome/dosha principal e antes das abas).

Lógica (com `useUser()`):
- Se não houver `user.email`: não renderiza nada.
- Query 1: registro mais recente em `doshas_registros` com `email = user.email` AND `tipo = 'teste'`, ordenado por `created_at desc limit 1`.
- Query 2: existência em `reteste_sessao` com `user_email = user.email` AND `status = 'concluido'` AND `updated_at >= now() - interval '30 days'`.
- Query 3: existência em `reteste_sessao` com `user_email = user.email` AND `status = 'em_andamento'` (mais recente).

Renderização:
- Se existe sessão `em_andamento` → card "Continuar revisão" / subtítulo "Você tem uma revisão em andamento." / botão **Continuar** → `navigate('/revisao')`.
- Senão, se `teste.created_at < now() - 30 dias` E não há reteste concluído nos últimos 30 dias → card com ícone `RefreshCw`, título **"30 dias · revisão disponível"**, subtítulo "Faz 30 dias desde seu diagnóstico. Hora de ver o que mudou." e botão **Iniciar revisão** → `navigate('/revisao')`.
- Caso contrário → não renderiza.

Estilo: usa tokens existentes (cor `--akasha`, bordas suaves), mesma linguagem visual dos cards do hero atual.

## 2. Rota /revisao

Adicionar em `src/App.tsx`:
```
<Route path="/revisao" element={<Revisao />} />
```

Novo arquivo `src/pages/Revisao.tsx`:
- Usa `Layout` padrão (Header preservado, Footer aparece).
- Se `!user` (após carregar `useUser`): `<Navigate to="/entrar" replace />`.
- Carrega o `doshas_registros` mais recente (tipo = 'teste') do usuário para idPublico, scores e tags de agravamento.
- Carrega/cria `reteste_sessao` `em_andamento` para esse email:
  - `select * from reteste_sessao where user_email = email and status = 'em_andamento' order by created_at desc limit 1`.
  - Se não existir, insere uma nova com `status='em_andamento'`, `dosha_registro_origem_id = teste.id`.
- Se já existia sessão, carrega `reteste_chat_history where sessao_id = sessao.id order by created_at asc` e popula o chat.
- SEO `<title>Revisão · Akasha</title>` (via `Seo` component).

### Topo da página (resumo compacto)
Componente inline com:
- Roda dos doshas (reutiliza `DoshaMiniPie` de MeuDosha) com `size ≈ 80px`.
- Badges com nível de agravamento (Vata/Pitta/Kapha) baseados em `calc_dosha_status` — pode reusar lógica já existente em MeuDosha. Tamanho menor que em /meu-dosha (texto xs, padding reduzido).
- Sem botão de voltar.

### Chat
Novo componente `src/components/reteste/RetesteChat.tsx`, clonado visualmente de `AkashaTab` (mesmo header com logo da Akasha, mesma bolha, mesmo input sticky), mas:
- Sem token gate (sem `tokens_akasha`, sem `is_premium`, sem cache Akasha).
- Sem `get_history` no webhook — histórico vem de `reteste_chat_history`.
- Webhook: `https://n8n.portalayurveda.com/webhook/reteste-dosha`.
- Payload por mensagem: `{ email, message, nome }`.
- Cada turno: insere `role='user'` em `reteste_chat_history` (sessao_id, user_email) antes de chamar webhook; ao receber resposta, insere `role='assistant'`.
- Resposta lida em `data.resposta || data.output || data.text` (mesmo padrão Akasha).
- Se a resposta vier com `reteste_concluido: true`:
  - Renderiza a última mensagem normalmente.
  - Após `setTimeout(2000)`, mostra abaixo da bolha botão **"Concluir revisão"**.
  - Atualiza `reteste_sessao` para `status='concluido'` (no clique do botão).
  - Ao clicar → `navigate('/meu-dosha?id=' + idPublico)`.

### FloatingAkasha em /revisao
Em `src/components/akasha/FloatingAkasha.tsx`, adicionar `/revisao` ao `HIDDEN_PREFIXES` para esconder o widget.

## 3. Banco de dados

Tabelas `reteste_sessao` e `reteste_chat_history` já existem com RLS desligada e colunas suficientes. Antes de mexer no app:
- Habilitar RLS em ambas + policies permitindo o próprio usuário (`user_email = auth.jwt() ->> 'email'`) ler/escrever suas linhas.
- Garantir GRANTs para `authenticated` e `service_role`.

Migration separada (será apresentada para aprovação no modo build).

## 4. Fora de escopo
- Lógica do n8n no backend (já existe webhook).
- Mudanças em AkashaTab/FloatingAkasha além do `HIDDEN_PREFIXES`.
- Mudança visual em /meu-dosha além do novo card.

## Detalhes técnicos
- Arquivos novos: `src/pages/Revisao.tsx`, `src/components/reteste/RetesteChat.tsx`, `src/components/meudosha/RetesteCard.tsx`.
- Arquivos alterados: `src/App.tsx` (rota), `src/pages/MeuDosha.tsx` (montar `<RetesteCard />` no hero), `src/components/akasha/FloatingAkasha.tsx` (HIDDEN_PREFIXES).
- Sem novas dependências.
- Migration: enable RLS + policies + grants em `reteste_sessao` e `reteste_chat_history`.

## Verificação manual
1. Usuário logado com teste > 30 dias → card aparece no hero.
2. Clicar Iniciar revisão → /revisao mostra resumo compacto + chat vazio; sessão criada em `reteste_sessao`.
3. Trocar de aba e voltar → sessão `em_andamento` carregada, mensagens persistidas.
4. Webhook responde `reteste_concluido: true` → após 2s, botão "Concluir revisão" aparece; clique leva a `/meu-dosha?id=...` e sessão vira `concluido`.
5. Visitar /revisao deslogado → redireciona para /entrar.
6. FloatingAkasha não aparece em /revisao.