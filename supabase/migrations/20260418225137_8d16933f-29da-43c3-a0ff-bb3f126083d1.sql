UPDATE public.portal_graficos
SET dados = '{"labels":[0,1,2,3,4,5,6],"datasets":[{"label":"Alimentos Vata","borderColor":"#8B5CF6","tension":0.4,"data":[1.1,12.6,25.3,30.0,18.4,9.5,3.2]},{"label":"Alimentos Pitta","borderColor":"#EF4444","tension":0.4,"data":[6.8,28.9,34.2,14.7,8.4,4.7,2.1]},{"label":"Alimentos Kapha","borderColor":"#10B981","tension":0.4,"data":[0.5,7.4,18.9,31.6,17.9,14.2,9.5]}]}'::jsonb,
    subtitulo = 'Distribuição do consumo por tipo de alimento em pessoas com Vata ≥ 50 pontos',
    atualizado_em = now()
WHERE grafico_id = 'vata_adoecido_alimentos';

UPDATE public.portal_graficos
SET dados = '{"labels":[0,1,2,3,4,5,6],"datasets":[{"label":"Alimentos Vata","borderColor":"#8B5CF6","tension":0.4,"data":[5.1,3.8,32.1,23.1,16.7,11.5,7.7]},{"label":"Alimentos Pitta","borderColor":"#EF4444","tension":0.4,"data":[6.4,20.5,24.4,19.2,14.1,11.5,3.8]},{"label":"Alimentos Kapha","borderColor":"#10B981","tension":0.4,"data":[0.0,3.8,11.5,21.8,20.5,26.9,15.4]}]}'::jsonb,
    subtitulo = 'Distribuição do consumo por tipo de alimento em pessoas com Pitta ≥ 50 pontos',
    atualizado_em = now()
WHERE grafico_id = 'pitta_adoecido_alimentos';

UPDATE public.portal_graficos
SET dados = '{"labels":[0,1,2,3,4,5,6],"datasets":[{"label":"Alimentos Vata","borderColor":"#8B5CF6","tension":0.4,"data":[5.0,12.5,35.0,25.0,7.5,7.5,7.5]},{"label":"Alimentos Pitta","borderColor":"#EF4444","tension":0.4,"data":[7.5,25.0,22.5,20.0,17.5,7.5,0.0]},{"label":"Alimentos Kapha","borderColor":"#10B981","tension":0.4,"data":[0.0,2.5,12.5,12.5,20.0,22.5,30.0]}]}'::jsonb,
    subtitulo = 'Distribuição do consumo por tipo de alimento em pessoas com Kapha ≥ 50 pontos',
    atualizado_em = now()
WHERE grafico_id = 'kapha_adoecido_alimentos';