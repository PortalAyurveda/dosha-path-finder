

## Plan: Sistema de Abas na página /meu-dosha + Aba Métricas Preditivas

### Overview
Reestruturar a página `/meu-dosha` com 5 abas no topo. A aba "Perfil" conterá o conteúdo atual. A aba "Métricas" será implementada por completo com fetch RPC + cards de insights. As abas 3-5 ficam como "Em breve".

### Architecture

```text
/meu-dosha?id=XXX
┌─────────────────────────────────────────────┐
│  Header (nome, dosha principal)             │
├──────┬──────────┬─────────┬────────┬────────┤
│Perfil│ Métricas │ Artigos │ Vídeos │ Akasha │
├──────┴──────────┴─────────┴────────┴────────┤
│  Conteúdo da aba selecionada                │
└─────────────────────────────────────────────┘
```

### Changes

**1. New file: `src/components/meudosha/MetricasTab.tsx`**
- Interface `InsightAyurvedico` with `tipo`, `titulo`, `porcentagem`, `mensagem`
- `useQuery` calling `supabase.rpc('gerar_insights_ayurvedicos', { p_registro_id })` where `p_registro_id` is the **UUID `id`** from `doshas_registros` (not the `idPublico`)
- Loading state: skeleton with pulsing text "O algoritmo está cruzando seus dados..."
- Empty state: minimal message for no insights
- Card grid: responsive `grid-cols-1 md:grid-cols-2`
  - Header: circular progress (SVG circle) showing `porcentagem` + `titulo` bold
  - `tipo === 'alerta'`: orange/red border, `AlertTriangle` icon
  - `tipo === 'sucesso'`: green border, `ShieldCheck` icon
  - Body: `mensagem` in muted text

**2. New file: `src/components/meudosha/EmBreveTab.tsx`**
- Simple placeholder with lock icon and "Em breve" message

**3. Modified: `src/pages/MeuDosha.tsx`**
- Import `Tabs, TabsList, TabsTrigger, TabsContent` from shadcn
- Import `useQuery` from TanStack Query
- After fetching `doshas_registros` by `idPublico`, store the **UUID `id`** field too (needed for RPC call)
- Add `useQuery` for insights RPC at page level (pre-fetch, `enabled` when UUID is available)
- Wrap existing content in `TabsContent value="perfil"`
- Add tabs for Métricas, Artigos, Vídeos, Akasha
- The header (dosha name) stays above tabs
- Move "Falar com Akasha" and "Refazer Teste" buttons to stay visible regardless of tab (below tabs area or in Perfil only)

### Technical Detail: Getting the UUID

The RPC `gerar_insights_ayurvedicos` requires the **UUID `id`** from `doshas_registros`, but the URL uses `idPublico`. The existing fetch already queries by `idPublico` -- we just need to also select the `id` column and pass it to the RPC.

### Pre-fetch Strategy

```typescript
const { data: insights } = useQuery({
  queryKey: ['insights-ayurvedicos', registroUuid],
  queryFn: async () => {
    const { data } = await supabase.rpc('gerar_insights_ayurvedicos', { p_registro_id: registroUuid });
    return (data as InsightAyurvedico[]) || [];
  },
  enabled: !!registroUuid,
  staleTime: 5 * 60 * 1000,
});
```

This fires on mount, so data is cached before the user clicks the tab.

