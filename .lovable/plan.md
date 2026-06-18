## Mudança

No card de gráfico em `/meu-dosha`, o botão "Revisão" ao lado de "Gráficos" hoje só desbloqueia quando passaram 30 dias desde o teste. Se o usuário já fez uma revisão antes desse prazo (por exemplo, fez no dia 30 e voltou no dia 32 para reler), ele cai no estado bloqueado e perde acesso à própria revisão.

A regra correta:

- **Desbloqueado** se: já existe uma revisão concluída (`hasRevisaoConcluida`) **OU** já se passaram 30 dias do teste.
- **Bloqueado** somente se: ainda não passaram 30 dias **E** não existe revisão concluída. Nesse caso, manter o tooltip "Sua revisão libera dia XX/YY".

## Arquivo a alterar

`src/pages/MeuDosha.tsx` (lógica no bloco de linhas ~856–895):

- Trocar a condição `if (disponivel)` por `if (disponivel || hasRevisaoConcluida)`.
- Dentro desse ramo, manter o comportamento atual: se `jaConcluiu` → "Ver revisão" navegando para `/revisao?ver=ultima` (sem animação de novo); se apenas `disponivel` sem revisão concluída → "Revisão" com badge "novo".
- O ramo bloqueado continua igual (com tooltip da data de liberação).

Nada mais muda — `/revisao` em si já permite acesso direto via URL; o bloqueio reclamado vinha apenas do botão no card.
