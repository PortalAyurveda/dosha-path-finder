## Pré-preencher dados do usuário logado no checkout

### O que temos hoje (de onde vem o dado)
O `UserContext` (`src/contexts/UserContext.tsx`) já expõe, quando o usuário está logado:
- `user.email` — email do auth
- `profile.nome` — vem da tabela `user_profiles`
- `doshaResult.nome` — vem do último registro em `doshas_registros` por email

Endereço completo (logradouro, número, bairro, CEP, CPF, telefone) **não está armazenado em lugar nenhum** hoje no projeto — `doshas_registros` só tem `cidade`, `estado` e `pais`, e `user_profiles` não tem campos de endereço. Então só dá para pré-preencher: **nome, email e, se quiser, cidade/UF** (esses dois com cuidado, porque o ViaCEP/CEP do carrinho deve ter prioridade).

### Mudanças

**Arquivo:** `src/components/loja/CartDrawer.tsx`

1. Importar `useUser` de `@/contexts/UserContext`.
2. Ler `user`, `profile`, `doshaResult` do contexto.
3. Adicionar um `useEffect` que dispara quando `step === "checkout"` (ou quando o drawer abre), e faz merge não-destrutivo no `form`:
   - `nome`: `profile?.nome ?? doshaResult?.nome ?? ""` — só preenche se o campo estiver vazio
   - `email`: `user?.email ?? ""` — só preenche se o campo estiver vazio
   - Não tocar em telefone, CPF, logradouro, número, complemento, bairro (não temos esses dados).
   - Cidade/UF: **não pré-preencher** a partir de `doshaResult` — o ViaCEP do CEP informado já cuida disso e é mais confiável (evita conflito).

4. Se o usuário não estiver logado, comportamento atual continua igual (tudo em branco).

### Por que não persistir mais nada agora
O usuário não pediu pra criar tabela de endereço/cliente. Quando quisermos lembrar endereço completo entre compras, criamos depois uma tabela `loja.clientes` (ou similar) ligada ao `user_id` e populamos a partir dos dados de checkout — fica como próximo passo, não escopo desta tarefa.

### Resultado esperado
Usuário logado abre o carrinho → calcula frete → clica "Seguir" → na tela de dados, o **nome** e **email** já aparecem preenchidos, e ele só precisa completar telefone, CPF e endereço. O CEP continua vindo da etapa anterior (já implementado).