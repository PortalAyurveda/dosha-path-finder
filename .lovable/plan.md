Pelo que auditei, eu não criaria uma nova coluna genérica `ordem` agora: a tabela `portal_conteudo` já tem a coluna certa para isso, `destaque_ordem`, e a home já lê por ela.

Achados:
- `portal_conteudo.destaque_ordem` já existe.
- Os 9 artigos destacados estão com ordem preenchida, hoje em `0–8`.
- A home (`Conheça Ayurveda por aqui`) já ordena por `destaque_ordem`.
- Não encontrei artigos com tag contendo `especiaria`; então o problema parece ser a seção de destaques do index, não uma categoria/tag chamada “especiarias”.

Plano de correção:

1. Ajustar a ordem para ser humana no banco
   - Trocar a persistência de `0–8` para `1–9` em `destaque_ordem`.
   - Normalizar os registros atuais para `1, 2, 3...`, mantendo a ordem visual atual.

2. Reforçar o salvamento no admin
   - Manter apenas o botão “Salvar ordem” como ponto de gravação.
   - Ao salvar, gravar `destaque_ordem = posição visual` começando em 1.
   - Depois de salvar, recarregar do Supabase e comparar a ordem retornada com a ordem que foi enviada.
   - Só mostrar “Ordem salva” se a comparação bater.
   - Se não bater, mostrar erro claro em vez de sucesso falso.

3. Melhorar a tela para evitar ambiguidade
   - Mostrar a ordem real do banco como `1, 2, 3...` nos cards destacados.
   - Deixar claro quando há alterações não salvas.
   - Impedir múltiplos salvamentos simultâneos.

4. Se você realmente quiser ordenar uma categoria/tag específica como “especiarias”
   - Aí sim faz sentido criar outra coluna, mas eu não chamaria só `ordem`.
   - Eu sugeriria algo mais específico, como `blog_ordem` ou `categoria_ordem`, para não confundir com `destaque_ordem`.
   - Mas para a seção atual de destaques, `destaque_ordem` é a coluna correta.

Validação antes de eu te retornar:
- Consultar o Supabase e confirmar que os destacados estão com `destaque_ordem` sequencial começando em 1.
- Conferir que a query da home retorna na mesma ordem.
- Conferir no código que nenhum drag/drop salva sozinho.
- Conferir que o botão só dá sucesso após recarregar e validar a ordem salva.