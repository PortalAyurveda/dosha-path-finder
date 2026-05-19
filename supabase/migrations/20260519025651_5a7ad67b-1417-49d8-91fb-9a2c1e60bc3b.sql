DO $$
DECLARE
  _ids uuid[] := ARRAY[
    'e1ac7fe5-7d15-43c5-a707-104415b6733f',
    'd4f6e669-f95d-42a7-ab86-9ec060345719'
  ]::uuid[];
  item_id uuid;
  item_ordem integer := 0;
BEGIN
  UPDATE public.portal_conteudo AS pc
    SET destaque_index = pc.destaque_index, destaque_ordem = pc.destaque_ordem
    WHERE pc.destaque_index = true
      AND (
        COALESCE(array_length(_ids, 1), 0) = 0
        OR NOT (pc.id = ANY(_ids))
      );

  FOREACH item_id IN ARRAY COALESCE(_ids, ARRAY[]::uuid[]) LOOP
    item_ordem := item_ordem + 1;
    UPDATE public.portal_conteudo AS pc
      SET destaque_index = pc.destaque_index, destaque_ordem = pc.destaque_ordem
      WHERE pc.id = item_id;
  END LOOP;

  RAISE NOTICE 'OK - sem erro de ambiguidade';
END $$;