# Mockups de venda: Rotina e Portal Premium

Novo grupo **Ofertas** em `/admin/mockups`, com cards feitos para levar direto à área de venda (`/assinar`) em vez de artigo/vídeo. Mesmo sistema de temas, Safe Zone, formato Story/Feed e botões "Baixar PNG" / "Copiar link" já existentes.

## Os cards

Três cards novos, todos com link copiado apontando para `https://portalayurveda.com/assinar` (o card da Rotina com `?plano=rotina` para o admin saber a origem, se preferir posso deixar sem parâmetro).

**1. Minha Rotina — R$ 30/mês**

```text
SELO: Minha Rotina (verde)
Título: "Sua semana inteira, já montada."
Descrição: "Café, almoço, jantar, lanches e tônicos — montados
para o seu dosha, com o preparo e o porquê de cada item."
Preço em destaque: R$ 30 /mês · "menos de R$ 1 por dia"
Bullets (3): rotina dos 7 dias · feita para o seu dosha ·
revisão mensal do seu quadro
Foto: uma das receitas do Portal na base do card
```

**2. Portal Premium — R$ 79,90/mês**

```text
SELO: Portal Premium (coral)
Título: "O Ayurveda inteiro, moldado a você."
Descrição: "Sua rotina, a Akasha para conversar a qualquer hora
e 900+ aulas do professor Edson Osorio."
Preço em destaque: R$ 79,90 /mês · "ou R$ 49,75/mês no plano anual"
Bullets (4): rotina completa · Akasha ilimitada · acervo de 900+ aulas ·
cancele quando quiser
Foto/ilustração: imagem da Akasha
```

**3. Premium Anual — R$ 597/ano** (o "mais vantajoso")

```text
SELO: Premium Anual (dourado)
Título: "Um ano inteiro de Ayurveda."
Descrição: "R$ 79,90 riscado → R$ 49,75/mês. Cobrado uma vez,
R$ 597 no ano, com o curso Rotinas Diárias incluso (R$ 99)."
Bullets: tudo do Premium · curso Rotinas Diárias incluso ·
revisão mensal · 12 meses garantidos
Foto: capa do curso Rotinas Diárias
```

Todo o copy vem das páginas de venda atuais (`/assinar`: cards de plano, lista de benefícios, FAQ) — o preço de R$ 30/mês da Rotina segue o mesmo que está no ar hoje. Números ("2.700+ testes", "900+ aulas") são reaproveitados como prova social em uma linha discreta.

## Detalhes técnicos

- `src/pages/AdminMockups.tsx`:
  - Novo componente `CardOferta` (selo, título serif, descrição, bloco de preço com riscado opcional, lista curta de bullets com check, prova social, foto/imagem opcional na base), reutilizando `Card`, `SafeArea`, `Selo`, `truncar`, `tituloSize`, `limiteLinhas` e o contexto de tema (`acento`).
  - Três instâncias declaradas em um array constante `OFERTAS` no próprio arquivo (copy e preços fixos, sem consulta ao banco) — capa do curso e imagem da receita usam URLs já presentes em `Assinar.tsx`.
  - Novo grupo `"Ofertas"` no `useMemo` de `grupos`, posicionado logo após "Números do Portal", com `url` fixa para `/assinar` e `filename` `oferta-rotina-*.png`, `oferta-premium-*.png`, `oferta-anual-*.png`. Campo `texto` preenchido para funcionar na busca.
- Sem mudança de banco, de RPC ou de qualquer página pública.
