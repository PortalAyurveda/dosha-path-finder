
CREATE TABLE loja.config_frete (
  id smallint PRIMARY KEY DEFAULT 1,
  frete_gratis_ativo boolean NOT NULL DEFAULT true,
  frete_gratis_minimo numeric(10,2) NOT NULL DEFAULT 350,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT config_frete_singleton CHECK (id = 1)
);

GRANT SELECT ON loja.config_frete TO anon, authenticated;
GRANT ALL ON loja.config_frete TO service_role;

ALTER TABLE loja.config_frete ENABLE ROW LEVEL SECURITY;

CREATE POLICY "config_frete leitura pública"
  ON loja.config_frete FOR SELECT
  USING (true);

CREATE POLICY "config_frete admin update"
  ON loja.config_frete FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

INSERT INTO loja.config_frete (id, frete_gratis_ativo, frete_gratis_minimo)
VALUES (1, true, 350)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE loja.produtos
  ADD COLUMN IF NOT EXISTS frete_gratis_sempre boolean NOT NULL DEFAULT false;
