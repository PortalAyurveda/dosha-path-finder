# Plano: Gráficos de evolução do /meu-dosha — janela fixa de 6 meses

Reescrever a montagem de pontos e o eixo X de `DoshasEvolutionChart` e `AgniMiniChart` para usar uma régua fixa de **6 meses**, com 1 ponto por mês, posicionado no **centro** da célula do mês. Acaba com a sobreposição de rótulos e dá dimensão visual ao gráfico mesmo quando há poucos dados.

## Arquivos afetados

- `src/components/meudosha/EvolucaoSheet.tsx` — lógica de montagem dos pontos (janela de 6 meses, dedupe por mês, cálculo de Objetivo e seta de "vem do passado").
- `src/components/meudosha/metricas/DoshasEvolutionChart.tsx` — render: eixo X categórico de 6 slots, ponto centralizado, rótulo superior (Diagn./Rev. N/Objetivo), rótulo inferior (mês), seta opcional no slot 1.
- `src/components/meudosha/metricas/AgniMiniChart.tsx` — mesma régua/centralização/rótulos do gráfico principal.

## Regras da janela de 6 meses

Definir `M0 … M5` (6 meses consecutivos, começando no dia 1).

1. **Origem padrão:** `M0 = mês do teste mais antigo considerado`. `Objetivo` = `M_{lastPointIndex + 1}`, no máximo `M5`.
2. **Sem revisão:** teste em Jan ⇒ M0=Jan (Diagn.), M1=Fev (Objetivo), M2–M5 vazios.
3. **Com revisão:** teste Jan + revisão Mai ⇒ M0=Jan (Diagn.), M4=Mai (Rev. 1), M5=Jun (Objetivo). M1–M3 vazios (linha conecta pelos pontos existentes via `connectNulls`).
4. **Janela estourou 6 meses:** se `mêsAtual − mêsDoTeste ≥ 5`, deslizar a janela para `M5 = mês da revisão + 1` (Objetivo sempre no último slot). Os pontos do passado que caírem antes de M0 são **descartados visualmente** e mostramos uma **seta "‹"** no slot M0 indicando "vem do passado" (tooltip: "Diagnóstico em <mês/ano>").
5. **Vários testes/revisões antigos:** colapsar para **1 ponto por mês** = registro mais recente daquele mês (já existe parcialmente; ampliar para incluir também testes nativos antigos, não só revisões).
6. **Numeração das revisões:** "Rev. 1", "Rev. 2"… contadas em ordem cronológica entre os pontos visíveis (após a janela). O Diagnóstico mantém o rótulo "Diagn.".
7. **Objetivo recalculado:** ignorar `objetivo.data_fim` para posicionamento no eixo. Posição do Objetivo = **mês imediatamente após o último ponto real visível**, clamp em `M5`. Valores (vata/pitta/kapha/agni meta) continuam vindo de `objetivos_tratamento`.

## Render do eixo X

- Trocar escala temporal por **categórica de 6 slots** (índices 0..5). Cada ponto recebe `slot` calculado pelas regras acima.
- Tick por slot: nome do mês embaixo (curto: "Jan", "Fev"…), centralizado no slot. `padding={{ left: 0, right: 0 }}` com `XAxis type="category"` para garantir que o slot 0 fique no meio da primeira célula (usar `tickMargin` + `interval={0}`).
- Rótulo superior do ponto ("Diagn." / "Rev. N" / "Objetivo") renderizado como `<LabelList>` ou tick customizado **alinhado verticalmente ao ponto** (mesmo `slot`), `textAnchor="middle"`.
- Linhas de referência verticais apenas nos slots que têm ponto (não em todos os 6).
- Slot M0 sem ponto mas com histórico anterior à janela ⇒ renderizar **seta "‹"** (SVG simples) no eixo, com tooltip do mês original.

## Detalhes técnicos

- Helper compartilhado `buildSixMonthWindow(history, objetivo, now)` em `EvolucaoSheet.tsx` (ou novo `src/components/meudosha/metricas/window6m.ts`) retorna:
  ```ts
  {
    months: { slot: 0..5, ts: number, label: "Jan" }[],
    points: SeriesPoint[],         // já com slot e label final (Diagn./Rev. N/Objetivo)
    metaSlot: number,
    hasPastOverflow: boolean,
    pastOverflowOriginTs: number | null,
  }
  ```
- Dedupe por mês: usar `monthKey = YYYY-MM`, manter o registro de `created_at` mais recente (independente de ser `teste` ou `reteste`).
- `SeriesPoint` ganha campo `slot: number`; charts passam a usar `dataKey="slot"` no XAxis.
- `connectNulls` permanece ligado para que a linha "pule" meses vazios.
- `AgniMiniChart` recebe o mesmo `months` + `points` (campo `nivel`) para manter alinhamento idêntico entre os dois gráficos.

## Fora de escopo

- Não mexer em queries Supabase nem na lógica de cálculo de `objetivos_tratamento`.
- Não mudar cores, tipografia ou tamanho dos cards.
