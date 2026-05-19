# Dashboard /admin

A rota `/admin` hoje abre direto em "Imagens". Vou transformá-la num **Dashboard** real (visão geral do portal), e mover Imagens pra `/admin/imagens` no AdminNav.

## Layout

Bento-grid responsivo, mobile-first, estilo Tray/Stripe:

```text
┌──────────────────── HEADER ─────────────────────┐
│  Dashboard · hoje 19/mai · últimos 7 dias       │
├─────────────┬─────────────┬─────────────────────┤
│ VISITAS HOJE│ LOGADOS HOJE│ ORIGEM (top 3)      │
│ 1.245       │ 312         │ Instagram 58%       │
│ 7d: 8.920   │ 7d: 2.104   │ Direto 22% · ...    │
├─────────────┴─────────────┴─────────────────────┤
│ CONTEÚDO                                         │
│ ┌─ Última imagem ─┬─ Último artigo ────────────┐│
│ │ [thumb]         │ "Título do artigo..."       ││
│ │ há 3h           │ há 1d · ver →               ││
│ └─────────────────┴─────────────────────────────┘│
├──────────────────────────────────────────────────┤
│ COMUNIDADE                                       │
│ Akasha hoje · Mensagens não-lidas · Testes hoje │
│ 47 conversas   · 3 não-lidas       · 28 testes  │
│ 7d: 312        · "última: assunto" · 7d: 196    │
├──────────────────────────────────────────────────┤
│ VENDAS                                           │
│ Vendas hoje · Assinaturas hoje · Último terapeuta│
│ R$ 420      · 2 novas          · "Nome — cidade"│
│ 7d: R$ 3.1k · 7d: 9            · há 5h          │
├──────────────────────────────────────────────────┤
│ SISTEMA                                          │
│ Última versão devlog: v0.42 · "fix auth..."     │
└──────────────────────────────────────────────────┘
```

Cada card: número grande (hoje) + linha menor com "7d: X" como contexto. Cards de "último item" mostram thumb/título + tempo relativo + link pra editar.

## Métricas e fonte

| Card | Fonte | Query |
|---|---|---|
| Visitas hoje / 7d | Lovable Analytics (`analytics--read_project_analytics`) | granularity daily, range = hoje e 7d |
| Logados vs não-logados | Lovable Analytics não separa por auth → mostro só total + nota "via Lovable Analytics" |
| Origem (Instagram/Direto/Google) | Lovable Analytics (referrer) | top 3 referrers |
| Última imagem | `portal_conteudo` onde tem `image_url` | order by `created_at` desc limit 1 |
| Último artigo | `portal_conteudo` onde status='published' | order by `created_at` desc limit 1 |
| Akasha conversas hoje / 7d | `chat_histories` distinct `session_id` por dia | count distinct session_id where data_hora >= today |
| Mensagens não-lidas | `mensagens` where status='novo' | count + última (assunto, nome) |
| Testes hoje / 7d | `doshas_registros2` | count where created_at >= today |
| Vendas hoje / 7d | tabela de vendas da loja (verificar nome real durante implementação) | sum(valor) |
| Assinaturas hoje / 7d | `assinaturas` where status='active' | count where created_at >= today |
| Último terapeuta | tabela de terapeutas (verificar nome) | order by created_at desc limit 1 |
| Última versão devlog | `devlog` | order by criado_em desc limit 1 |

**Extras que sugiro adicionar** (úteis num dashboard de operação):
- **Dosha dominante dos testes de hoje** — pequeno donut Vata/Pitta/Kapha (mostra "humor" da audiência do dia).
- **Conversão teste→assinatura (7d)** — % de quem fez teste e virou assinante.
- **Top tag de agravamento da semana** — qual desequilíbrio mais aparece nos testes (insight de conteúdo).

Posso incluir os 3 ou só o donut de dosha. Confirmo na implementação.

## Arquitetura técnica

**Novos arquivos:**
- `src/pages/AdminDashboard.tsx` — página principal
- `src/components/admin/dashboard/StatCard.tsx` — card numérico (hoje + 7d)
- `src/components/admin/dashboard/LastItemCard.tsx` — card de "último item" (thumb + título + tempo)
- `src/components/admin/dashboard/ReferrersCard.tsx` — top 3 origens
- `src/components/admin/dashboard/DoshaDonut.tsx` — donut Vata/Pitta/Kapha do dia
- `src/hooks/useAdminDashboard.ts` — React Query hooks agrupados (1 hook por card ou 1 hook agregado)

**Edits:**
- `src/App.tsx` — rota `/admin` → `AdminDashboard`; nova rota `/admin/imagens` → componente atual de imagens
- `src/components/admin/AdminNav.tsx` — primeiro link vira "Dashboard" (`/admin`, ícone `LayoutDashboard`), e adiciono "Imagens" (`/admin/imagens`)
- `src/pages/Admin.tsx` — renomeio função/export se necessário ou movo conteúdo pra `AdminImagens.tsx`

**Sem mudanças no banco.** Só leituras. Todas as queries já são permitidas pelas RLS existentes (admin via `is_admin()`).

**Lovable Analytics:** chamado client-side via `analytics--read_project_analytics` não existe no browser — vou usar a tool no server? Não existe server. Então:
- Opção A: criar edge function `admin-analytics` que chama a API do Lovable Analytics (se houver endpoint público).
- Opção B: mostrar placeholder "em breve" no card de visitas e seguir com o resto.

Vou tentar Opção A primeiro; se a API do Lovable Analytics não for acessível via edge function, caio na Opção B e deixo o card de visitas marcado como "ative tracking" — sem bloquear o resto do dashboard.

## Fora do escopo
- Não mexo em auth, RLS, schema, ou nos outros painéis `/admin/*`.
- Não crio tabela de page_views (você escolheu Lovable Analytics).
- Não adiciono filtros de data customizados nessa primeira versão (só "hoje" e "7d").
