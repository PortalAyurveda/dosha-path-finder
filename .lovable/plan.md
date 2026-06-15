## Refatoração da página /revisao

Substituir o fluxo atual (RetesteChat) por uma máquina de estados estruturada que conversa com o webhook `https://n8n.portalayurveda.com/webhook/reteste-revisao` em três ações (`hello`, `gerar`, `calcular`) e exibe a última revisão concluída salva em `reteste_sessao`.

### 1. Carregamento inicial — última revisão concluída

Ao montar, buscar em `reteste_sessao`:
- `user_email = user.email`, `status = 'concluido'`
- `order by created_at DESC limit 1`
- Ler o campo `resultado` (jsonb)

Se existir, renderizar bloco "Sua última revisão":
- Texto principal: `resultado.sintese`
- Comparativos: `vatascore_antes → vatascore_depois`, idem Pitta e Kapha
- `resultado.novoDosha`
- `resultado.data_revisao` formatado como `dd/MM/yyyy` (pt-BR)

Se não existir: mensagem neutra "Você ainda não tem uma revisão concluída."

O resumo compacto atual (pie chart + scores do último teste) é mantido acima.

### 2. Máquina de estados do fluxo de nova revisão

Estados: `idle | hello_loading | hello_done | gerar_loading | form | calcular_loading | concluido`

Variáveis de estado adicionais:
- `sessaoId: string | null`
- `akashaHello: string`
- `perguntas: Array<{ id: number; pergunta: string }>`
- `respostas: Record<number, 'A'|'B'|'C'|'D'|'E'>`
- `pesoDelta: number` (default 0, clamp -20..+20)
- `sinteseNova: string`
- `erro: string | null`

Todas as chamadas usam `fetch` POST JSON para `https://n8n.portalayurveda.com/webhook/reteste-revisao`. Em erro de rede ou status não-ok: volta ao estado anterior e exibe "Erro ao processar. Tente novamente."

### 3. UI por estado

**`idle`** — botão primário "Fazer revisão".
- onClick → `hello_loading` → POST `{ action:'hello', email, nome }`
- resposta: `sessao_id` → `sessaoId`, `resposta` → `akashaHello`, estado → `hello_done`

**`hello_done`** — renderiza `akashaHello` em card + botão "Gerar revisão".
- onClick → `gerar_loading` → POST `{ action:'gerar', email, nome, sessao_id }`
- resposta: `perguntas` → state, estado → `form`

**`form`** — formulário das 8 perguntas:
- Para cada `{id, pergunta}`, exibe o texto + 5 radios:
  - A) Melhorei muito  B) Melhorei um pouco  C) Igual  D) Piorei um pouco  E) Piorei muito
- Salva em `respostas[id] = letra` (shadcn `RadioGroup` + `Label`)
- Campo de peso abaixo: label "Variação de peso nos últimos 30 dias (kg)", botões `-` e `+` ao redor do valor atual:
  - `> 0` → `+N kg`, `< 0` → `N kg`, `= 0` → `0 kg`
  - Clamp em [-20, +20]
- Botão "Enviar revisão" só habilita quando `Object.keys(respostas).length === perguntas.length`
- onClick → `calcular_loading` → POST:
  ```json
  { "action":"calcular", "email":..., "nome":..., "sessao_id":...,
    "respostas":[{"id":Number,"resposta":"A".."E"}, ...],
    "peso_delta": number }
  ```
- resposta: `sintese` → `sinteseNova`, estado → `concluido`, e re-executa a query da revisão concluída no Supabase para atualizar o bloco de cima.

**Loadings (`hello_loading`, `gerar_loading`, `calcular_loading`)** — spinner com texto contextual ("Akasha está preparando sua revisão...", "Gerando perguntas...", "Calculando sua nova síntese...").

**`concluido`** — exibe mensagem curta "Revisão concluída" e o bloco "última revisão" no topo já refletirá os novos dados.

### 4. Detalhes técnicos

- Arquivo afetado: `src/pages/Revisao.tsx` (reescrita do componente).
- **Remover** o uso de `RetesteChat`, `initialMessages`, `reteste_chat_history` e a criação automática de sessão `em_andamento` — o novo fluxo cria a sessão no backend (`hello` retorna `sessao_id`).
- Manter o resumo compacto atual (pie chart + badges Vata/Pitta/Kapha + Agni).
- Usar componentes shadcn existentes: `Button`, `RadioGroup`, `RadioGroupItem`, `Label`, `Card`.
- Formatação de data: `new Date(resultado.data_revisao).toLocaleDateString('pt-BR')`.
- Tipagem do `resultado` em interface local `RevisaoResultado` (sintese, vatascore_antes/depois, pittascore_antes/depois, kaphascore_antes/depois, novoDosha, data_revisao).
- Não alterar schema do Supabase nem outros componentes.

### Diagrama de fluxo

```text
idle ──(Fazer revisão)──▶ hello_loading ──ok──▶ hello_done
                                │err
                                └─▶ idle + erro

hello_done ──(Gerar revisão)──▶ gerar_loading ──ok──▶ form
                                     │err
                                     └─▶ hello_done + erro

form ──(Enviar revisão)──▶ calcular_loading ──ok──▶ concluido
                                  │err                  │
                                  └─▶ form + erro       └─▶ refetch reteste_sessao
```
