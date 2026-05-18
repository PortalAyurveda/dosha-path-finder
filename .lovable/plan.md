## Diagnóstico

A Edge Function `sitemap` **está funcionando** quando chamada direto:
- `https://api.portalayurveda.com/functions/v1/sitemap` → **334 URLs** (24 estáticas + 289 artigos + 10 aulas + 11 terapeutas) ✅

O problema está em `https://portalayurveda.com/sitemap.xml` (que faz proxy via `public/_redirects` para a Edge Function):
- Retorna **44 URLs** apenas — **0 artigos**, 10 aulas, 11 terapeutas.
- Mesmo `etag` toda hora → resposta **cacheada** na CDN do Lovable/Cloudflare.

**Causa raiz:** numa das primeiras execuções da function (logo após deploy), o `select` em `portal_conteudo` retornou vazio (provavelmente cold-start / erro transiente). A function continuou e respondeu **HTTP 200 com `Cache-Control: public, max-age=3600`**. A CDN gravou esse XML capenga e está servindo há ~1h+. Mesmo o etag indica resposta congelada.

Resumindo, o Google/usuário não vê 404, mas vê um sitemap quase vazio (sem artigos) — efetivamente "quebrado".

## Correções propostas em `supabase/functions/sitemap/index.ts`

1. **Não cachear respostas incompletas.** Se qualquer um dos três `select`s (artigos, aulas, terapeutas) falhar ou retornar 0 quando esperamos >0, responder com `Cache-Control: no-store` (ou `max-age=60`) e logar warning. Isso evita que a CDN congele um sitemap defeituoso por 1 hora.
2. **Usar `SUPABASE_SERVICE_ROLE_KEY`** em vez do anon key. O service role bypassa RLS e elimina qualquer chance de a tabela `portal_conteudo` voltar vazia por política de leitura para anônimo. (É seguro: a function só lê e devolve XML público.)
3. **Reduzir cache de sucesso** para `public, max-age=600, s-maxage=600` (10 min em vez de 1h), com `stale-while-revalidate=3600`. Sitemap atualiza mais rápido quando publicar artigo novo.
4. **Subir paginação** de `portal_conteudo` para suportar crescimento (`limit=5000` em vez de 2000) — hoje já tem 290+, sobra folga.

## Após o deploy

A function redeploya automático. Para destravar o cache atual imediatamente, basta uma chamada que devolva conteúdo novo (etag diferente) — a CDN substitui. Se ainda servir velho, podemos forçar query string `?v=2` no `_redirects` temporariamente, mas normalmente não é preciso.

## Arquivos a alterar
- `supabase/functions/sitemap/index.ts` (única alteração)

Sem mudanças de DB, rotas ou frontend.