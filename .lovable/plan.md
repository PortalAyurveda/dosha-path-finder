## Sitemap dinâmico via Supabase Edge Function

### 1. Nova Edge Function `sitemap`
Arquivo: `supabase/functions/sitemap/index.ts`

- Pública (sem JWT), responde `GET` com `Content-Type: application/xml` e `Cache-Control: public, max-age=3600`.
- CORS liberado para qualquer origem.
- Usa `createClient` com `SUPABASE_URL` + `SUPABASE_ANON_KEY` (RLS já permite leitura pública nas tabelas envolvidas).

**Rotas estáticas** (mesmas que hoje estão em `scripts/generate-sitemap.ts` + as novas pedidas):
- `/` (weekly, 1.0)
- `/teste-de-dosha` (monthly, 0.9)
- `/biblioteca` (weekly, 0.8) e sub-rotas vata/pitta/kapha + horarios/alimentacao/remedios/videos/avancado (0.5–0.7)
- `/biblioteca/horarios` (0.5)
- `/blog` (weekly, 0.9)
- `/curso/alimentacao`, `/curso/formacao`, `/curso/rotinas` (monthly, 0.7)
- `/terapeutas-do-brasil` (weekly, 0.8) e `/terapeutas-do-brasil/cadastro` (0.5)
- `/samkhya`, `/samkhya/kits`, `/samkhya/todos` (weekly, 0.7–0.8)
- `/assinar` (monthly, 0.8)
- `/contato` (monthly, 0.5) — novo
- `/politica-de-privacidade`, `/termos-de-uso` (0.3)

**Conteúdo dinâmico**:
- `portal_conteudo` onde `status = 'published'` e `link_do_artigo not null` → `/blog/{link_do_artigo}` (monthly, 0.8, `lastmod` = `created_at`).
- `aulas_ao_vivo` (todos os registros) → `/aula/{slug}` (monthly, 0.7, `lastmod` = `created_at`).
- `portal_terapeutas` com `status = 'aprovado'` → `/terapeutas-do-brasil/{terapeutas(dinamica)}` (monthly, 0.6) — mantém o que o script atual já fazia, para não perder URLs já indexadas.

Escapa caracteres XML (`& < > " '`) em todos os `loc`. Em caso de erro do Supabase, retorna ao menos as rotas estáticas (não quebra o XML).

### 2. Redirect de `/sitemap.xml`
Atualizar `public/_headers` adicionando:
```
/sitemap.xml
  X-Redirect-To: https://api.portalayurveda.com/functions/v1/sitemap
```
Observação: `X-Redirect-To` é apenas um header informativo — provedores como Cloudflare Pages/Netlify **não** convertem isso em redirect automaticamente. Para o `/sitemap.xml` realmente servir o conteúdo da Edge Function precisamos de uma das opções abaixo. Confirmar com você qual seguir:

- **(A) Cloudflare Pages `_redirects`** (recomendado se o site está no Cloudflare/Netlify):
  ```
  /sitemap.xml  https://api.portalayurveda.com/functions/v1/sitemap  200
  ```
  Status 200 = proxy transparente; o Google vê o XML na própria URL `portalayurveda.com/sitemap.xml`.
- **(B) Cloudflare Worker / Page Rule** apontando `portalayurveda.com/sitemap.xml` para a Edge Function.
- **(C) Manter `public/sitemap.xml` apenas como redirect 301** para `api.portalayurveda.com/functions/v1/sitemap` (pior para SEO).

### 3. Limpeza
- Remover o arquivo estático `public/sitemap.xml` (passa a ser servido pela function).
- Remover hooks `predev`/`prebuild` que rodam `scripts/generate-sitemap.ts` no `package.json` e apagar `scripts/generate-sitemap.ts` (não é mais necessário).
- Manter `robots.txt` apontando para `https://portalayurveda.com/sitemap.xml`.

### Detalhes técnicos
- A function lida com paginação implícita: Supabase retorna até 1000 linhas por consulta; usar `.limit(2000)` ou paginar caso `portal_conteudo` cresça além disso (hoje cabe).
- `aulas_ao_vivo.slug` é `NOT NULL` no schema — sem filtro necessário, mas filtrar `slug != ''` por segurança.
- Datas convertidas para ISO 8601 (`new Date(...).toISOString()`); registros sem data omitem `<lastmod>`.

### Perguntas para confirmar antes de implementar
1. Qual abordagem para o `/sitemap.xml` (A, B ou C acima)?
2. Devo incluir **todas** as aulas de `aulas_ao_vivo` ou só `is_active = true`?
3. Confirma remover o `scripts/generate-sitemap.ts` e o `public/sitemap.xml` estático?
