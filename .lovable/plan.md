## Objetivo

Criar `/admin/teste`: sanfona com as 9 Partes do teste, onde você visualiza, cria, edita e remove perguntas/respostas e atribui pontuações **clicando em chips** (Vata, Pitta, Kapha, Agni Irregular/Forte/Fraco — positivos e negativos), sem digitar números soltos. Inclui **histórico de edições** (rollback) e **snapshot v1.0** do estado atual antes de qualquer mudança.

A página pública `/teste-de-dosha` passa a ler perguntas dessa fonte editável, mantendo a lógica de cálculo já existente.

---

## Auditoria das pontuações existentes hoje

Levantamento completo do que `doshaTestQuestions.ts` gera e do que aparece em `doshas_registros`:

**Eixos de pontuação usados** (chaves em `option.scores`):
- `v` (Vata), `p` (Pitta), `k` (Kapha)
- `agni_irregular`, `agni_forte`, `agni_fraco`

**Valores observados hoje**: `1`, `2`, `3` (sempre positivos). O admin vai suportar **negativos também** (ex.: `k -1`) para abrir caminho a perguntas que reduzem um dosha.

**Combinações usadas em options atuais** (exemplos reais do arquivo):
- `{ v: 2 }`, `{ p: 2 }`, `{ k: 2 }`, `{ k: 3 }`, `{ v: 3 }`
- `{ v: 1, p: 1 }`, `{ v: 1, k: 1 }`, `{ v: 2, p: 2 }`, `{ p: 2, k: 2 }`, `{ v: 2, k: 2 }`
- `{ v: 2, agni_irregular: 1 }`, `{ p: 2, agni_forte: 1 }`, `{ k: 2, agni_fraco: 1 }`
- `{ v: 2, agni_irregular: 2 }`, `{ p: 2, agni_forte: 2 }`, `{ k: 2, agni_fraco: 2 }`
- `{ v: 2, p: 2, agni_irregular: 1, agni_forte: 1 }`
- `{ k: 2, v: 1, agni_fraco: 2 }`
- `{}` (opção neutra — "Sou homem / menopausa")

**Tags da Parte 8 e Alimentos** (hoje os pesos são fixos no código):
- `FOOD_TAGS` → +1 no dosha do grupo
- `AGRAVAMENTOS_*` → +2 no dosha respectivo

**No novo admin esses pesos deixam de ser fixos**: cada tag de alimento ou agravamento terá seu próprio set de chips, igual às opções de pergunta. O default no seed mantém os valores atuais (+1 alimentos, +2 agravamentos), mas você pode editar individualmente.

**O que sai gravado em `doshas_registros`** (resultado, não pontuação editável):
`vatascore`, `pittascore`, `kaphascore`, `agniirregular`, `agniforte`, `agnifraco`, `doshaprincipal`, `agniPrincipal`, `imc`, mais as tags concatenadas (`agravVataTags`, `alimVata`, etc.). A fórmula de soma + modificadores idade/IMC + regra de "agni winner" continua no código (não é conteúdo).

---

## Snapshot v1.0 antes de tudo

Antes de qualquer edição:

1. **Arquivo congelado**: copiar `src/data/doshaTestQuestions.ts` para `src/data/doshaTestQuestions.v1.ts` (somente leitura, marcado com comentário "snapshot v1.0 — não editar").
2. **Migration de seed** popula a nova tabela `dosha_test_questions` exatamente com o conteúdo atual e cria a **primeira versão** (`version_number = 1`, `label = 'v1.0 — estado original'`) na tabela de histórico.
3. Dump JSON do estado inicial salvo também em `dosha_test_versions` (snapshot completo serializado), para rollback de 1 clique.

---

## Estrutura final do admin

Sanfona com **9 seções** (mesma ordem de `STEP_CONFIG`):

```text
▸ Parte 1: Mente e Emoções          [+ Nova pergunta]
▸ Parte 2: Digestão e Fome
▸ Parte 3: Excreção
▸ Parte 4: Tecidos Corporais
▸ Parte 5: Vitalidade
▸ Parte 6: Rotina Diária
▸ Parte 7: Adicionais
▸ Parte 8: Agravamentos             (3 listas Vata/Pitta/Kapha + bloco Alimentos)
▸ Parte 9: Finalização              (somente leitura — campos fixos + interesses)
```

Topo da página: **barra de versões** com "Versão atual: vN", botão **Salvar nova versão** (campo de label opcional), botão **Histórico** (lista todas as versões com data/autor/label e botão "Restaurar").

### ScoreTagPicker (núcleo do pedido)

Para cada opção/tag, uma linha de chips agrupados por eixo:

```text
Vata:  [-3] [-2] [-1] [+1] [+2] [+3]
Pitta: [-3] [-2] [-1] [+1] [+2] [+3]
Kapha: [-3] [-2] [-1] [+1] [+2] [+3]
Agni Irregular: [-2] [-1] [+1] [+2]
Agni Forte:     [-2] [-1] [+1] [+2]
Agni Fraco:     [-2] [-1] [+1] [+2]
```

- Dentro de **um eixo**, os chips são mutuamente exclusivos (clicar `+2` em Vata troca o valor de Vata para 2; clicar de novo desmarca → 0).
- **Entre eixos** você pode combinar à vontade (ex.: `v+2 p+2 k-1 agni_irregular+1`).
- Eixos com 0 não viram chave no JSON salvo (mantém o shape limpo).
- Resumo textual à direita ("v+2 · p+2 · k−1") para leitura rápida.

### Parte 1–7

Cada pergunta = cartão com texto editável, lista de opções (texto + ScoreTagPicker), botões: **+ Adicionar opção**, **Remover opção**, **Remover pergunta**, **Duplicar**, drag handle. Rodapé: **+ Nova pergunta**.

### Parte 8 (Agravamentos + Alimentos)

Mesmo cartão simplificado: cada item tem `label` editável e ScoreTagPicker próprio. Botões add/remove/reordenar dentro de cada grupo (Vata/Pitta/Kapha para agravamentos; Vata/Pitta/Kapha para alimentos).

### Parte 9

Visualização somente-leitura dos campos fixos (email, altura, peso, localização, interesses, relato) com nota explicativa.

---

## Banco de dados

### Tabela `dosha_test_questions` (conteúdo vivo)

| Coluna | Tipo | Uso |
|---|---|---|
| `id` | uuid PK | |
| `part` | text | `part1`…`part7`, `agravamentos`, `foods` |
| `group` | text null | `vata` / `pitta` / `kapha` (Parte 8 e foods) |
| `sort_order` | int | ordem dentro da parte/grupo |
| `text` | text null | texto da pergunta (Parte 1–7) |
| `options` | jsonb | `[{ label, scores: {v?,p?,k?,agni_irregular?,agni_forte?,agni_fraco?} }]` |
| `tag_label` | text null | usado em itens simples (foods/agravamentos), pareado com `options[0].scores` |
| `created_at` / `updated_at` | timestamptz | |

### Tabela `dosha_test_versions` (histórico/rollback)

| Coluna | Tipo | Uso |
|---|---|---|
| `id` | uuid PK | |
| `version_number` | int | autoincrement por versão |
| `label` | text | "v1.0 — estado original", ou nome livre |
| `snapshot` | jsonb | dump completo de `dosha_test_questions` no momento do save |
| `created_by` | uuid null | `auth.uid()` do admin |
| `created_at` | timestamptz | |

**Restaurar versão** = transação que apaga linhas atuais e reinsere as do snapshot, depois grava nova versão "Restaurado da vN".

**RLS** (ambas tabelas):
- SELECT público em `dosha_test_questions` (anon+authenticated) — pra `/teste-de-dosha` ler.
- INSERT/UPDATE/DELETE só `is_admin()`.
- `dosha_test_versions`: SELECT/INSERT só admin.

---

## Mudanças no código

1. **Migration Supabase**:
   - Cria `dosha_test_questions` + `dosha_test_versions` com RLS.
   - Seed completo a partir de `doshaTestQuestions.ts`.
   - Insere primeira linha em `dosha_test_versions` (`version_number=1, label='v1.0 — estado original'`).

2. **`src/data/doshaTestQuestions.v1.ts`** (novo, congelado) — cópia exata do atual, marcado como snapshot.

3. **`src/lib/doshaTest.ts`** (novo) — fetcher + tipos. Hook `useDoshaTestContent()` retorna `{ part1..7, agravamentos, foods }` no shape esperado por `TesteDeDosha`. Inclui fallback para `doshaTestQuestions.v1.ts` se a query falhar.

4. **`src/pages/TesteDeDosha.tsx`** — troca imports estáticos pelo hook; mantém `calculateResults`, modificadores idade/IMC, regra agni e submit. Loading state.

5. **Admin**:
   - Renomear `src/pages/AdminTeste.tsx` → `src/pages/AdminTesteRegistros.tsx` (a lista de testes submetidos continua funcionando).
   - Novo `src/pages/AdminTeste.tsx` com a sanfona de edição + barra de versões.
   - `src/components/admin/teste/` com `PartAccordion`, `QuestionCard`, `OptionRow`, `ScoreTagPicker`, `TagListEditor`, `VersionBar`, `VersionHistoryDialog`.

6. **`src/components/admin/AdminNav.tsx`** — adicionar item "Testes — Registros" (`/admin/teste/registros`); o item "Testes" passa a apontar pro editor.

7. **`src/App.tsx`** — adicionar rota `/admin/teste/registros`.

---

## Fora do escopo (confirmar antes de codar)

- Edição dos **modificadores fixos** do app: idade, IMC, regra de "agni winner", limiar de dosha duplo (≥11). Continuam no código de `calculateResults`.
- Edição da Parte 9 (campos fixos do usuário, 5 interesses fixos).
- Edição inline do nome/subtítulo das 9 Partes (continuam no `STEP_CONFIG`).

Se quiser que algum desses entre, me avise antes de eu começar.
