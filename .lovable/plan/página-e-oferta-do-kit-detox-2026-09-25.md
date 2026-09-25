# Página e oferta do Kit Detox

## O que será feito
- Criar `/detox/kit` sem menu nem rodapé, mantendo a identidade visual quente do Detox.
- Carregar os dados reais do kit, preencher dados conhecidos da pessoa e validar todos os campos do envio antes do pagamento.
- Integrar a busca automática de endereço por CEP e o checkout de cartão/Pix já existente.
- Criar o cartão reutilizável `OfertaKit` e exibi-lo após uma compra aprovada e no topo da área do curso Detox.
- Adaptar a loja Samkhya para kits com checkout próprio e frete sempre grátis, sem alterar o comportamento dos demais kits.

## Comportamento da compra
- A primeira tela reúne comprador e endereço, com mensagens específicas em cada campo inválido.
- A segunda tela confirma endereço, frete e valores antes de abrir o Mercado Pago.
- Pagamento recusado mostra o aviso solicitado; compra já paga abre o pedido existente.
- Valores monetários são calculados a partir dos dados devolvidos pelo banco e formatados em reais.

## Detalhes técnicos
- Novos arquivos escritos com `createElement`, sem JSX.
- A página consulta `kit_detalhe`, lê `user_profiles` somente para usuários identificados e chama `comprar-kit` com o corpo especificado.
- A rota será carregada sob demanda e adicionada à lista de páginas sem moldura.
- A validação incluirá formato de email, quantidades mínimas de dígitos e os verificadores oficiais do CPF.

## Verificação
- Conferir tipos e o estado do build.
- Testar no navegador os dois passos, validações, preenchimento por CEP, versão móvel e desktop.
- Conferir publicamente a oferta na confirmação; a inserção autenticada no curso será validada por código porque este projeto não permite sessão administrativa no ambiente de teste.
