## Plano — Restaurar Métricas personalizadas + reorganizar hero

### Contexto
- A engine de regras (`src/data/metricasRules.ts`, 49 regras) e o card-folha (`src/components/meudosha/MetricasCard.tsx`) **continuam preservados** no repositório. O conteúdo só foi removido do `MetricasTab.tsx`, que hoje renderiza apenas o gráfico de evolução (timeline + Agni + Objetivo Premium).
- Precisamos: (1) trazer os cards de volta para a aba **Métricas**, (2) tirar o timeline dali e disponibilizá-lo como modal/sheet acionado por um novo botão **"Gráficos"** no hero do `/meu-dosha`, ao lado do **"Refazer teste"**, ambos abaixo do bloco "Fogo Digestivo (Agni)". O botão "Gráficos" fica trancado para usuários não-premium (cadeado).

### Mudanças

**1. `src/components/meudosha/MetricasTab.tsx` — reescrever**
- Voltar à versão "rules-based": busca `doshas_registros` por `registroUuid`, busca `metricas_snapshot` na `data_calculo` mais recente, conta total de registros, roda `evaluateRules(ctx)` e renderiza os cards agrupados por categoria (Diagnóstico, Crítico, Alerta, Estrutural…).
- Reaproveitar `MetricasCard` como está (sem footer "entre N pessoas", já removido).
- Skeleton + estado vazio mantidos. Sem dependência de `objetivos_tratamento` nem de `agni*Chart`.

**2. Novo `src/components/meudosha/EvolucaoSheet.tsx`**
- Mover todo o conteúdo "timeline" hoje em `MetricasTab.tsx` (DoshasEvolutionChart + AgniMiniChart + AgniIndicator + ObjetivosPremiumBlock) para um `Sheet`/`Dialog` shadcn aberto pelo botão "Gráficos". Recebe `registroUuid` e `isPremium`.

**3. `src/pages/MeuDosha.tsx` — hero**
- Abaixo do card "Fogo Digestivo (Agni)" trocar a área que hoje só tem "Refazer teste" por uma linha com **dois botões lado a lado**:
  - **Esquerda:** `Refazer teste` (mantém estilo atual, link sutil ou outline).
  - **Direita:** `Gráficos` com ícone `LineChart` (lucide). Se `!isPremium` → ícone de cadeado (`Lock`) e onClick abre o paywall já existente (ou navega para `/assinar`); se premium → abre o `EvolucaoSheet`.
- Remover a passagem de `insights`/`insightsLoading` para `MetricasTab` (props legadas viram opcionais e ficam ignoradas).

**4. Limpeza**
- `MetricasTab` deixa de importar `premiumSupabase`, `DoshasEvolutionChart`, `AgniMiniChart`, `AgniIndicator`, `ObjetivosPremiumBlock`, `doshaScale` — esses passam a ser usados só pelo `EvolucaoSheet`.

### Fora de escopo
- Mexer em outras abas (Perfil, Artigos, Vídeos, Akasha).
- Reescrever a engine de regras ou o copy dos cards.
- Mudar o paywall existente — apenas reaproveitar o fluxo já em uso para o cadeado do botão Gráficos.
