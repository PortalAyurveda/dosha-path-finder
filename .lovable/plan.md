## Objetivo

Criar uma página dedicada `/registros` para listar os Registros Akáshikos (tabela `akasha_memory`), com paginação, busca por texto e filtro por tags. Conectar todos os links "Ver todos" e "Voltar" do index/registro singular para essa nova rota (hoje apontam para `/metricas`).

## Páginas e rotas

**Nova rota:** `/registros` → nova página `src/pages/RegistrosAkashikos.tsx`
- Cabeçalho: título "Registros Akáshikos" + subtítulo curto + logo da Akasha
- Barra de busca por texto (input com debounce ~300ms) — busca em `titulo` e `texto_inicio` (ilike)
- Linha rolável horizontal de chips de tags (vindos de `akasha_tags_inventory`, ordenados por `count` DESC). Clicar alterna seleção; pode-se selecionar várias (AND ou OR — uso OR por simplicidade)
- Lista de registros no mesmo estilo visual do componente do index (`RegistrosAkashikos.tsx`): hora + título + emojis das tags
- 15 itens por página
- Paginação no rodapé usando `PaginationControls` (já existe)
- Estados: loading skeleton, vazio ("Nenhum registro encontrado"), erro

**Query Supabase**
- `from("akasha_memory").select("id, titulo, texto_inicio, tags, data_postagem", { count: "exact" })`
- `.not("titulo", "is", null)`
- Se houver texto: `.or("titulo.ilike.%q%,texto_inicio.ilike.%q%")`
- Se houver tags selecionadas: `.or(tags_selecionadas.map(t => "tags.ilike.%t%").join(","))`
- `.order("data_postagem", { ascending: false })`
- `.range((page-1)*15, page*15-1)`
- `totalPages = Math.ceil(count / 15)`

## Ajustes em arquivos existentes

**`src/App.tsx`** — registrar a nova rota `/registros` apontando para `RegistrosAkashikos`.

**`src/components/index/RegistrosAkashikos.tsx`** (componente do index)
- Trocar o link "Ver todos os registros" de `/metricas` para `/registros`
- Tornar o título "Registros de Akasha, nossa I.A." e o cabeçalho "Registros Akashikos" do feed em `<Link to="/registros">` clicáveis (mantendo o estilo, com hover sutil)

**`src/pages/RegistroAkashico.tsx`** (registro singular)
- Trocar os dois `Link to="/metricas"` ("Voltar aos registros" e "Ver todos os registros" no estado de erro) para `/registros`

## Estrutura visual da página `/registros`

```text
┌──────────────────────────────────────────────────┐
│  [logo] Registros Akáshikos                      │
│  Memória viva das perguntas da comunidade.       │
│                                                  │
│  [🔎 Buscar por texto...........................]│
│                                                  │
│  [#Pitta 🔥] [#Vata 🌬️] [#Kapha 🪵] [#Sono 🛏️]…│
│                                                  │
│  ┌──────────────────────────────────────────┐    │
│  │ 14:32  Título do registro      🌬️🪔     │    │
│  │ 14:18  Outro título             🔥       │    │
│  │ … (15 itens)                             │    │
│  └──────────────────────────────────────────┘    │
│                                                  │
│         ‹ Anterior  1 2 3 … 12  Próxima ›        │
└──────────────────────────────────────────────────┘
```

## Notas técnicas

- Reutilizo `PageContainer`, `PaginationControls`, e padrões visuais (cor `AKASHA #9b73ad`, leaf radius) do componente do index para manter consistência.
- Estado da página/busca/tags pode ficar em React state local (sem URL params nesta primeira versão) — simples e suficiente.
- Tags vêm de `akasha_tags_inventory` (RLS permite leitura? Tabela está sem policies — vou conferir e, se necessário, listar tags estáticas a partir do próprio `akasha_memory` distintos, ou propor migration. Plano A: tentar `akasha_tags_inventory`; se bloqueado, derivar as 20 tags mais frequentes via RPC ou query agregada em `akasha_memory.tags`).
- Sem mudanças de schema previstas.

## Fora de escopo

- Não mexer em `/metricas` nem nos componentes de métricas.
- Sem deep-linking de busca por URL nesta primeira versão.
