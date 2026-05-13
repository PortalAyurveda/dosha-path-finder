CREATE POLICY "Admins can view pedidos"
  ON loja.pedidos FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can update pedidos"
  ON loja.pedidos FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());