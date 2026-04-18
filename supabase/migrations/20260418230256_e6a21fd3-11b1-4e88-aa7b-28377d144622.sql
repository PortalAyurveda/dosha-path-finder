UPDATE public.portal_graficos
SET dados = jsonb_build_object(
  'labels', jsonb_build_array('Pouco', 'Normal', 'Acúmulo', 'Adoecido', 'Fixado'),
  'datasets', jsonb_build_array(
    jsonb_build_object(
      'backgroundColor', 'rgba(139, 92, 246, 0.1)',
      'borderColor', '#8B5CF6',
      'data', jsonb_build_array(0.6, 2.7, 4.3, 8.1, 5.8),
      'label', 'Vata',
      'tension', 0.4
    ),
    jsonb_build_object(
      'backgroundColor', 'rgba(239, 68, 68, 0.1)',
      'borderColor', '#EF4444',
      'data', jsonb_build_array(1, 2.7, 4.1, 7, 5.4),
      'label', 'Pitta',
      'tension', 0.4
    ),
    jsonb_build_object(
      'backgroundColor', 'rgba(16, 185, 129, 0.1)',
      'borderColor', '#10B981',
      'data', jsonb_build_array(0.8, 2.4, 5.2, 9.5, 5.9),
      'label', 'Kapha',
      'tension', 0.4
    )
  ),
  'labels', jsonb_build_array('Pouco', 'Normal', 'Acúmulo', 'Adoecido', 'Fixado')
),
subtitulo = 'Quantos sintomas em média cada dosha acumula conforme avança nos níveis'
WHERE grafico_id = 'agravamentos_por_nivel';

UPDATE public.portal_graficos
SET dados = jsonb_build_object(
  'labels', jsonb_build_array('Pouco', 'Normal', 'Acúmulo', 'Adoecido', 'Fixado'),
  'datasets', jsonb_build_array(
    jsonb_build_object(
      'backgroundColor', 'rgba(139, 92, 246, 0.1)',
      'borderColor', '#8B5CF6',
      'data', jsonb_build_array(7.7, 17.6, 32, 10.9, 31.9),
      'label', 'Vata',
      'tension', 0.4
    ),
    jsonb_build_object(
      'backgroundColor', 'rgba(239, 68, 68, 0.1)',
      'borderColor', '#EF4444',
      'data', jsonb_build_array(13.5, 47.6, 25.5, 4.6, 8.8),
      'label', 'Pitta',
      'tension', 0.4
    ),
    jsonb_build_object(
      'backgroundColor', 'rgba(16, 185, 129, 0.1)',
      'borderColor', '#10B981',
      'data', jsonb_build_array(25.3, 57.3, 15.4, 0.6, 1.3),
      'label', 'Kapha',
      'tension', 0.4
    )
  )
)
WHERE grafico_id = 'distribuicao_niveis_dosha';