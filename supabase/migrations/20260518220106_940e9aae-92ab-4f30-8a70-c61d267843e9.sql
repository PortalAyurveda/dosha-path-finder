CREATE OR REPLACE FUNCTION public.admin_set_portal_conteudo_destaques(_ids uuid[])
RETURNS TABLE(id uuid, destaque_ordem integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  i integer;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'forbidden: admin only';
  END IF;

  -- Limpa quem estava marcado e não está mais na lista
  UPDATE public.portal_conteudo
    SET destaque_index = false, destaque_ordem = NULL
    WHERE destaque_index = true
      AND (_ids IS NULL OR NOT (id = ANY(_ids)));

  -- Aplica a nova ordem 1..N
  IF _ids IS NOT NULL THEN
    FOR i IN 1 .. array_length(_ids, 1) LOOP
      UPDATE public.portal_conteudo
        SET destaque_index = true, destaque_ordem = i
        WHERE portal_conteudo.id = _ids[i];
    END LOOP;
  END IF;

  RETURN QUERY
    SELECT pc.id, pc.destaque_ordem
    FROM public.portal_conteudo pc
    WHERE pc.destaque_index = true
    ORDER BY pc.destaque_ordem ASC NULLS LAST;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_set_portal_conteudo_destaques(uuid[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_set_portal_conteudo_destaques(uuid[]) TO authenticated;