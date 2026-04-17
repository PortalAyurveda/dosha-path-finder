CREATE OR REPLACE FUNCTION public.receita_do_dia()
RETURNS SETOF public.portal_receitas
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM public.portal_receitas
  WHERE novo_titulo IS NOT NULL AND url IS NOT NULL
  ORDER BY md5(video_id || CURRENT_DATE::text)
  LIMIT 1;
END;
$$;

CREATE OR REPLACE FUNCTION public.artigo_do_dia()
RETURNS SETOF public.portal_conteudo
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM public.portal_conteudo
  WHERE link_do_artigo IS NOT NULL AND image_url IS NOT NULL
  ORDER BY md5(id::text || CURRENT_DATE::text)
  LIMIT 1;
END;
$$;

GRANT EXECUTE ON FUNCTION public.receita_do_dia() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.artigo_do_dia() TO anon, authenticated;