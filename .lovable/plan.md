## Plano

1. Ajustar a leitura do retorno da Edge Function `validar-cupom` no `CartDrawer` para aceitar os dois formatos possíveis:
   - `{ valido: true, cupom: { ... } }`
   - `{ valido: true, desconto_calculado: X, codigo: "BENHUR", ... }`

2. Normalizar o cupom válido em um objeto local completo antes de salvar em `cupomAplicado`, garantindo que `codigo`, `cupom_id`, `tipo_desconto`, `valor_desconto` e `desconto_calculado` sejam preenchidos mesmo quando vierem no topo do JSON.

3. Usar prioritariamente `cupomAplicado.desconto_calculado` para calcular/exibir o desconto verde, com fallback para recalcular percentual/fixo apenas se esse valor não vier.

4. Manter o frete intacto e recalcular o total como:
   `subtotal + frete - desconto`

5. Garantir que o payload enviado para `create-checkout` leve o mesmo cupom aplicado e o mesmo desconto mostrado na UI.