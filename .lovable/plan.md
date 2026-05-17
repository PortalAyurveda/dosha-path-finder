# Ajuste de Cache-Control do index.html

## Resposta curta
Sim, é possível — e o caminho é justamente o arquivo `public/_headers` que já existe no projeto. A hospedagem do Lovable respeita esse arquivo (mesmo formato do Netlify), então basta sobrescrever o header padrão `no-cache, must-revalidate, max-age=0` que o servidor está mandando hoje.

## Diagnóstico
- Hoje o `public/_headers` define para `/` e `/index.html`:
  ```
  Cache-Control: public, max-age=0, must-revalidate
  ```
  Isso instrui qualquer proxy (incluindo Cloudflare) a **não** cachear na borda → TTFB ~700ms toda visita.
- Os assets hasheados (`/assets/*`, `/fonts/*`, `*.woff2`) já estão com `max-age=31536000, immutable`, então não precisam mexer.
- O risco de cachear o `index.html` na borda é deploy: se a borda servir um HTML antigo, ele pode referenciar bundles JS que ainda existem (Vite usa hash, então arquivos antigos continuam válidos), mas o usuário só vê a versão nova quando o cache da borda expira.

## Mudança proposta
Em `public/_headers`, trocar as duas entradas de `/` e `/index.html` para:

```
/
  Cache-Control: public, max-age=60, s-maxage=3600, must-revalidate

/index.html
  Cache-Control: public, max-age=60, s-maxage=3600, must-revalidate
```

Significado:
- `max-age=60` → browser cacheia 1 minuto (revalida rápido após deploy).
- `s-maxage=3600` → Cloudflare/proxies cacheiam até 1 hora (TTFB cai drasticamente nas visitas repetidas via CDN).
- `must-revalidate` → quando expirar, força revalidação antes de servir.

## Observações
- O `site.webmanifest` fica como está (`max-age=300`).
- Após publicar, dá pra confirmar no DevTools → Network → `index.html` → response header `cache-control` e `cf-cache-status` (deve passar de `DYNAMIC`/`BYPASS` para `HIT` após a 2ª visita).
- Se em algum deploy você precisar invalidar a borda imediatamente, pode purgar pelo painel da Cloudflare (caso esteja usando uma zona própria) ou aguardar a 1h.
- Importante: o Lovable serve o app no domínio `*.lovable.app` por trás da infra deles; o `_headers` controla o que sai da origem. Se você está usando Cloudflare como proxy no seu domínio custom (`portalayurveda.com`), a regra `s-maxage` é exatamente o que a Cloudflare lê para decidir TTL da borda.

## O que NÃO muda
- Nenhum código JS/TS, componente, rota, lógica ou visual.
- Headers de `/assets/*`, `/fonts/*`, `*.woff2` permanecem iguais.
