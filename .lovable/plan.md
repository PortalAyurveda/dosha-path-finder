# Plano: Retestes no gráfico de doshas (/meu-dosha → Gráficos)

## Contexto

A query em `src/components/meudosha/EvolucaoSheet.tsx` já busca por `email` sem filtrar `tipo`, mas:
- não traz a coluna `tipo` no `select`, então não é possível diferenciar pontos
- o `DoshasEvolutionChart` usa um único `dot` circular sólido por série

Objetivo: trazer também `tipo` e renderizar pontos de `reteste` com aparência diferente (losango), mantendo a linha cronológica única e a linha de meta intacta.

## Mudanças

### 1. `src/components/meudosha/EvolucaoSheet.tsx`
- Incluir `tipo` no `select` da query `evolucao-hist`:
  `'vatascore, pittascore, kaphascore, "agniPrincipal", created_at, email, tipo'`
- Propagar `tipo` ao montar cada `SeriesPoint` (campo novo `tipo?: 'teste' | 'reteste'`), tanto no laço principal quanto no fallback.
- A ordenação já é `created_at ASC` — manter.
- A lógica de `metaPoint` permanece (segue baseada em `objetivos_tratamento`).

### 2. `src/components/meudosha/metricas/DoshasEvolutionChart.tsx`
- Adicionar `tipo?: 'teste' | 'reteste'` ao tipo `SeriesPoint`.
- Substituir o `dot` fixo de cada `<Line>` por uma função render que decide pela `payload.tipo`:
  - `teste` (ou ausente / `isMeta`) → círculo sólido atual (`r:5`, fill cor da série)
  - `reteste` → losango (SVG `<polygon>` rotacionado 45° ou um `<rect>` rotacionado), preenchido com a cor da série e contorno pontilhado (`strokeDasharray="2 2"`, `stroke` cor da série, `fill` `hsl(var(--card))` para destacar)
- `activeDot` segue igual (mantém UX de hover).
- No `ZoneTooltip`, quando `payload[0].payload.tipo === 'reteste'`, exibir um pequeno rótulo "Revisão" acima dos itens (texto pequeno, cor `muted-foreground`).
- A `<Line>` continua única por dosha, `connectNulls` ligando todos os pontos em ordem cronológica — sem alterar cores, eixos, zonas, `ReferenceLine` de "Atual"/"Objetivo" ou linha de meta.

## Fora de escopo
- Regra dos 30 dias (já tratada no fluxo de criação do reteste).
- Qualquer alteração visual fora do dot/tooltip do gráfico.
- `AgniMiniChart`, `ObjetivosPremiumBlock`, `AgniIndicator`.
