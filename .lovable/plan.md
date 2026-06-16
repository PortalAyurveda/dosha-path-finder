## 1. Mini-form de entrada em `/teste-de-dosha`

Quando o usuário acessa `/teste-de-dosha` direto (sem ter passado pelo `Hero` do Index), o `localStorage.dosha_test_info` está vazio e o usuário não está logado → faltam `nome`, `idade` e `nivel`.

Em `src/pages/TesteDeDosha.tsx`:
- Adicionar um estado `needsHeroInfo` que começa `true` enquanto carrega e vira `false` se `localStorage.dosha_test_info` tem `nome` + `idade` válidos, OU se o `useEffect` que busca do usuário logado pré-preencher esses campos.
- Antes de renderizar a árvore normal do teste (quando `step === 0` e `needsHeroInfo`), renderizar uma seção que reproduz o mesmo bloco do `Hero` (mesmo título, descrição, labels, select de nível e botão "Começar"). Ao clicar "Começar", grava no `localStorage.dosha_test_info` e segue para o teste (`setNeedsHeroInfo(false)`).
- Reusar o mesmo visual / classes do `Hero.tsx` (card branco arredondado, gradiente sutil, botão `bg-primary`). Sem novo design — copiar a marcação.
- Manter `Helmet` da página normal; nenhuma mudança de rotas.

## 2. SEO

### 2a. Title + description sitewide em `index.html`
- `<title>`: `Portal Ayurveda | Seu caminho para saúde e longevidade`
- `<meta name="description">`: `Faça nosso Teste de Dosha, personalize sua dieta e rotina, colha resultados certeiros. Aulas gratuitas, artigos e cursos. Conheça Akasha - Assistente Virtual`
- Atualizar também `og:title`, `og:description`, `twitter:title`, `twitter:description` para combinar.

### 2b. Noindex via `react-helmet-async`
Adicionar `<Helmet><meta name="robots" content="noindex, nofollow" /></Helmet>` (e quando faltar `<Helmet>`, incluir o import) nas páginas:
- `src/pages/Auth.tsx` (`/entrar`)
- `src/pages/MeuDosha.tsx` (`/meu-dosha`)
- `src/pages/SamkhyaObrigado.tsx` (`/samkhya/obrigado` — única rota `/obrigado` no app)
- Não há rota `/perfil` no projeto (verificado em `App.tsx`). Se for criada futuramente, aplica-se a mesma regra; por ora, nenhuma ação.
- Para `/admin` e `/admin/*`: adicionar uma única `<Helmet>` com `noindex,nofollow` dentro do wrapper `AdminRoute` em `src/components/admin/AdminRoute.tsx`. Cobre todas as sub-rotas sem editar cada página.

### 2c. Soft 404 em `/video/:slug`
Em `src/pages/Video.tsx`, substituir o bloco `if (!video)` que renderiza a tela "Vídeo não encontrado". Em vez de renderizar, fazer:
```ts
useEffect(() => {
  if (!isLoading && !video) navigate("/biblioteca", { replace: true });
}, [isLoading, video, navigate]);
```
e retornar `null` enquanto redireciona.

## 3. Liberar Revisão a todos os usuários

### 3a. Rota `/revisao`
Em `src/App.tsx`, trocar `<Route path="/revisao" element={<AdminRoute><Revisao /></AdminRoute>} />` por `<Route path="/revisao" element={<Revisao />} />`. O próprio `Revisao.tsx` já trata `!user` redirecionando para `/entrar?redirect=/revisao`, e a regra dos 30 dias é validada implicitamente pelo `RetesteCard` + `loadAll` (sem teste, sem fluxo).

### 3b. Botão "Revisão" em `/meu-dosha`
Já está liberado para todos (lógica em `MeuDosha.tsx` linhas 834-870 só checa data, não papel). Confirmar — nenhuma mudança aqui exceto a próxima.

### 3c. Reabrir output da última revisão
Hoje o botão "Revisão" sempre navega para `/revisao` para iniciar nova. Quando o usuário já tem uma revisão concluída, queremos que esse mesmo botão mostre o output final.

- Em `MeuDosha.tsx`, dentro do bloco do botão Revisão, fazer um pequeno query para saber se existe uma `reteste_sessao` com `status='concluido'` para o `user.email`. (Reusar pattern do `RetesteCard` ou um `useQuery` simples.)
- Se existe → o botão fica com label `Ver revisão` e navega para `/revisao?ver=ultima` (ou só `/revisao`, já que a página carrega `ultimaRevisao` no `loadAll`).
- Se não existe + 30 dias passaram → fica `Revisão` (iniciar), como hoje.
- Se < 30 dias → fica desabilitado como hoje.

Em `src/pages/Revisao.tsx`:
- Quando `ultimaRevisao` existe e `flow === "idle"`, já hoje a página mostra os scores antes/depois no topo. Manter esse comportamento — funciona como "ver output". Já existe um botão para iniciar nova revisão; mantê-lo.
- Adicionar um pequeno reaproveitamento: se a URL traz `?ver=ultima` e há `ultimaRevisao`, garantir scroll ao topo do bloco de resultado (cosmético, opcional).

## Arquivos que vão mudar

- `index.html` — title/description/og/twitter
- `src/pages/TesteDeDosha.tsx` — gating com mini-form
- `src/pages/Video.tsx` — soft 404 redirect
- `src/pages/Auth.tsx` — Helmet noindex
- `src/pages/MeuDosha.tsx` — Helmet noindex + botão Revisão (label "Ver revisão" se concluída)
- `src/pages/SamkhyaObrigado.tsx` — Helmet noindex
- `src/components/admin/AdminRoute.tsx` — Helmet noindex global de /admin/*
- `src/App.tsx` — remover `AdminRoute` do `/revisao`
- `src/pages/Revisao.tsx` — (mínimo) suporte a `?ver=ultima` se necessário

Sem mudanças em design, schema ou RLS.
