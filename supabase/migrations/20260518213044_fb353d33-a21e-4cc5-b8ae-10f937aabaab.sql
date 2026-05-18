WITH ranked AS (
  SELECT id, (ROW_NUMBER() OVER (ORDER BY created_at DESC) - 1)::int AS rn
  FROM public.portal_conteudo
  WHERE destaque_index = true AND destaque_ordem IS NULL
)
UPDATE public.portal_conteudo p
SET destaque_ordem = r.rn
FROM ranked r
WHERE p.id = r.id;