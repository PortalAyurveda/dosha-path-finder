

## Corrigir métricas da Akasha em /metricas/akasha

### Problema
Os 5 cards KPI estão vazios porque o código busca IDs antigos (`AKASHA_TOTAL_MSGS`, `AKASHA_USUARIOS_UNICOS`, etc.) que não existem mais em `metricas_snapshot`. O snapshot atual usa IDs novos: `AKASHA_01` a `AKASHA_04` (família "Akasha") + `TEMPORAL_AKASHA` (família "Temporal", com a série diária embutida em `descricao` como JSON).

### O que será feito

**1. Corrigir mapeamento de IDs em `src/pages/MetricasAkasha.tsx`**

Trocar os lookups dos cards para os IDs reais:

| Card | ID antigo (não existe) | ID novo (snapshot atual) |
|---|---|---|
| Volume Total | `AKASHA_TOTAL_MSGS` | `AKASHA_01` (usar `n_base`) |
| Usuários Atendidos | `AKASHA_USUARIOS_UNICOS` | `AKASHA_02` (usar `n_base`) |
| Média de Uso | `AKASHA_MEDIA_POR_USUARIO` | `AKASHA_03` (usar `percentual` → 69,3) |
| Engajamento Máximo | `AKASHA_PICO_USUARIO` | `AKASHA_04` (usar `n_base`) |
| Retenção (>7 dias) | `AKASHA_RETENCAO_PCT` | não existe no snapshot → exibir "—" com legenda "em cálculo" |

**2. Usar `TEMPORAL_AKASHA` como fonte primária da Evolução Diária**

A linha `TEMPORAL_AKASHA` (família "Temporal") já traz os últimos 30 dias prontos como JSON em `descricao` (`[{dia, msgs, usuarios}, …]`). Vou:
- Ler esse JSON do snapshot diretamente.
- Manter a RPC `akasha_evolucao_diaria` como fallback caso o snapshot não tenha o registro.

**3. Hora de pico e gráfico de horários**

Continua dependendo da RPC `akasha_distribuicao_horas` (não há equivalente no snapshot). Se a RPC retornar vazio, o gráfico mostra estado vazio limpo em vez de quebrar.

**4. Fallback de carregamento**

Hoje a tela inteira fica em skeleton enquanto o snapshot carrega, mesmo se a RPC já trouxe dados (ou vice-versa). Vou separar os estados de loading: KPIs/Evolução dependem do snapshot; Horários dependem da RPC. Cada bloco mostra seu próprio skeleton.

### Arquivos a editar
- `src/pages/MetricasAkasha.tsx` — corrigir IDs, ler `TEMPORAL_AKASHA`, separar loadings.
- `src/components/metricas/useMetricasData.ts` — (opcional) adicionar helper para extrair série temporal a partir do snapshot Temporal, com fallback à RPC.

### O que NÃO será feito
- Nenhuma alteração de schema ou de dados no Supabase.
- Sem mudar visual, cores, tipografia ou layout dos cards/gráficos.

