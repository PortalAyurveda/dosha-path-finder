## Verificação

Conferi o uso de refetch automático no projeto:

- **AkashaTab** (`src/components/meudosha/AkashaTab.tsx:143`) — já tem `refetchOnWindowFocus: false`. **Não depende do refetch on focus.**
- **Métricas** (`src/components/metricas/useMetricasData.ts:72`) — único lugar que explicitamente pede `refetchOnWindowFocus: true` (provavelmente o que você lembrava dos gráficos em tempo real).
- **Aula ao vivo banner** — usa `refetchInterval: 60_000` (polling por tempo, não por foco). Não é afetado.
- Todos os outros lugares (MeuDosha, VideosTab, ArtigosTab, DiagnosticoCompleto, HeartButton, useViewedContent) **já passam `false` localmente** — pegando o padrão atual do React Query (`true`) só sobraria o que não foi configurado individualmente.

Conclusão: ninguém depende do padrão `true`. Métricas mantém `true` explicitamente, então sobrevive a qualquer mudança global. Akasha não é afetada.

## Correção

Definir o padrão global como `false` em `src/App.tsx`:

```ts
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});
```

- Métricas continua refetchando ao focar (override local vence).
- Akasha não é impactada (já estava desativada).
- Resto do app para de piscar ao voltar para a aba.

## Limpeza opcional (não vou fazer agora salvo se você pedir)

Os `refetchOnWindowFocus: false` espalhados pelos componentes ficam redundantes após a mudança global. Podem ser removidos depois para limpar — mas não atrapalham e podem ficar como estão.

## Arquivos afetados

- `src/App.tsx` — instanciação do `QueryClient`.