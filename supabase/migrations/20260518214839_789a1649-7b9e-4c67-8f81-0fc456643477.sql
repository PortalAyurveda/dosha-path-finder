WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY destaque_ordem ASC NULLS LAST, created_at DESC) AS rn
  FROM public.portal_conteudo
  WHERE destaque_index = true
)
UPDATE public.portal_conteudo p
SET destaque_ordem = r.rn
FROM ranked r
WHERE p.id = r.id;