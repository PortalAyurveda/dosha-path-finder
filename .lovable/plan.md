## Diagnóstico

Investiguei o fluxo em `/terapeutas-do-brasil/cadastro` e encontrei **dois problemas**, sendo um deles a causa principal:

### 1. Causa principal: política RLS do Storage bloqueia uploads de não-admins

O bucket `terapeutas` tem essas políticas de INSERT/UPDATE em `storage.objects`:

```
"Admins can upload therapist photos"  →  WITH CHECK (bucket_id = 'terapeutas' AND is_admin())
"Admins can update therapist photos"  →  USING/CHECK (bucket_id = 'terapeutas' AND is_admin())
```

Ou seja, **só admins conseguem fazer upload nesse bucket**. Por isso você (admin) conseguiu subir foto do PC, mas os terapeutas que se cadastram normalmente recebem erro de RLS no `supabase.storage.from('terapeutas').upload(...)` — não tem nada a ver com mobile.

O erro até dispara o toast "Erro no upload", mas em mobile é fácil não ver (toast some rápido, formulário continua preenchido) e a pessoa segue, salva o cadastro e o campo `imagem` vai vazio.

### 2. Causa secundária: fotos de iPhone (HEIC) não carregam no canvas

`optimizeImageToWebP` usa `<img>` para decodificar. **Safari/Chrome não decodificam HEIC**, então `loadImage` rejeita e cai no fallback que devolve o HEIC original. Mesmo se o upload passasse, o `<img>` da página não consegue renderizar HEIC → preview some e a foto nunca aparece nas listagens.

(iPhones modernos geralmente convertem para JPEG quando enviados via `<input type="file">`, mas configurações "Manter original" ou alguns Androids podem mandar HEIC/HEIF de fato.)

---

## Plano de correção

### A. Permitir terapeutas autenticados subirem a própria foto (correção principal)

Via migration, substituir as policies de INSERT/UPDATE/DELETE no bucket `terapeutas` para permitir que qualquer usuário autenticado faça upload/update/delete dentro do bucket (mantendo SELECT público que já existe):

```sql
DROP POLICY "Admins can upload therapist photos" ON storage.objects;
DROP POLICY "Admins can update therapist photos" ON storage.objects;
DROP POLICY "Admins can delete therapist photos" ON storage.objects;

CREATE POLICY "Authenticated can upload therapist photos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'terapeutas');

CREATE POLICY "Authenticated can update therapist photos"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'terapeutas') WITH CHECK (bucket_id = 'terapeutas');

CREATE POLICY "Admins can delete therapist photos"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'terapeutas' AND is_admin());
```

Observação: o path do upload já é prefixado com `slugify(user.email)`, então mesmo permissão ampla é razoável. Se preferir restringir só ao próprio arquivo do usuário, posso amarrar `name LIKE slugify(email) || '-%'` — mas isso exige uma função SQL para o slug e adiciona complexidade; o ganho é pequeno porque já é authenticated-only.

### B. Melhorar robustez do upload no client (`TerapeutaCadastro.tsx` + `imageOptimize.ts`)

1. **Mostrar erro de RLS de forma visível e persistente** — além do toast, exibir mensagem inline embaixo do botão de upload em vermelho, que só some quando o usuário tenta de novo com sucesso. Assim ninguém envia o cadastro "sem perceber" que a foto falhou.

2. **Bloquear o submit enquanto `uploading` está ativo** e avisar caso o usuário tente enviar sem foto: hoje o `handleSubmit` não checa `uploading`. Adicionar guarda: se `uploading`, mostrar toast "Aguarde o envio da foto…" e abortar.

3. **Suporte HEIC/HEIF**: detectar `file.type === 'image/heic' | 'image/heif'` ou extensão `.heic/.heif` e:
   - tentar `createImageBitmap(file)` (funciona em alguns browsers mesmo com HEIC)
   - se falhar, exibir mensagem clara: *"Formato HEIC do iPhone não é suportado. No iPhone vá em Ajustes → Câmera → Formatos → 'Mais compatível', ou envie como JPG/PNG."*
   - opcionalmente carregar `heic2any` sob demanda (lib ~500KB) para converter — posso adicionar se você quiser conversão automática.

4. **Aumentar o limite informado**: o texto diz "até 5MB" mas o código aceita 10MB. Alinhar para "até 10MB".

5. **Validar `optimized.optimizedSize`**: se o webp gerado vier 0 bytes (memória insuficiente no mobile), tratar como falha e cair no fallback corretamente (hoje pode acontecer e passar batido).

### C. Verificar

Após aplicar, testar em mobile real (ou via DevTools com user-agent iPhone) o fluxo: login → cadastro → upload de JPG grande (>5MB) → confirmar que sobe e aparece.

---

## Pergunta para você

Quer que eu inclua **conversão automática de HEIC** via `heic2any` (adiciona ~500KB ao bundle, mas elimina o problema para iPhones com formato original)? Ou prefere só mostrar mensagem clara orientando a trocar o formato no iPhone?
