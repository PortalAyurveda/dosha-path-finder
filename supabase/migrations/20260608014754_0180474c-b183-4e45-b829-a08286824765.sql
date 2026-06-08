
-- Grants and RLS for loja.cupons and loja.cupom_usos
GRANT SELECT, INSERT, UPDATE, DELETE ON loja.cupons TO authenticated;
GRANT ALL ON loja.cupons TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON loja.cupom_usos TO authenticated;
GRANT ALL ON loja.cupom_usos TO service_role;

ALTER TABLE loja.cupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE loja.cupom_usos ENABLE ROW LEVEL SECURITY;

-- Admins can fully manage cupons
DROP POLICY IF EXISTS "admins manage cupons" ON loja.cupons;
CREATE POLICY "admins manage cupons" ON loja.cupons
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Admins can read cupom_usos (writes happen via service_role edge functions)
DROP POLICY IF EXISTS "admins read cupom_usos" ON loja.cupom_usos;
CREATE POLICY "admins read cupom_usos" ON loja.cupom_usos
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));
