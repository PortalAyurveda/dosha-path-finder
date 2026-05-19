CREATE OR REPLACE FUNCTION public.admin_set_portal_conteudo_destaques(_ids uuid[])
RETURNS TABLE(id uuid, destaque_ordem integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  item_id uuid;
  item_ordem integer := 0;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'forbidden: admin only';
  END IF;

  UPDATE public.portal_conteudo AS pc
    SET destaque_index = false, destaque_ordem = NULL
    WHERE pc.destaque_index = true
      AND (
        COALESCE(array_length(_ids, 1), 0) = 0
        OR NOT (pc.id = ANY(_ids))
      );

  FOREACH item_id IN ARRAY COALESCE(_ids, ARRAY[]::uuid[]) LOOP
    item_ordem := item_ordem + 1;

    UPDATE public.portal_conteudo AS pc
      SET destaque_index = true, destaque_ordem = item_ordem
      WHERE pc.id = item_id;
  END LOOP;

  RETURN QUERY
    SELECT pc.id, pc.destaque_ordem
    FROM public.portal_conteudo AS pc
    WHERE pc.destaque_index = true
    ORDER BY pc.destaque_ordem ASC NULLS LAST;
END;
$function$;

REVOKE ALL ON FUNCTION public.admin_set_portal_conteudo_destaques(uuid[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_set_portal_conteudo_destaques(uuid[]) TO authenticated;