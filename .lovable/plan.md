## Problema

O bucket `terapeutas` tem política de INSERT restrita ao role `authenticated`:

```
INSERT  roles={authenticated}  with_check: bucket_id = 'terapeutas'
```

Mas a página `/terapeutas-do-brasil/cadastro` é pública — o terapeuta envia a foto antes/sem estar logado. Resultado: o upload retorna `new row violates row-level security policy` e o cadastro quebra.

Auditei também:
- SELECT público já existe (foto aparece depois)
- UPDATE/DELETE seguem restritos (correto)
- Bucket existe e está acessível
- O código em `TerapeutaCadastro.tsx` (linha 236) usa `supabase.storage.from("terapeutas").upload(...)` — está correto, o problema é só RLS

## Correção

Migração que adiciona política de INSERT para `anon` (e mantém a de `authenticated`):

```sql
CREATE POLICY "Anyone can upload therapist photos"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'terapeutas');

DROP POLICY "Authenticated can upload therapist photos" ON storage.objects;
```

Mantenho UPDATE/DELETE restritos a `authenticated`/`admin` para que ninguém anônimo sobrescreva foto alheia. Como o nome do arquivo já é gerado com slug + timestamp no código, não há risco prático de colisão/sobrescrita por anônimos.

Nada mais muda — só a política de storage.
