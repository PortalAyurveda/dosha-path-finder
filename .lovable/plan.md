## Bug: "Criar mesa" volta sozinha pra tela de entrada (+ salas duplicadas)

Aplicar exatamente as duas correções identificadas. Sem mexer em mais nada do fluxo.

### 1. `src/features/rpg/GameContext.tsx` — estabilizar handlers

- Extrair `setPlayer`, `setPartyOnly` e `clearSession` do objeto `api` para `useCallback` com **deps vazias** (`[]`), declarados antes do `useMemo`. O `dispatch` do `useReducer` é estável e não precisa ser listado.
- No `useMemo` que monta `api`, apenas referenciar essas funções já estáveis (mantém o resto: `refresh`, `acao`, `discursiva`, `mode`, spread do `state`).
- Resultado: a referência de `setPartyOnly` deixa de mudar a cada tick do polling / mudança de estado.

### 2. `src/features/rpg/screens/Lobby.tsx` — não re-decidir a tela inicial

No segundo `useEffect` (o que chama `rpcEntrarParty` via `params.code` e/ou `rpcMeusPersonagens` e faz `setStep('entry' | 'saves')`):

- **Guarda de entrada** logo no topo: `if (step.name !== 'loading') return;` — assim, depois que já avançamos para `char`/`wait`/`entry`/`saves`, qualquer re-disparo é ignorado.
- **Remover `setPartyOnly`** da lista de dependências (manter `user`, `params`, `player`).

### Fora de escopo

Sala de espera, criação de personagem, tela de jogo, polling, RPCs e qualquer outro arquivo permanecem inalterados.

### Resultado esperado

Clicar "Criar mesa" navega para a etapa de classe e **permanece** lá; o polling não reverte mais o `step`; nenhuma party duplicada é criada por re-disparo do efeito.
