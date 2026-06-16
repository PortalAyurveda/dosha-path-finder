
## 1. Corrigir sobreposição no gráfico Agni (EvolucaoSheet)

Arquivo: `src/components/meudosha/metricas/AgniMiniChart.tsx`

Hoje os rótulos ("Diagnóstico", "Revisão de Junho", "Meta") são empilhados acima do tick do mês no eixo X, e o primeiro rótulo invade os labels do eixo Y ("Bom/Iniciando/Moderado/Agravado").

Mudanças:
- Remover os rótulos do `XAxis` tick (deixar só o nome do mês em baixo).
- Renderizar os rótulos como `<Label>` em cima de cada `ReferenceLine` (já existente em cada `p.t`), com `position="top"`, fonte 10, peso 700, cor primária. Isso ancora o rótulo no instante do ponto e não no início do mês, eliminando colisão com o eixo Y.
- Truncar rótulos longos para no máx ~14 chars (ex.: "Revisão de Junho" → "Rev. Junho") com helper local.
- Aplicar o mesmo ajuste em `DoshasEvolutionChart.tsx` para manter consistência visual.

## 2. Remover "Seu plano clínico" da aba de Gráficos

Arquivo: `src/components/meudosha/EvolucaoSheet.tsx`
- Remover render de `<ObjetivosPremiumBlock>` (e fallback "Seu plano de acompanhamento ainda está sendo preparado").
- Remover import não utilizado.

## 3. Mover o "Plano clínico" para a aba Perfil de /meu-dosha

Arquivo: `src/components/meudosha/DiagnosticoCompleto.tsx`, componente `Diagnostico` (linhas ~316-374).

- Renomear título de `Seu Diagnóstico: {dosha}` para `Seu plano clínico: {dosha}`.
- Adicionar, ANTES dos três blocos (Situação Atual / O Que Te Trouxe / Caminhos), uma nova seção "Objetivos" com bullets vindos de `analise.objetivos` (já disponível em `ObjetivoTratamento` — é a mesma fonte usada em `ObjetivosPremiumBlock`).
  - Estilo: card com mesmo `LEAF` e borda lateral cor do dosha, header "OBJETIVOS" no padrão das outras seções, lista `<ul>` com bullets coloridos.
  - Se `analise.objetivos` vier vazio, omite a seção (não quebra layout).
- Os 3 blocos narrativos atuais continuam abaixo, inalterados.

Tipo `ObjetivoTratamento` já expõe `objetivos: string[]` (visto em `ObjetivosPremiumBlock`), então não precisa de mudança de API/tipos.

## 4. Liberar o card de revisão para todos os usuários

Arquivo: `src/components/meudosha/RetesteCard.tsx`

Hoje só ativa para admin (`const email = role === "admin" ? user?.email : null`). Mudar para:
- `const email = user?.email ?? null;`
- Manter o gate dos 30 dias após `created_at` do último teste e a checagem de "concluido recente / em andamento" exatamente como já está.
- Sem mudanças visuais.

## Técnico

- Não há mudanças de schema nem de RLS.
- Não toca em `MetricasGraficos.tsx` (a página /metricas/graficos não exibe o plano clínico — o usuário se referiu ao modal "Gráficos" aberto via EvolucaoSheet).
- Sem novas dependências.
