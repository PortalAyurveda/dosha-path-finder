Ajustes cirúrgicos em `src/pages/Auth.tsx` para melhorar a conversão da prévia do teste de dosha.

1. **Pré-preencher e-mail a partir do `?claim=IDPUBLICO`**
   - Adicionar um `useEffect` que lê o parâmetro `claim`, consulta a tabela `doshas_registros` (coluna `idPublico`) para obter o `email` correspondente e preenche o campo de e-mail (`setEmail`) quando encontrado.
   - Incluir flag `cancelled` para evitar atualização de estado após desmontagem.

2. **Priorizar `claim` no redirect pós-login**
   - No `useEffect` de redirect, alterar a resolução do `fallbackId` para:
     ```text
     searchParams.get("claim") -> doshaResult?.idPublico -> localStorage.getItem("activeDoshaId")
     ```
   - Isso garante que o usuário seja redirecionado de volta ao `/meu-dosha?id=...` correto imediatamente após o login, sem depender de timing do contexto nem de `localStorage`.

Fora desses dois pontos, nenhum outro código de `Auth.tsx` será alterado (OTP, Google, templates e UI permanecem intactos).