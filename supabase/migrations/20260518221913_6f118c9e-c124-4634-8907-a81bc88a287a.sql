CREATE OR REPLACE FUNCTION public.admin_set_portal_conteudo_destaques(_ids uuid[])
RETURNS TABLE(id uuid, destaque_ordem integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  i integer;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'forbidden: admin only';
  END IF;

  UPDATE public.portal_conteudo AS pc
    SET destaque_index = false, destaque_ordem = NULL
    WHERE pc.destaque_index = true
      AND (_ids IS NULL OR NOT (pc.id = ANY(_ids)));

  IF _ids IS NOT NULL THEN
    FOR i IN 1 .. array_length(_ids, 1) LOOP
      UPDATE public.portal_conteudo AS pc
        SET destaque_index = true, destaque_ordem = i
        WHERE pc.id = _ids[i];
    END LOOP;
  END IF;

  RETURN QUERY
    SELECT pc.id, pc.destaque_ordem
    FROM public.portal_conteudo pc
    WHERE pc.destaque_index = true
    ORDER BY pc.destaque_ordem ASC NULLS LAST;
END;
$function$;