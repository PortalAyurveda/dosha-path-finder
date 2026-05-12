# Plano: Nova aba "Métricas" em /meu-dosha

Substituir o conteúdo atual de `MetricasTab` (cards de cruzamentos com a base) por uma visualização temporal de evolução dos doshas e do Agni, com objetivos clínicos e área premium.

## Arquivos afetados

- `src/components/meudosha/MetricasTab.tsx` — reescrita completa (mantendo a assinatura de props para não quebrar `MeuDosha.tsx`).
- Novos componentes em `src/components/meudosha/metricas/`:
  - `DoshasEvolutionChart.tsx` — Bloco 1 (ComposedChart 1–15)
  - `AgniMiniChart.tsx` — Bloco 2
  - `AgniIndicator.tsx` — Bloco 3
  - `ObjetivosPremiumBlock.tsx` — Bloco 4 (com prop `isPremium` mockada `false`)
  - `doshaScale.ts` — utilitários de normalização score-bruto → 1–15 + zona/sub-nível
- `src/integrations/supabase/premium-client.ts` — já existe; usar para buscar `objetivos_tratamento`. Adicionar tipos faltantes (`data_inicio`, `data_fim` já estão; só conferir).
- Remover do `MetricasTab` os imports/props legacy (`insights`, `isLoading`) sem mexer no chamador (props ficam opcionais e ignoradas — `MeuDosha.tsx` não muda).

## Dados (3 queries)

Ponto de entrada: `MetricasTab` recebe `registroUuid` (UUID) — precisamos do `idPublico`. Solução: buscar primeiro o registro pelo `id` para obter `idPublico` E `email` num único hit, depois encadear:

1. `doshas_registros` por `id = registroUuid` → pega `email`, `idPublico`. (substitui a query #1 do prompt; mais direto pois já temos UUID).
2. `doshas_registros` por `email = X`, ordenado `created_at ASC` → série histórica de scores.
3. `premium.objetivos_tratamento` via `premiumSupabase` por `user_email = X`, `order created_at DESC limit 1`, com `.maybeSingle()`.

Tudo via `useQuery` com cache de 30 min, igual ao padrão atual.

## Bloco 1 — Gráfico V/P/K + Agni (recharts ComposedChart)

- **Normalização** em `doshaScale.ts`: três funções `vataToLevel`, `pittaToLevel`, `kaphaToLevel`, `agniToLevel` seguindo as faixas exatas do prompt. Retornam também `{ zona, subNivel }` para o tooltip.
- **Eixo Y**: domain `[1,15]`, `ticks={[2,5,8,11,14]}`, `tickFormatter` → `Pouco/Normal/Acúmulo/Adoecido/Fixado`. Zona Normal com `ReferenceArea` levemente destacada.
- **Faixas de fundo**: 15 `ReferenceArea` (5 zonas × 3 sub-níveis), opacidade 20/45/70%. Cores neutras dos tokens da paleta `metricas/theme.ts` (vamos adicionar `--zone-pouco/normal/acumulo/adoecido/fixado` no `index.css`).
- **Eixo X temporal**: `XAxis dataKey="t" type="number" scale="time"` com domínio `[data_inicio, data_fim]` do objetivo. Pontos:
  - `Hoje` em `data_inicio` ← scores `_atual`.
  - Pontos reais: cada `doshas_registros` com `created_at >= data_inicio`.
  - `Meta` em `data_fim` ← scores `_meta`.
- **Linhas (4)**:
  - Vata/Pitta/Kapha: `<Line>` com cor token, strokeWidth 2. Segmentos reais sólidos; segmento `último_real → meta` com `strokeDasharray="6 4"` (renderizado como `<Line>` separada com 2 pontos).
  - Agni: cor por `agni_tipo` (irregular→primary, forte→pitta, fraco→kapha-escuro, bom→verde) e `strokeDasharray` por `agni_nivel` (3→"3 6", 2→"5 4", 1→"7 3", 0 sólido).
- **Tooltip** customizado: nome, score bruto, zona + sub-nível (ex: "Vata — 39 — Adoecido nível 1").
- **Legenda** simples abaixo, inline.

## Bloco 2 — Mini-gráfico Agni

`LineChart` recharts pequeno (h~120px), eixo Y 0–3 com `tickFormatter` Bom/Iniciando/Moderado/Agravado. Mesmo domínio X visual do Bloco 1 (mesma `data_inicio`/`data_fim`). Cor + dash idênticos. Ponto sólido em `agni_nivel_atual`, círculo vazado em `agni_nivel_meta`.

## Bloco 3 — Card Agni textual

Card simples (tokens já existentes), com:
- Badge colorida com `agni_tipo`.
- Frase: "Agni {tipo} nível {atual} → meta: nível {meta}".
- `frase_clinica` quando preenchida.

## Bloco 4 — Objetivos (premium)

Renderiza `objetivos` (array) como lista bullet e `narrativa_clinica` (4 blocos: situacao/causas/sabores/proximos) como seções tituladas. Quando `isPremium=false` (mock), aplicar overlay com `backdrop-blur` + CTA "Acesse seu plano completo" (link placeholder `/samkhya` por ora — ajustamos depois).

## Estados

- Loading: skeletons nos 4 blocos.
- Sem `objetivos_tratamento`: card único "Seu plano de acompanhamento ainda está sendo preparado." Continua mostrando histórico se houver ≥2 registros (sem segmento de meta).
- Sem `doshas_registros` para o idPublico: o `MeuDosha` pai já trata redirect; aqui apenas defensivo.

## Design tokens

- Adicionar em `index.css` (HSL): `--zone-pouco`, `--zone-normal`, `--zone-acumulo`, `--zone-adoecido`, `--zone-fixado`, e variantes de agni (`--agni-bom`, `--agni-irregular`, `--agni-forte`, `--agni-fraco`).
- Mapear no `tailwind.config.ts` para uso opcional; dentro dos charts usar `hsl(var(--...))` direto.

## Fora do escopo desta entrega

- Lógica real de detecção premium (fica como prop mockada).
- Mudanças em `MeuDosha.tsx` além do que for estritamente necessário (assinatura de `MetricasTab` permanece compatível).
- Métricas comparativas com a base (substituídas pela nova visão).

Confirma que posso seguir? Ou quer ajustar algo (ex.: cores das zonas, comportamento sem objetivo, link do CTA premium)?
