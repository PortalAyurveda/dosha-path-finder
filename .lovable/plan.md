## Problema
Na tabela `doshas_registros` existem 2 policies de SELECT:
- `anon`: `USING (true)` ✅ libera tudo
- `authenticated`: `USING (is_admin() OR email = jwt.email)` ❌ só deixa ver o próprio registro

Quando você está logado e abre `/meu-dosha?id=...` de outra pessoa, cai na regra de `authenticated` → bloqueado.

## Mudança
Migration para trocar a policy de SELECT de `authenticated` por uma equivalente à de `anon`:

```sql
DROP POLICY "Authenticated reads own or admin reads all" ON public.doshas_registros;

CREATE POLICY "Authenticated can read all dosha registros"
ON public.doshas_registros
FOR SELECT
TO authenticated
USING (true);
```

Resultado: qualquer pessoa (logada ou não) consegue abrir qualquer página `/meu-dosha`, como já acontece quando deslogado.

## O que NÃO muda
- INSERT continua aberto para anon/authenticated (como já era)
- DELETE continua restrito a admin
- Nenhum código frontend precisa mudar

## Consideração de segurança
A tabela `doshas_registros` passa a ser 100% pública de leitura. Ela contém email, nome, idade, IMC e respostas do teste de dosha. Se você quiser manter privacidade desses campos no futuro, o caminho seria criar uma view pública só com os campos visíveis na página. Mas pelo que você descreveu, o objetivo é exatamente que qualquer um veja qualquer página — então a migration acima resolve.