# Assinante não deve cair no paywall de /minha-rotina

## O que está acontecendo

O gate de acesso da página lê o perfil do usuário (`is_premium`, `plano`, `subscription_status`) para decidir se libera a rotina. O problema é o momento em que ele decide.

No contexto de usuário, assim que o Supabase confirma a sessão inicial, o estado `loading` já vira `false` — mas a busca do perfil no banco ainda está em andamento (ela roda em segundo plano, de propósito, para não travar o login). Nesse intervalo o perfil está vazio.

Em `/minha-rotina`, o código atual trata "perfil vazio" como "não tem plano" e manda direto para `/assinar?...paywall_rotina`. Resultado:

- Digitar o endereço / dar F5: a página é o primeiro render depois da sessão, o perfil quase nunca chegou a tempo → paywall.
- Clicar pelo menu: o perfil normalmente já foi carregado antes → entra normal.
- "Às vezes não vai": é corrida mesmo — depende de rede, e o carregamento sob demanda (lazy) do pedaço da página muda o tempo, às vezes chegando antes do perfil.

Os dados no banco estão corretos: assinantes de rotina aparecem com `plano = rotina` e assinatura ativa, e os premium com `is_premium = true`. Ou seja, não é problema de cadastro nem de plano — é só o redirecionamento disparando cedo demais.

## Correção

1. No contexto de usuário (`src/contexts/UserContext.tsx`): expor um indicador de "perfil ainda carregando" (`profileLoading`), ligado quando existe usuário logado e a busca do perfil ainda não terminou, e desligado ao fim da busca (com sucesso ou erro) e quando não há sessão.

2. Em `src/pages/MinhaRotina.tsx`: enquanto houver usuário logado e o perfil ainda estiver carregando, mostrar o mesmo spinner de carregamento que já existe — nunca redirecionar. O redirecionamento para `/assinar` só acontece depois que o perfil chegou de fato e confirmou que não há plano válido (ou quando não há usuário nenhum).

3. Manter a regra de acesso como está hoje (premium, ou assinatura ativa nos planos `rotina` / `mensal` / `anual` dentro da validade). Nada muda visualmente para quem é assinante nem para quem é gratuito.

Nenhuma alteração de layout, textos ou nos cards de mockup da área.

## Detalhe técnico

- `fetchProfile` passa a marcar início/fim (inclusive em erro, para não travar a tela em spinner eterno). O `profileLoading` também é ligado quando `INITIAL_SESSION`/`SIGNED_IN` traz um usuário, evitando a janela em que `loading=false` e `profile=null`.
- Guarda em `MinhaRotina.tsx`: `if (loading || (user && profileLoading)) return <spinner/>` antes do bloco que calcula `temAcessoRotina` e emite `<Navigate to="/assinar" />`.
