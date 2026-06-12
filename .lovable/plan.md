# FloatingAkasha — chat widget global

Criar um botão+janela de chat flutuante (canto inferior direito) disponível em todo o site, reutilizando o mesmo backend n8n da Akasha de `/meu-dosha`.

## Arquivos

**Novo:** `src/components/akasha/FloatingAkasha.tsx`
- Botão fixo `bottom-6 right-6 z-50`, redondo, com o logo Akasha (`AKASHA_LOGO` já usado em `AkashaTab.tsx`), badge sutil ao redor com a cor `--akasha`.
- Ao clicar abre painel `w-[360px] h-[560px]` (em mobile: full-width com margem, altura `70vh`), com header (logo + "Akasha IA" + botão X) e o mesmo chat embaixo.
- Reutiliza a MESMA lógica de `AkashaTab.tsx`: `WEBHOOK_URL`, `get_history`, envio de mensagens, hidratação via React Query (mesma `cacheKey = ['akasha-history', resolvedEmail]` → garante que abrir o widget mostra exatamente a mesma conversa que está em `/meu-dosha`).

**Novo:** `src/components/akasha/useAkashaChat.ts` (hook)
- Extrai de `AkashaTab.tsx` o estado/funcs: `messages`, `input`, `sending`, `sendMessage`, `sendInitialMessage`, `loadingHistory`, controle de tokens.
- Recebe contexto (email, nome, dosha, scores, imc, idade, agni, nivelConhecimento, idPublico) — campos opcionais para o caso visitante.
- `AkashaTab.tsx` passa a consumir esse hook (sem mudança visual). `FloatingAkasha` também o consome.

**Editar:** `src/components/Layout.tsx`
- Renderizar `<FloatingAkasha />` dentro de `LayoutInner`, depois do `<Footer />`, mas apenas quando `!immersive`.
- Ocultar nas rotas: `/meu-dosha` (já tem a aba) e `/akasha` (página standalone). Detectar via `useLocation()`.

## Contexto do usuário no widget

- **Logado com dosha:** busca o registro mais recente em `doshas_registros` por `user.email` (mesmo padrão do `UserContext.fetchDoshaByEmail`) — usa `email`, `nome`, `doshaprincipal`, scores. Cache hidrata histórico instantaneamente vindo de `/meu-dosha`.
- **Logado sem dosha / visitante:** usa `email = user?.email || "visitante@portalayurveda.com"`, sem mensagem inicial automática (apenas placeholder "Pergunte à Akasha…"). Sem consumo de tokens para visitante anônimo (mesmo guard atual).

## Comportamento

- Estado aberto/fechado em `localStorage` (`akasha-floating-open`) para persistir entre navegações.
- Animação suave (scale+opacity) ao abrir/fechar.
- Z-index acima de tudo, mas abaixo de modais/drawers existentes (`z-50` consistente com o resto).
- Não interfere com `/meu-dosha` nem `/akasha` (ocultado nessas rotas).

## Fora de escopo

- Nenhuma mudança no fluxo n8n nem na tabela `chat_histories`.
- Nenhuma mudança visual em `AkashaTab` de `/meu-dosha` (só extração do hook, comportamento idêntico).
- Sem novo sistema de tokens — reusa `profile.tokens_akasha`.

## Pontos a confirmar antes de implementar

1. Esconder o widget também em `/teste-de-dosha` e checkouts (`/assinar`, `/samkhya/*/obrigado`)? Sugiro **sim**, para não atrapalhar fluxos críticos.
2. Visitante anônimo deve poder conversar (consumindo limite de IP/sessão) ou só vê CTA "Faça o teste de dosha primeiro"? Atualmente proposto: CTA para visitante, chat só para logado.
