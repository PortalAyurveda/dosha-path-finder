# Plano — Modulo RPG (frontend)

Construir o JOGO em `/rpg` e o painel admin em `/admin/rpg`, **sem mexer em nada fora dessas rotas**. Toda regra fica no backend (RPCs `rpg.*` + webhooks n8n `rpg-acao` / `rpg-discursiva` / `rpg-cena` / `rpg-gerar-tudo`). O front so chama e renderiza.

## Premissas / restricoes
- Reuso TOTAL da auth ja existente (Supabase Auth). Se nao logado → redireciono pro fluxo de login do app.
- Schema `rpg` ja exposto via PostgREST (`supabase.schema('rpg').rpc(...)`).
- Tema: medieval acolhedor (pergaminho/vela/dourado/borgonha/musgo/creme). Fontes serifadas (Cinzel/IM Fell + EB Garamond/Inter). Icones Lucide; emojis so como prefixo de entidades.
- SEM imagens geradas nesta fase.
- Mobile-first, contrastes acessiveis.

## Rotas (so estas mudam)
- `/rpg` — jogo (player). Tela cheia, imersiva.
- `/rpg/lobby/:code` — entrar via link de convite.
- `/admin/rpg` — dashboard do dono. Substitui a tela atual (que so tem "Gerar"). A geracao vira UMA secao desse dashboard e passa a chamar `/rpg-gerar-tudo` (pipeline completo, 5-8 min) em vez de `/rpg-gerar`.
- Nao toco em `/rpg/admin` (RpgAdmin existente, leitura geral do schema) — segue funcionando.

## Arquitetura do front
- `src/features/rpg/` (tudo novo isolado aqui):
  - `api/rpc.ts` — helper `rpgRpc(fn, args)` usando `supabase.schema('rpg').rpc`.
  - `api/webhooks.ts` — `postAcao`, `postDiscursiva`, `postCena`, `postGerarTudo` com timeouts altos e fallback pra RPC.
  - `store/useGame.ts` — Zustand (ou contexto + reducer) com `estado`, `acao(envelope)`, polling de `cena_atual` a cada 2.5s + canal realtime nas tabelas `rpg.parties` / `rpg.player_state` pra invalidar.
  - `theme/` — tokens semanticos (pergaminho, vela, dourado, borgonha, musgo, creme) registrados em `src/index.css` + variantes shadcn. Fontes carregadas via `@import` no css de fontes do projeto.
  - `components/` — `Hud`, `PartyBar`, `Dice`, `BandBadge`, `EntityIcon` (mapeia mob/item/npc/lugar/cena pra emoji), `ScrollPanel`, `LeafCard`.
  - `screens/` — um por modo: `Lobby`, `CharCreate`, `Exploration`, `MapTimeline`, `City`, `Quest`, `Combat`, `Defeat`.
- Roteamento interno por `estado.modo` (`lobby|exploracao|cidade|quest|combate|derrota`); nao crio sub-rotas pra cada modo.

## Setores (ordem de entrega)
1. **A — Lobby + Criar personagem** (`/rpg`)
   - A0 sessao: `meus_personagens(auth.uid())` → tela "Continuar" / "Nova aventura".
   - A1 criar mesa (`criar_party` campanha-molde `aaaaaaaa-0000-0000-0000-000000000002`) ou entrar com codigo (`entrar_party`), rota `/rpg/lobby/:code`.
   - A2 ficha em 3 passos (Classe/Pontos/Preview) usando `classe_config` + `criar_personagem`.
   - A3 sala de espera: `estado_party` polling+realtime, `marcar_pronto`, host ve "Comecar" (`iniciar_jogo`).
2. **C — Esqueleto cena + HUD** (hospeda os modos)
   - 3 areas: narrativa / HUD (ficha + relogio + party bar com destaque no `turno_de`) / painel de acao.
   - Trava por turno: painel desabilitado se `!party.meu_turno` ("Vez de X...").
   - Drawer Ficha/Inventario (`inventario` + `equipar`/`desequipar`).
3. **B — Mapa timeline linear**
   - `mapa(p_player_id)` → stepper vertical serpenteante, icone por tipo, estados atual/bloqueado/limpo, badge "resolva pra seguir" em quest pendente. Botoes Avancar/Voltar (`mover` via rpg-acao). Click em no conhecido = `viajar` (fast-travel).
4. **D — Combate 3 tiles**
   - Render `combate.herois` por tile + `inimigos` em cards. Destaque heroi do turno.
   - Menu A/B/C/D + Mover/Fugir. Selecao de alvo em 2 passos com alcance (curto0/medio1/longo2) destacando inimigos validos.
   - Envelope `{ tipo:"combate", acao:{...} }` no rpg-acao; trato `outcome` (continua/vitoria/acordou_estalagem/fugiu).
5. **E — Cidade / Loja**
   - NPCs com 4 interacoes (4a trancada com teaser), loja comprar/vender, descansar.
   - **Cidade verde**: acoes pessoais livres; botao "Pronto para partir" (`{tipo:'pronto_cidade'}`) com painel de checks.
6. **F — Quest / Sala / Puzzle**
   - Header "Sala X de N", menu por classe (`acoes_classe`), discursiva. Puzzle: campo livre + `puzzle_resolver` (manda `p_veredito=null` por ora, fallback do banco; dica apos 2 erros). Encounter abre combate. Avancar so apos resolver.
7. **G — `/admin/rpg` (dashboard leitura + 1 acao de escrita)**
   - Abas: Mapa (timeline read-only) · Quests · Cidades & NPCs · Bestiario · Parties/Sessoes · Chatlog (`chatlog(p_party_id)`) · Devlog (`rpg.devlog`).
   - Painel "Forjar Mundo": textarea + botao Gerar → `POST /webhook/rpg-gerar-tudo` com timeout >= 8min e modal de progresso ("Forjando o mundo, isso leva alguns minutos, nao feche"). Substitui a tela atual `AdminRpg.tsx`.

## Mecanicas transversais
- **d20/bandas**: componente `Dice` anima rolagem, `BandBadge` mostra banda (cripto/fraca/mediana/forte/especial) com cores quentes.
- **Discursiva**: input "Outra acao... descreva" → `rpg-discursiva { player_id, texto }`. Se `resultado.rejeitada` → narra mas nao gasta turno; se `consequencia.tipo='dano'` → atualizo HP.
- **Eventos do no**: ao chegar, `evento_pendente(player_id)`. `automatico` → botao Continuar; `escolha` → Encarar/Evitar com `{tipo:'evento', aceitar}`.
- **Reconexao**: se ja tem `player_id` salvo (localStorage por user) e party `playing` → pula pro jogo, `rpg-cena` pra hidratar.
- **Sync multiplayer**: polling 2.5s de `cena_atual` + canal realtime em `rpg.parties` (broadcast por mudanca de turno).

## Erros / robustez
- Toda RPC/webhook pode voltar `{ok:false, erro}` → toast amigavel, nao quebra a tela.
- Fallback: se webhook narrado timeout/erro → chamo RPC equivalente direto (sem prosa) e mostro `log` estruturado.

## Tecnico (detalhes)
- Tokens HSL em `src/index.css` no escopo `[data-rpg-theme]` aplicado em `<div>` raiz de `/rpg` e `/admin/rpg`, pra NAO vazar pro resto do app.
- Sem novas deps obrigatorias. Talvez `zustand` (ja pode estar) — se nao, uso Context+useReducer pra evitar instalar.
- Reuso `Button`, `Card`, `Dialog`, `Drawer`, `Input`, `Textarea`, `Toaster` (sonner) de shadcn. **Sem TooltipProvider/Tooltip** (regra do projeto).
- Lazy load: `/rpg` e `/admin/rpg` ja sao lazy via `App.tsx`; mantenho.
- SEO: `<title>` por tela (`Aventura · Portal Ayurveda`, `Admin · RPG`).

## Entregaveis por etapa (PRs internos)
1. Tema + helpers (`api/`, `store/`, theme tokens, `EntityIcon`, `Dice`, `BandBadge`).
2. Setor A (lobby+ficha) + rota `/rpg/lobby/:code`.
3. Setor C (esqueleto+HUD+Ficha drawer).
4. Setor B (mapa).
5. Setor D (combate).
6. Setor E (cidade) + Setor F (quest/puzzle).
7. Setor G (dashboard admin substituindo AdminRpg.tsx atual).

## Confirmacoes que preciso antes de comecar
1. **`/admin/rpg` atual** (so "Gerar Campanha" chamando `/rpg-gerar`) pode ser SUBSTITUIDA pelo dashboard novo (com a aba "Forjar Mundo" chamando `/rpg-gerar-tudo`)? Ou prefere manter os dois lados (dashboard novo + a tela simples que ja existe)?
2. Posso adicionar **`zustand`** como dep nova pro store do jogo, ou prefere Context+useReducer (sem dep nova)?
3. A campanha-molde fixa `aaaaaaaa-0000-0000-0000-000000000002` ja existe no banco e pode ser usada como padrao do "Criar mesa", certo? (se nao, preciso de qual id usar).
4. Quer que eu entregue tudo de uma vez ou aprovo/entrego setor a setor (mais seguro pra revisar)?
