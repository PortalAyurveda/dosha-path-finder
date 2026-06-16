## Atualizar gráfico de evolução dos doshas em /meu-dosha

Incluir os pontos de revisão (retestes) entre o diagnóstico inicial e o objetivo final, e reformatar o eixo X para mostrar apenas meses por extenso.

### Arquivos a alterar

1. **`src/components/meudosha/EvolucaoSheet.tsx`** — montagem dos pontos:
   - Remover a lógica que usa `objetivo.vata_atual` como ponto inicial.
   - Construir `realPoints` percorrendo TODO o `historico` (já vem ordenado por `created_at` ASC) — cada registro vira um ponto, com `tipo` (`teste` ou `reteste`) preservado.
   - Adicionar campo `label` em cada `SeriesPoint`:
     - `tipo === "teste"` → `"Diagnóstico"`
     - `tipo === "reteste"` → `"Revisão de {mês por extenso}"` (do `created_at`)
     - meta → `"Meta"`
   - `metaPoint` continua vindo de `objetivos_tratamento` (`vata_meta`, `pitta_meta`, `kapha_meta`, `data_fim`).

2. **`src/components/meudosha/metricas/DoshasEvolutionChart.tsx`** — eixo X mensal:
   - Adicionar `label?: string` em `SeriesPoint`.
   - Substituir o domínio atual (`firstReal → firstReal+6meses`) por: do primeiro mês do `realPoints` até o mês do `metaPoint` (ou último ponto), em milissegundos do primeiro dia de cada mês.
   - Gerar `ticks` explícitos: array com o timestamp do primeiro dia de cada mês no intervalo (inclusive meses sem ponto).
   - `tickFormatter` retorna o nome do mês por extenso em pt-BR (`toLocaleDateString("pt-BR", { month: "long" })`, capitalizado).
   - Tooltip: usar `payload.label` no topo (substitui o "Revisão" hardcoded) — exibir `Diagnóstico`, `Revisão de Junho` ou `Meta`.
   - Manter ReferenceLines "Atual" (primeiro ponto) e "Objetivo" (meta) como já estão.
   - Marcadores: continuam aparecendo apenas nos pontos reais (recharts não renderiza dot quando não há linha em meses vazios — comportamento já correto com `connectNulls`).

### Detalhes técnicos

- Helper `startOfMonth(ts)`: `new Date(y, m, 1).getTime()`.
- Helper `monthsBetween(start, end)`: itera de `startOfMonth(start)` até `startOfMonth(end)` somando 1 mês para gerar os ticks.
- Capitalizar nome do mês: `s[0].toUpperCase() + s.slice(1)`.
- Não muda nada na query — ela já busca todos os registros do email ordenados por `created_at`.
- Não toca em `AgniMiniChart` (escopo só do gráfico de doshas).
