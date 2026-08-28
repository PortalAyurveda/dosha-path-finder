ALTER TABLE public.cursos
  ADD COLUMN IF NOT EXISTS card_estado text NOT NULL DEFAULT 'auto',
  ADD COLUMN IF NOT EXISTS card_lancamento_data date,
  ADD COLUMN IF NOT EXISTS card_estado_frase text,
  ADD COLUMN IF NOT EXISTS card_mostrar_cadeado boolean NOT NULL DEFAULT false;