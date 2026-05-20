CREATE EXTENSION IF NOT EXISTS unaccent;

CREATE OR REPLACE FUNCTION public.find_video_by_slug(_slug text)
RETURNS TABLE(
  video_id text,
  novo_titulo text,
  nova_descricao text,
  mini_resumo text,
  tags text,
  texto_para_embedding text,
  criado_em timestamptz
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  norm_slug text;
BEGIN
  norm_slug := lower(_slug);

  RETURN QUERY
  WITH all_videos AS (
    SELECT v.video_id, v.novo_titulo, v.nova_descricao, v.mini_resumo, v.tags, v.texto_para_embedding, v.criado_em FROM public.portal_oficial v
    UNION ALL
    SELECT v.video_id, v.novo_titulo, v.nova_descricao, v.mini_resumo, v.tags, v.texto_para_embedding, v.criado_em FROM public.portal_receitas v
    UNION ALL
    SELECT v.video_id, v.novo_titulo, v.nova_descricao, v.mini_resumo, v.tags, v.texto_para_embedding, v.criado_em FROM public.portal_lives v
    UNION ALL
    SELECT v.video_id, v.novo_titulo, v.nova_descricao, v.mini_resumo, v.tags, v.texto_para_embedding, v.criado_em FROM public.portal_vata v
    UNION ALL
    SELECT v.video_id, v.novo_titulo, v.nova_descricao, v.mini_resumo, v.tags, v.texto_para_embedding, v.criado_em FROM public.portal_pitta v
    UNION ALL
    SELECT v.video_id, v.novo_titulo, v.nova_descricao, v.mini_resumo, v.tags, v.texto_para_embedding, v.criado_em FROM public.portal_kapha v
  ),
  scored AS (
    SELECT
      a.*,
      regexp_replace(
        trim(both '-' from
          regexp_replace(
            lower(unaccent(
              CASE WHEN position(':' in a.novo_titulo) > 0
                THEN split_part(a.novo_titulo, ':', 1)
                ELSE array_to_string((string_to_array(a.novo_titulo, ' '))[1:5], ' ')
              END
            )),
            '[^a-z0-9]+', '-', 'g'
          )
        ),
        '-+', '-', 'g'
      ) AS computed_slug
    FROM all_videos a
    WHERE a.novo_titulo IS NOT NULL
  )
  SELECT s.video_id, s.novo_titulo, s.nova_descricao, s.mini_resumo, s.tags, s.texto_para_embedding, s.criado_em
  FROM scored s
  WHERE s.computed_slug = norm_slug
  ORDER BY s.criado_em DESC NULLS LAST
  LIMIT 1;
END;
$$;

GRANT EXECUTE ON FUNCTION public.find_video_by_slug(text) TO anon, authenticated;