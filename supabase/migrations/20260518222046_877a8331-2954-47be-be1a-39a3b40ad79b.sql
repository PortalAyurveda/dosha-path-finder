DO $$
DECLARE
  r record;
  cnt int := 0;
BEGIN
  -- Bypass is_admin by temporarily redefining: instead, just call UPDATE logic directly to validate no ambiguity
  UPDATE public.portal_conteudo AS pc
    SET destaque_index = pc.destaque_index, destaque_ordem = pc.destaque_ordem
    WHERE pc.destaque_index = true
      AND NOT (pc.id = ANY(ARRAY['e1ac7fe5-7d15-43c5-a707-104415b6733f']::uuid[]));
  GET DIAGNOSTICS cnt = ROW_COUNT;
  RAISE NOTICE 'update ok, rows touched=%', cnt;
END $$;