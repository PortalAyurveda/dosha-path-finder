## Plano: Sistema de Contato e Sugestões

A tabela `public.mensagens` já existe com as colunas corretas (`user_id`, `nome`, `email`, `tipo`, `assunto`, `mensagem`, `status`, `resposta_admin`, `created_at`, `updated_at`). O trigger `notify_mensagem_n8n` já dispara um webhook ao inserir uma nova mensagem.

### 1. Migration (RLS para admin)

Hoje só existe `INSERT` público e `SELECT` do dono. Falta:
- Policy `SELECT` para admin (usando `is_admin()` já existente)
- Policy `UPDATE` para admin (marcar como lido / responder)

### 2. Footer

Em `src/components/Footer.tsx`, adicionar link **"Contato & Sugestões"** apontando para `/contato`, ao lado do link de Política de Privacidade na linha de baixo (mesmo estilo, agrupados com separador).

### 3. Página `/contato` (`src/pages/Contato.tsx`)

- Usa `Layout` herdado pelo App, `<Seo>` com título "Contato & Sugestões — Portal Ayurveda"
- Carrega `useUser()`; se logado, busca `nome_completo || nome` e `email` em `user_profiles` para pré-preencher
- Form com shadcn (`Input`, `Textarea`, `Select`, `Button`, `Label`)
- Validação com `zod`: nome (1-100), email válido (≤255), tipo enum, assunto (1-150), mensagem (1-2000)
- Tipos no select: `Sugestão`, `Contato`, `Bug`, `Elogio`
- Submit → `supabase.from('mensagens').insert({ user_id: user?.id ?? null, nome, email, tipo, assunto, mensagem })`
- Sucesso → `toast.success("Mensagem enviada!")` + reset do form
- Erro → `toast.error(...)`

### 4. Página `/admin/mensagens` (`src/pages/AdminMensagens.tsx`)

- Envolvida por `<AdminRoute>` em `App.tsx`
- Adiciona link "Mensagens" em `src/components/admin/AdminNav.tsx`
- Lista via `supabase.from('mensagens').select('*').order('created_at', { ascending: false })`
- Tabela (shadcn `Table`): Data (formatada pt-BR), Nome, Email, Tipo (badge colorido por tipo), Assunto, Status (badge: `novo` cinza, `lido` azul, `respondido` verde)
- Click na linha → `Dialog` mostrando mensagem completa, com:
  - Botão "Marcar como lido" → `UPDATE status='lido'` (some quando já lido/respondido)
  - `Textarea` "Resposta interna" + botão "Salvar resposta" → `UPDATE resposta_admin=..., status='respondido'`
- Após qualquer update, refetch da lista
- Sem paginação no v1 (pode ficar para depois se passar de 100 mensagens)

### 5. Routing

Adicionar em `src/App.tsx`:
- `<Route path="/contato" element={<Contato />} />`
- `<Route path="/admin/mensagens" element={<AdminRoute><AdminMensagens /></AdminRoute>} />`

### Observações técnicas
- O webhook n8n já é disparado pelo trigger existente — sem trabalho extra
- Badges de tipo: Sugestão (roxo/primary), Contato (azul), Bug (vermelho/destructive), Elogio (verde)
- Tudo usa tokens semânticos do design system, sem cores hardcoded