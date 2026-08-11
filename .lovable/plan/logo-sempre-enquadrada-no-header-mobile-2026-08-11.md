# Logo sempre enquadrada no header mobile

Hoje, no celular, os botões da direita (carrinho + atalho de rotina + nome do usuário) crescem e empurram o símbolo do Portal para fora do centro. Quando o nome é grande, piora.

## O que muda

1. **Atalho de rotina (ícone de calendário) só no desktop.** No mobile ele sai do header — o link "Minha rotina" continua disponível no menu do usuário e no menu lateral. O carrinho permanece visível.
2. **Logo mandatória e centralizada.** A coluna central nunca encolhe nem é empurrada: o símbolo fica fixo no centro real do header em qualquer largura.
3. **Nome do usuário com reticências.** No mobile o nome fica limitado (~64px) e ganha `…` quando não couber, em vez de esticar o bloco da direita. No desktop segue como está.

## Detalhes técnicos

Arquivo: `src/components/Header.tsx`

- Grid do header: colunas laterais com `min-w-0` e `overflow-hidden`; coluna central com `shrink-0` e `justify-self-center`.
- Link de `/minha-rotina` (ícone `CalendarHeart`): adicionar `hidden lg:flex` mantendo a condição `temAcessoRotina`.
- Botão do usuário: `max-w-[64px] sm:max-w-[120px]` com `truncate` (já existe truncate; ajustar o limite mobile).

Sem mudanças de rota, lógica ou comportamento em desktop.
