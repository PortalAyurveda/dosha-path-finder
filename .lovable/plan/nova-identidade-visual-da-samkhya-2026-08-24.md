# Nova identidade visual da /samkhya

Troca completa da paleta e da tipografia da loja Samkhya. O portal (index.css, tailwind.config.ts, header, footer, doshas) continua exatamente como está.

## Paleta nova

| Uso | Cor |
|---|---|
| Barra do menu (nav de categorias) | `#581C50` (roxo profundo — primeira cor) |
| Títulos / logo | `#581C50` |
| Destaques, preços, botões primários | `#C75100` (laranja) |
| Fundo das páginas | `#E0DCAF` (creme da paleta) |
| Cards | branco sobre o creme, borda em creme escurecido |
| Ouro / selos, badge do carrinho, linha GOLD | `#D9933D` |
| Texto corpo | `#384026` (verde escuro) |
| Texto secundário | tom dessaturado do verde escuro |
| Rosa de apoio (tags, kits, avisos suaves) | `#B55474` |

Ajuste de acessibilidade: para texto pequeno sobre branco/creme, uso versões levemente escurecidas do laranja e do ouro (contraste AA), do mesmo jeito que hoje já existe o `ouroText`. Nada de cor clara sobre fundo claro.

## Tipografia

- **Acid Green** — títulos, logo "samkhya", nomes de produto, preços em destaque.
- **Brandon Grotesque** — corpo de texto, navegação, botões, rótulos.

Como os arquivos das fontes serão enviados por você, a estrutura entra pronta agora:
- `@font-face` para as duas famílias com `font-display: swap`, apontando para os arquivos hospedados como asset.
- Pilhas de fonte com reserva sensata (`Acid Green, Georgia, serif` e `Brandon Grotesque, "DM Sans", sans-serif`), então antes de os arquivos chegarem a loja segue legível e depois "acende" sozinha.
- Quando você me mandar os `.woff2`/`.otf`, eu subo e ligo — sem tocar em componente nenhum de novo.

## O que muda no código

Tudo passa pelo arquivo de tokens da loja, que é a fonte única:

- `src/components/samkhya/tokens.ts` — reescrito com a paleta nova mais duas chaves de fonte (`fonteTitulo`, `fonteCorpo`) e as cores de apoio (verde, rosa, texto).
- `src/components/samkhya/SamkhyaNavBar.tsx` — o `#73465F` cravado na barra vira o token novo `#581C50`.
- Substituição das pilhas `Georgia, 'Times New Roman', serif` e `Helvetica, ...` cravadas nos arquivos abaixo pelos tokens de fonte, para a troca futura ser num só lugar:
  - `SamkhyaLayout`, `SamkhyaLogo`, `SamkhyaNavBar`, `CarouselSection`, `AcordeoConteudo`, `MinimalProductCard`, `KitCard`, `ProdutoCard`, `PrecoDisplay`, `PrateleiraSamkhya`, `TabsConteudo`, `TagsPropriedades`, `BotaoWhatsApp`, `BotaoStripe`, `BotaoAdicionarCarrinho`, `pedido/PedidoCard`, `pedido/StatusTimeline`
  - páginas: `Samkhya`, `SamkhyaCategoria`, `SamkhyaTodos`, `SamkhyaKits`, `SamkhyaKit`, `SamkhyaProduto`, `SamkhyaPedido`, `SamkhyaCompras`, `SamkhyaObrigado`
- `src/data/landingPalettes.ts` — a entrada `samkhya-roxo-ouro` é atualizada para o roxo/laranja novos (mantendo a mesma `key`, para não quebrar quem já usa).
- `src/components/loja/CartDrawer.tsx` — usa tokens da loja; herda a paleta nova sem mudança de layout.

## Fora do escopo

- `src/index.css` e `tailwind.config.ts` (design do portal) — intocados.
- Header e Footer globais do portal — intocados.
- Nenhuma mudança de layout, de texto visível, de banco ou de lógica de checkout. Só cor e fonte.

## Memória

- Atualizo `.lovable/memory/features/samkhya-loja.md` com a paleta nova, a tipografia e o aviso de que o roxo/ouro antigo (`#7b4963` / `#C8922A`) foi aposentado.
- Atualizo a linha da Samkhya no índice da memória e em `landing-palettes.md`, deixando claro que o portal segue com `#352F54` / Roboto Serif / DM Sans.
