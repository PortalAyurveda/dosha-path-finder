ALTER TABLE public.aulas_ao_vivo
  ADD COLUMN IF NOT EXISTS starts_at timestamptz,
  ADD COLUMN IF NOT EXISTS descricao text,
  ADD COLUMN IF NOT EXISTS button_text text,
  ADD COLUMN IF NOT EXISTS button_url text,
  ADD COLUMN IF NOT EXISTS button_delay_seconds integer NOT NULL DEFAULT 0;