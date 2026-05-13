## Restauração do header (Menu / Perfil / Carrinho)

Encontrei a versão exata do `src/components/Header.tsx` anterior à remoção feita em 06/05 (commit `a4260a9`). Vou apenas restaurar o que foi retirado, sem mexer em cor, dimensão, fonte ou layout.

### O que será restaurado

1. **Canto esquerdo — botão "Menu" (Sheet/hamburger)**
   - Botão branco com ícone `Menu` + label "Menu"
   - `Sheet` lateral (`side="left"`) com `navLinks`: Portal, Loja Samkhya, Biblioteca, Artigos, Cursos, Terapeutas, Métricas
   - Botão "Sair" (`LogOut`) no final do menu quando o usuário está logado
   - Fundo do Sheet adapta para roxo Samkhya quando em `/samkhya/*` (mesma lógica original)

2. **Canto direito — Perfil / Entrar**
   - Se `doshaResult`: pílula branca com primeiro nome + mini gráfico de pizza (`HeaderDoshaPie`) linkando para `/meu-dosha?id=…`
   - Se apenas `user` logado (sem dosha): círculo branco com inicial linkando para `/meu-dosha`
   - Senão: botão "Entrar" com ícone `LogIn` linkando para `/entrar`

3. **Helpers internos restaurados**
   - Componente `HeaderDoshaPie` (SVG donut Vata/Pitta/Kapha)
   - Constante `PIE_COLORS`
   - Imports: `Menu, LogIn, LogOut, ShoppingBag, Home` do lucide; `Sheet*` do shadcn; `Button`

### O que será preservado (não tocado)

- `headerBg` / `bg-primary` / cor roxa Samkhya — sem alteração
- Centralização do logo via `grid-cols-[1fr_auto_1fr]` — mantida
- Imagens do logo (Samkhya / Portal desktop / símbolo mobile) — mantidas
- O link do logo central continua como está hoje:
  ```
  to={isSamkhya ? "/samkhya" : (pathname.startsWith("/aula") ? "/curso/alimentacao" : "/")}
  ```
  (não reverto isso para manter a regra atual — `/` continua apontando para `LaunchPage` enquanto você não trocar o index)

### Observação sobre carrinho

No header anterior **não havia ícone de carrinho** — o carrinho da loja Samkhya fica em `SamkhyaNavBar.tsx` (sub-barra roxa abaixo do header), e continua lá funcionando normalmente. Portanto não há "carrinho do header" para restaurar; se você quiser um ícone de carrinho global no header também (fora de `/samkhya`), me diga e eu adiciono — mas isso seria novo, não uma restauração.

### Arquivo afetado

- `src/components/Header.tsx` — substituído pelo conteúdo da versão pré-remoção, mantendo apenas a regra atual do link do logo central (item acima).

Nenhuma outra mudança em estilos, contextos, rotas ou componentes.