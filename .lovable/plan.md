## Diagnóstico

Dois bloqueios independentes estão impedindo o envio:

### 1. Backend — falta GRANT (bloqueia TODO mundo, inclusive Brasil)
A tabela `public.escola_alunos` tem RLS aberta para insert (`with check = true`), mas **nenhum GRANT INSERT** foi concedido a `anon` ou `authenticated`. Resultado: o PostgREST rejeita com *permission denied for table escola_alunos* e o `try/catch` no formulário mostra "não foi possível enviar". É a causa principal de quem "preenche e nada acontece".

### 2. Frontend — campos travam estrangeiros e usuários com algum campo vazio
- `estado` e `cidade` são `<select>` populados pelo IBGE (só UFs brasileiras). Usuário em Portugal não consegue selecionar nada.
- Vários inputs têm `required` do HTML5 → se faltar um, o browser bloqueia o submit sem mensagem visível clara.

## Mudanças

### A. Migration (Supabase) — destravar inserts
```sql
GRANT INSERT ON public.escola_alunos TO anon, authenticated;
GRANT SELECT, UPDATE ON public.escola_alunos TO authenticated;
GRANT ALL ON public.escola_alunos TO service_role;
```
(o GRANT já refletido em todas as sessões; nada de republish para isso.)

### B. `src/pages/curso/FormacaoInscricao.tsx` — liberar geral
- Remover `required` de **todos** os campos.
- Trocar `<select>` de **estado** e **cidade** por `<Input>` de texto livre. Mantemos o autocomplete IBGE como *sugestão opcional* via `<datalist>` (Brasil), mas qualquer texto vale — inclusive "Lisboa / Portugal".
- Manter o mínimo que o banco exige (`NOT NULL`): se `email`, `nome` ou `whatsapp` vierem em branco, exibir aviso amigável **acima do botão** em vez de travar; só não envia se esses três estiverem vazios — qualquer outra combinação envia.
- Botão `<button type="submit">` continua sempre clicável, sem `disabled`, sem `opacity`.
- Tratamento de erro: se o insert falhar, mostrar a mensagem real do Supabase para a gente conseguir diagnosticar caso ainda haja algo.

### C. Publish
Depois das mudanças no frontend, o usuário precisa clicar **Publish → Update** para que `portalayurveda.com` receba a nova versão. O GRANT já vale para a versão atual no ar também.

## O que NÃO muda
- Sem alteração em outras telas, módulos, escola, admin.
- Sem alteração no design system (paleta `formacao-azul`, tipografia).
- Sem mexer em policies RLS além do GRANT.

## Resumo dos arquivos
- **migration nova** — GRANTs em `escola_alunos`.
- **`src/pages/curso/FormacaoInscricao.tsx`** — remover `required`, trocar selects de estado/cidade por inputs livres, exibir erro real do Supabase, manter botão sempre clicável.
