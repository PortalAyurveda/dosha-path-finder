ALTER TABLE public.portal_terapeutas
  ADD COLUMN IF NOT EXISTS pais text,
  ADD COLUMN IF NOT EXISTS website text;