

## Problema Identificado

A regex atual só reconhece timestamps no formato `HH:MM:SS` (ex: `00:31:00`), mas **713 dos 888 vídeos** usam o formato `MM:SS` (ex: `14:00`). Apenas 173 vídeos têm `HH:MM:SS`. Por isso a maioria dos vídeos não mostra timestamps.

Além disso, na **busca comum**, ao clicar num vídeo o `VideoPlayerDialog` mostra apenas `nova_descricao` como texto simples — sem timestamps clicáveis e sem buscar `texto_para_embedding`.

## Solução

### 1. Corrigir a regex de timestamps (3 arquivos)

Atualizar `parseTimestamps` em `AdvancedVideoCard.tsx`, `AdvancedVideoResult.tsx`, e no novo código do `VideoPlayerDialog` para aceitar ambos os formatos:

```
Antes:  /(\d{2}:\d{2}:\d{2})\s*[-–]\s*(.+)/g     → só HH:MM:SS
Depois: /((\d{1,2}:)?\d{1,2}:\d{2})\s*[-–]\s*(.+)/g  → MM:SS e HH:MM:SS
```

Conversão: se tem 2 partes (`14:00`), faz `M*60 + S`; se tem 3 partes (`00:14:00`), faz `H*3600 + M*60 + S`.

### 2. Busca comum: incluir `texto_para_embedding` na query

Em `Biblioteca.tsx`, adicionar `texto_para_embedding` ao `select` da busca comum e passar para o `VideoPlayerDialog`.

### 3. Atualizar `VideoPlayerDialog` com timestamps clicáveis

Adicionar ao dialog:
- Parsear `texto_para_embedding` com a regex corrigida
- Renderizar timestamps como botões clicáveis (como no `AdvancedVideoResult`)
- Ao clicar num timestamp, atualizar o `src` do iframe com `&start=${seconds}`
- Se veio de busca avançada, receber `searchTerm` opcional e destacar (bold+sublinhado) as linhas que contêm o termo

### 4. Busca avançada: iniciar no timestamp correto

Quando o vídeo é aberto via busca avançada, passar `initialSeconds` e `searchTerm` para que o player comece na minutagem e as linhas relevantes fiquem destacadas.

### Resumo dos arquivos alterados

- `src/components/biblioteca/AdvancedVideoCard.tsx` — regex corrigida
- `src/components/biblioteca/AdvancedVideoResult.tsx` — regex corrigida  
- `src/components/biblioteca/VideoPlayerDialog.tsx` — adicionar timestamps clicáveis + highlight
- `src/pages/Biblioteca.tsx` — busca comum inclui `texto_para_embedding`, passa dados ao dialog

