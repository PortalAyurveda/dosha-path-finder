## Objetivo
Padronizar a exibição de datas e horários dos módulos da Formação em toda parte que mostra um módulo, corrigindo também o off-by-one (mostra "10 de jul" quando o salvo é 2026-07-11).

## Helpers compartilhados (novo arquivo)
Criar `src/lib/escolaModuloDatas.ts` exportando:

- `parseLocalDate(iso: string): Date` — separa `YYYY-MM-DD` (ou prefixo da string) em ano/mês/dia e monta `new Date(y, m-1, d)` para evitar o desvio de timezone que está causando "10 de jul" em vez de "11 de jul".
- `formatModuloFimDeSemana(dataInicio: string): string` — retorna a Linha 1, ex.: `"11 e 12 de Julho de 2026"` e, quando vira o mês, `"31 de Janeiro e 01 de Fevereiro de 2027"`. Sempre dois dígitos no dia, mês com inicial maiúscula em português, ano sempre presente.
- `formatModuloHorarios(tipo: string): string` — retorna a Linha 2:
  - `online` → `"Sábado 9h–17h · Domingo 9h–13h"`
  - `presencial` → `"Sábado 9h–17h · Domingo 9h–16h"`
- (Opcional) `<ModuloDataHorario />` componente leve que renderiza as duas linhas com `text-sm` em cima e `text-xs text-muted-foreground` embaixo, para uso consistente.

A ordenação/seleção de "módulo atual" continua usando `new Date(data_inicio)` como hoje — não é exibição.

## Pontos de troca (só apresentação)

1. **`src/pages/escola/EscolaAlunoModulos.tsx`** (cards dos 15 módulos)
   - Substituir o `formatDate(m.data_inicio)` local pelas duas linhas novas (fim de semana + horários por tipo). Manter o selo "Presencial em SP".

2. **`src/pages/escola/EscolaAluno.tsx`** (tarja "Próxima aula ao vivo")
   - Trocar `formatDateLong(atual.data_inicio)` pela Linha 1 (fim de semana) + Linha 2 (horários por tipo). Manter o badge "Presencial em SP".

3. **`src/pages/escola/EscolaAlunoModulo.tsx`** (cabeçalho da sala do módulo)
   - Trocar `formatDateLong(modulo.data_inicio)` pelas duas linhas novas.

4. **`src/pages/AdminEscola.tsx`** (admin Escola)
   - Linha do card de módulo (≈L143): `{formatDate(m.data_inicio)}` → as duas linhas novas.
   - Cabeçalho do editor de módulo (≈L521): `{formatDate(modulo.data_inicio)} · {tipo}` → as duas linhas novas (o tipo já fica implícito nos horários; manter um chip pequeno "Presencial"/"Online" se quiser preservar a sinalização).
   - Não tocar nas datas de `recados` (`created_at`).

5. **Landing `/curso/formacao`** — verificação feita: não existe listagem de módulos com data por módulo na landing atual. `ProgramaSection.tsx` mostra apenas "Módulos 1–5" sem datas, e a única data textual ("11 de julho de 2026") está hardcoded em `src/data/courses/formacao.ts`. Nada a fazer aqui; se você quiser que a landing também passe a listar módulo a módulo com as datas do banco, me avise que é outro escopo.

## Fora do escopo
- Nenhuma mudança em lógica de seleção de módulo atual, queries, rotas, RLS, ou banco.
- Datas de recados, posts, diário continuam como estão.
- Sem mudanças em `data_fim` (continuamos derivando o domingo como `data_inicio + 1 dia` conforme pedido).

## Validação
- Conferir no `/escola/aluno/modulos` que o módulo com `data_inicio = 2026-07-11` aparece como `"11 e 12 de Julho de 2026"` e não mais `"10 de jul"`.
- Conferir um caso de virada de mês (ex.: `2027-01-31` → `"31 de Janeiro e 01 de Fevereiro de 2027"`).
- Conferir horários: online vs presencial trocando o `tipo` no admin.
