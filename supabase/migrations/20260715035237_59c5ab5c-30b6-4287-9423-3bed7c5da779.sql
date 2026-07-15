CREATE OR REPLACE FUNCTION public.hoje_no_portal()
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  seed int := (extract(epoch FROM current_date)::bigint / 86400)::int;
  v_video jsonb; v_receita jsonb; v_rotina jsonb; n int;
BEGIN
  SELECT jsonb_build_object('titulo', titulo, 'rota', rota, 'imagem', imagem)
    INTO v_video
  FROM public.conteudo_tagged
  WHERE tipo IN ('video','receita_video')
  ORDER BY publicado_em DESC NULLS LAST LIMIT 1;

  SELECT count(*) INTO n FROM public.v_receitas;
  SELECT jsonb_build_object(
      'titulo', r.titulo,
      'rota', '/minha-rotina?item=' || r.id || CASE WHEN coalesce(r.slug,'') <> '' THEN '&r=' || r.slug ELSE '' END,
      'imagem', r.imagem_url,
      'icone', r.icone,
      'resumo', left(coalesce(r.resumo,''), 120),
      'ingredientes', (
        SELECT coalesce(jsonb_agg(x.v), '[]'::jsonb) FROM (
          SELECT jsonb_array_elements(
            CASE WHEN jsonb_typeof(r.ingredientes) = 'array' THEN r.ingredientes ELSE '[]'::jsonb END
          ) AS v LIMIT 3
        ) x
      ),
      'bom_para', (
        SELECT coalesce(jsonb_agg(d), '[]'::jsonb) FROM unnest(ARRAY[
          CASE WHEN r.vata = 1 THEN 'Vata' END,
          CASE WHEN r.pitta = 1 THEN 'Pitta' END,
          CASE WHEN r.kapha = 1 THEN 'Kapha' END
        ]) d WHERE d IS NOT NULL
      ))
    INTO v_receita
  FROM (
    SELECT * FROM public.v_receitas
    ORDER BY id LIMIT 1 OFFSET (seed % greatest(n, 1))
  ) r;

  SELECT count(*) INTO n FROM public.rotina_nuggets WHERE nugget_json IS NOT NULL;
  SELECT jsonb_build_object(
      'titulo', d.titulo,
      'rota', '/minha-rotina',
      'imagem', d.imagem_url,
      'periodo', initcap(coalesce(nullif(d.periodo,'qualquer'), 'a qualquer hora')),
      'icone_lucide', coalesce(d.icone_lucide, 'Sparkles'),
      'resumo', left(coalesce(d.nugget_json->>'resumo', d.nugget_json->>'dicas', ''), 120),
      'efeito', left(coalesce(d.nugget_json->>'efeito_esperado', ''), 100))
    INTO v_rotina
  FROM (
    SELECT titulo, periodo, icone_lucide, imagem_url, nugget_json FROM public.rotina_nuggets
    WHERE nugget_json IS NOT NULL
    ORDER BY id LIMIT 1 OFFSET (seed % greatest(n, 1))
  ) d;

  RETURN jsonb_build_object(
    'data', current_date,
    'video_novo', v_video,
    'receita_do_dia', v_receita,
    'rotina_do_dia', v_rotina,
    'dica_do_dia', v_rotina
  );
END $function$;