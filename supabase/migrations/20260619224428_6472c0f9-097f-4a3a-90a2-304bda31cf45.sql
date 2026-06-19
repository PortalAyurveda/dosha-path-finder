CREATE OR REPLACE FUNCTION public.find_akasha_by_slug(_slug text)
RETURNS TABLE(id integer, titulo text, texto_inicio text, tags text, data_postagem timestamp without time zone)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT a.id, a.titulo, a.texto_inicio, a.tags, a.data_postagem
  FROM public.akasha_memory a
  WHERE a.titulo IS NOT NULL
    AND regexp_replace(
          trim(both '-' from
            regexp_replace(lower(public.unaccent(a.titulo)), '[^a-z0-9]+', '-', 'g')
          ),
          '-+', '-', 'g'
        ) = lower(_slug)
  ORDER BY a.data_postagem DESC NULLS LAST
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.find_akasha_by_slug(text) TO anon, authenticated, service_role;