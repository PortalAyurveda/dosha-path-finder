# Hero deslogado como banners editáveis no CMS

## Objetivo
Os 3 slots do hero deslogado já existem no front (`hero_mockup`, `hero_atualidades`, `hero_convite`) com fallback no código. Falta o HTML padrão **cadastrado na tabela `banners`**, para aparecer e ser editável em /admin/banners, dentro da seção "Home deslogada".

## O que fazer

1. **Converter os fallbacks para HTML estático** equivalente ao que o JSX renderiza hoje:
   - `hero_mockup`: card com gráfico borrado + cadeado + "Faça o teste para desbloquear seu mapa biológico".
   - `hero_atualidades`: bloco de números (aulas/artigos/receitas) + convite da Akasha.
   - `hero_convite`: **atenção** — o formulário (Nome/Idade/Nível + botão Começar) é interativo (navega para /teste-de-dosha). HTML puro não reproduz o formulário; a conversão cobre o visual/card e um `<a href="/teste-de-dosha">` como CTA. **Decisão necessária (abaixo).**

2. **Inserir os 3 banners no banco** (run_sql, idempotente com `on conflict`):
   - `slot` = hero_mockup / hero_atualidades / hero_convite
   - `tags` = `{sem_conta}` (só aparece para deslogado)
   - `ativo` = true, `ordem` = 0, `campanha` = "home-deslogada"
   - `titulo_admin` descritivo para cada um.

3. **Resultado**: /admin/banners passa a listar os 3 na seção "Home deslogada", editáveis; se alguém apagar/desativar, o fallback do código assume automaticamente.

## Decisão pendente: o formulário do teste
O `hero_convite` é um formulário funcional. Opções:
- **A) Banner com CTA simples** — HTML leva para /teste-de-dosha via link; o formulário original continua como fallback (recomendado, mais seguro).
- **B) Não cadastrar hero_convite** — manter o formulário só no código; cadastrar apenas mockup e atualidades.

## Fora de escopo
Nenhuma mudança visual, nenhum novo mecanismo além do BannerSlot/banners existente.
