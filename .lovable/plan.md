

# Redesign do Header + Sistema de Login Integrado

## Resumo

Reestruturar o header em 3 zonas (menu hamburguer | logo central | login/perfil), adicionar `doshaResult` ao UserContext, e redesenhar a página de login com Magic Link + Google OAuth (sem senha).

## 1. UserContext — adicionar `doshaResult`

**Arquivo**: `src/contexts/UserContext.tsx`

- Nova interface `DoshaResult` com `idPublico`, `doshaprincipal`, `vatascore`, `pittascore`, `kaphascore`
- Novo estado `doshaResult` no provider
- Função `fetchDoshaResult(email)` que faz query em `doshas_registros2` pelo email, `ORDER BY created_at DESC LIMIT 1`
- Chamar automaticamente após login real (quando `user.email` estiver disponível)
- Também popular via `activeDoshaId` do localStorage (para "sessão por idPublico" sem auth real) — buscar por `idPublico` na `doshas_registros2`
- Expor `doshaResult` no contexto

## 2. Header — redesign 3 zonas

**Arquivo**: `src/components/Header.tsx`

```text
┌──────────────────────────────────────────────────┐
│  [☰]        [Logo Portal Ayurveda]    [Entrar/👤] │
└──────────────────────────────────────────────────┘
```

- **Esquerda**: Ícone hamburguer (sempre visível, desktop e mobile). Abre Sheet/dropdown com: Início, Biblioteca, Cursos, Terapeutas, Akasha IA (se `doshaResult` ou `user` existe)
- **Centro**: Logo centralizado, link para `/`
- **Direita**:
  - Se não logado E sem `doshaResult`: botão "Entrar" (link para `/entrar`)
  - Se tem `doshaResult` (logado real OU sessão por idPublico): mini pie chart (32x32px, Recharts `PieChart`) + texto do dosha principal (ex: "Vata-Pitta"). Clicável, leva a `/meu-dosha?id={idPublico}`
  - Se logado real sem teste: avatar com inicial do nome/email

Mini pie chart: componente inline usando `PieChart` + `Pie` + `Cell` do Recharts com cores vata (#93C5FD), pitta (#FCA5A5), kapha (#86EFAC).

## 3. Auth page — simplificar

**Arquivo**: `src/pages/Auth.tsx`

- Remover modo "login" (email+senha) e "signup" (email+senha+nome)
- Manter apenas 2 opções:
  1. **Magic Link**: campo de email + botão "Enviar link de acesso"
  2. **Google OAuth**: botão "Entrar com Google" usando `supabase.auth.signInWithOAuth({ provider: 'google' })`
  3. **Facebook OAuth**: botão "Entrar com Facebook" (funciona apenas se configurado no Supabase Dashboard)
- Layout limpo, sem tabs — os 3 botões empilhados

## 4. Nenhuma mudança de rotas

`src/App.tsx` permanece inalterado.

## Arquivos modificados

| Arquivo | Mudança |
|---|---|
| `src/contexts/UserContext.tsx` | Adicionar `doshaResult`, fetch por email e por idPublico |
| `src/components/Header.tsx` | Redesign completo: 3 zonas, menu hamburguer, mini pie chart |
| `src/pages/Auth.tsx` | Simplificar para Magic Link + Google + Facebook |

## Nota sobre Google/Facebook OAuth

Os botões serão adicionados no código. Para funcionarem, o usuário precisa configurar os providers no Supabase Dashboard (Authentication > Providers). Instruções serão fornecidas após implementação.

