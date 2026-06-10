
# Frete grátis na loja Samkhya

Avaliei o prompt: a lógica está coerente. Só faltam 2 ajustes na arquitetura para o "clicar e ativar" futuro funcionar sem refactor, e 1 ponto do prompt que precisa ser revisto (item 4 do checkout, abaixo).

## Revisão do prompt

| Item | Status | Observação |
|---|---|---|
| 1. Enviar `frete_gratis_cupom` no body | OK | Hoje nenhum cupom é desse tipo → enviar sempre `false` por enquanto. |
| 2. Resposta `{ opcoes, subtotal, tem_frete_gratis }` | OK | Tipo `FreteOpcao` ganha `frete_gratis?: boolean`. Parser atual (`data?.opcoes || data?.fretes || data`) continua compatível. |
| 3. Auto-seleção + banner verde | OK | Detectar pela opção com `id === 'gratis'` e/ou `frete_gratis: true`. |
| 4. Checkout `preco: 0` | **Atenção** | Precisa confirmar que `create-checkout` realmente não cria linha de frete quando `preco === 0` no Stripe. Hoje a função não está no repo (deploy externo). Antes de implementar, valido isso via logs / curl de teste; se quebrar, ajusto o payload aqui (ex.: omitir `frete` ou mandar flag explícita). |
| 5. Banner no CartDrawer com progresso | OK | "Faltam R$X" / "🎉 Frete grátis desbloqueado!" baseado no `subtotal` do `CartContext`, sem depender de chamada à edge. |

## Arquitetura pronta para o futuro (admin toggle)

Hoje o limiar R$350 está hardcoded dentro da edge function. Para que no futuro você possa **ativar frete grátis no site todo OU em um produto** sem mexer em código, crio agora a base de dados (migration pequena) — o admin UI fica para depois:

1. **`loja.config_frete`** (1 linha global, singleton):
   - `id` (smallint, default 1, PK)
   - `frete_gratis_ativo` (bool, default true)
   - `frete_gratis_minimo` (numeric, default 350)
   - `updated_at`
   - GRANT SELECT para `anon`, `authenticated`; ALL para `service_role`. RLS ON com policy de leitura pública e UPDATE só para admins.

2. **`loja.produtos.frete_gratis_sempre`** (bool, default false):
   - Quando true, o produto entra grátis independente do subtotal (carrinho inteiro vira frete grátis se contiver ao menos 1 desse tipo — regra do prompt: "ativar frete grátis pro site todo, ou pra um produto").

3. **Frontend usa o threshold do banco**, não hardcoded:
   - Hook `useFreteGratisConfig()` lê `loja.config_frete` uma vez e cacheia (TanStack Query, staleTime longo). Usado pelo banner de progresso no CartDrawer.
   - O *cálculo* real (qual opção mandar) continua na edge function — apenas precisa ser atualizada num próximo passo para ler `loja.config_frete` em vez do valor fixo. Não faço isso agora porque a função está fora do repo; deixo a tabela pronta para quando você for editá-la.

## Mudanças no frontend (CartDrawer.tsx)

### Tipos
```ts
type FreteOpcao = {
  id: string | number;
  nome: string;
  empresa?: string;
  preco: number;
  prazo_dias: number;
  frete_gratis?: boolean;
};
type CalcularFreteResp = {
  opcoes: FreteOpcao[];
  subtotal?: number;
  tem_frete_gratis?: boolean;
};
```

### Chamada
- Adicionar `frete_gratis_cupom: cupomAplicado?.tipo_desconto === 'frete_gratis'` no body (hoje resolve para `false`).
- Após receber `opcoes`, se existir item com `id === 'gratis'` (ou `frete_gratis: true`), `setFreteId(String(opcao.id))` selecionando-a por padrão (sobrescreve o `opcoes[0]` atual).

### Banner verde acima da lista de opções
- Exibido quando `tem_frete_gratis === true` OU existe opção com `frete_gratis`. Cor verde dos tokens samkhya.
- Texto: "🎉 Seu pedido tem frete grátis!"

### Banner de progresso (sempre visível no cart, antes do "Calcular frete")
- Lê `frete_gratis_minimo` via hook.
- `subtotal < min`: barra de progresso + "Faltam R$ X para ganhar frete grátis"
- `subtotal >= min`: "🎉 Frete grátis desbloqueado!" (verde)
- Não mostra nada se `frete_gratis_ativo === false`.

### Checkout
- Payload já trata `freteSelecionado.preco` corretamente — sem mudança.
- Antes de implementar a remoção da linha de frete no Stripe, **rodo um curl/log no create-checkout** para confirmar comportamento com `preco: 0`. Se necessário, ajusto o frontend para omitir o objeto `frete` quando grátis (decido com base no que a função faz hoje).

### Reset
- `useEffect` que reseta frete quando itens mudam continua válido.

## Passos de execução

1. Migration: criar `loja.config_frete` (com seed 1 linha) + coluna `loja.produtos.frete_gratis_sempre` + GRANTs + RLS.
2. Hook `useFreteGratisConfig` em `src/hooks/`.
3. Editar `src/components/loja/CartDrawer.tsx`: tipos, body do invoke, auto-seleção, banner de frete grátis na lista, banner de progresso no topo.
4. Testar fluxo: curl em `calcular-frete` com subtotal > 350 para confirmar formato da resposta; curl em `create-checkout` com `frete.preco: 0` para validar o item 4.
5. Não criar admin UI agora — fica documentado na memória do projeto.

## Fora deste plano (próximo passo separado)

- Atualizar a edge function `calcular-frete` para ler `loja.config_frete` em vez do R$350 fixo, e respeitar `produtos.frete_gratis_sempre`.
- Tela em `/admin/loja` com o toggle global + checkbox por produto.
- Cupom de tipo `frete_gratis` (novo `tipo_desconto` em `loja.cupons`).
