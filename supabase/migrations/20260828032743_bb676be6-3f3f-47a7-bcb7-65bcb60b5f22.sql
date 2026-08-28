ALTER TABLE public.cursos
  ADD COLUMN IF NOT EXISTS card_mostrar_titulo boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS card_mostrar_subtitulo boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS card_mostrar_logo boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS card_overlay_pos text NOT NULL DEFAULT 'bottom-left',
  ADD COLUMN IF NOT EXISTS card_logo_tamanho integer NOT NULL DEFAULT 100,
  ADD COLUMN IF NOT EXISTS card_texto_cor text NOT NULL DEFAULT '#FFFFFF';