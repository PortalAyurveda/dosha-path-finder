# Packs de atualização da home e navegação

## Implementação
- Ajustar o selo dinâmico e a hierarquia do título em “Hoje no portal”.
- Destacar Akasha nos menus desktop e mobile, ampliar o botão flutuante e direcionar a mentoria matriculada à Escola.
- Criar as seções Sommelier do Portal, Verso e Registros Akáshicos, e Guias dos Doshas com os dados, filtros, links e estilos solicitados.
- Inserir as novas seções e o banner na home, mantendo carregamento sob demanda.
- Simplificar “Conheça Ayurveda por aqui”, removendo apenas o invólucro do banner e preservando seu destaque editorial.

## Detalhes técnicos
- Reutilizar `searchAll`, React Query, Supabase e a formatação existente dos Registros Akáshicos.
- Mapear as categorias do Sommelier para os tipos já retornados pela busca global.
- Manter os componentes responsivos e acessíveis, usando os tokens visuais existentes quando disponíveis.
- Validar compilação e os principais layouts da home e navegação em desktop e mobile.
