1. Memória e Estabilidade do Projeto
   Este arquivo é a fonte de verdade para design e navegação. É proibido o uso de TooltipProvider ou componentes que causem erro de useRef nulo.

2. Design System (Tailwind)
   Cores: primary (#352F54), secondary (#FF7676), accent (#FACC15), surface-sun (#FFF8EE).

Cores dos Doshas: vata (#6B8AFF), pitta (#FF7676), kapha (#4ADE80).

Tipografia: Roboto Serif (Títulos/Destaques) e DM Sans (Corpo).

Forma de Folha: Cantos opostos arredondados (rounded-tl-3xl rounded-br-3xl) em botões, cards e imagens.

3. Mapa Estruturado de Rotas (React Router v6)
   A navegação deve seguir rigorosamente estes caminhos para evitar erros 404:

A. Páginas de Acesso Rápido (Menu Superior)
/ — Home: Hub central de conversão.

/biblioteca — Acervo: Galeria dinâmica chaveada entre as tabelas portal_oficial, portal_receitas e portal_lives.

/horarios — Dinacharya: Página mestre de rotinas diárias com links para os horários específicos de cada Dosha.

B. Bioma dos Doshas (Páginas Principais)
/diagnostico/vata — Baseada no design patvata.htm.

/diagnostico/pitta — Baseada no design patpitta.htm.

/diagnostico/kapha — Baseada no design patkapha.htm.

C. Sub-rotas de Aprofundamento (Hierarquia Nível 2)
Cada dosha (:dosha) possui quatro sub-seções obrigatórias:

/diagnostico/:dosha/horarios — Rotina específica do dosha.

/diagnostico/:dosha/alimentacao — Guia de dietas e sabores.

/diagnostico/:dosha/remedios — Farmacologia ayurvédica básica.

/diagnostico/:dosha/avancado — Seção técnica consumindo as tabelas portal_vata, portal_pitta ou portal_kapha do Supabase.

4. Mapeamento de Dados (Supabase)
   O Lovable deve realizar as consultas (queries) nas tabelas corretas conforme a rota:

Biblioteca Geral: Alternar via UI entre portal_oficial, portal_receitas e portal_lives.

Páginas Avançadas: A rota /diagnostico/vata/avancado deve buscar obrigatoriamente da tabela portal_vata (e assim por diante).

Busca Semântica: Todas as buscas devem ser feitas na coluna texto_para_embedding com lógica de debounce.

5. Layout Shell (Consistência)
   Header: Deve conter links diretos para Vata, Pitta, Kapha, Horários e Biblioteca.

Transições: As mudanças entre sub-páginas de um dosha (ex: de Alimentação para Remédios) devem manter o Header do Dosha fixo no topo.
