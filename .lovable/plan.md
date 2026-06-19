## Diagnóstico

O `perfilFilter` padrão é `"Edson"` (capitalizado), mas a coluna `perfis` (text[]) do `portal_devlog` armazena os valores em minúsculas: `"edson"`, `"marcos"`, `"marcelle"`, `"estoque"`. O filtro usa `.includes(perfilFilter)`, que é case-sensitive, então a comparação sempre falha e a lista fica vazia.

## Correções

1. **Case-insensitive no filtro** — transformar tanto o valor selecionado quanto os itens do array para minúsculo antes de comparar:
   ```ts
   (e.perfis || []).map(p => p.toLowerCase()).includes(perfilFilter.toLowerCase())
   ```
2. **Padrão "all"** — iniciar `perfilFilter` como `"all"` (Ver tudo), para a página abrir mostrando todos os módulos independentemente de caixa alta/baixa.
3. **Log da query** — adicionar `console.log` no fetch de `portal_devlog` exibindo `data.length`, `error` e, se útil, uma amostra dos valores de `perfis`, confirmando que os dados chegam.
4. **Indicador de lista vazia por filtro** — quando `filtered.length === 0` mas `entries.length > 0`, mostrar abaixo dos seletores uma linha discreta: "Nenhum módulo corresponde aos filtros selecionados."

## Validação esperada

- "Ver tudo" → 25 módulos.
- "Edson" → 25 módulos.
- "Marcelle" → 17 módulos.
- "Marcos" → 8 módulos.
- "Estoque" → 2 módulos.

Sem mudanças no banco, schema ou no tipo `DevlogEntry`.

**Arquivo:** `src/pages/AdminDashboard2.tsx`