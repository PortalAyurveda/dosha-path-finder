CREATE POLICY "Admins manage all reteste_sessao" ON public.reteste_sessao
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admins manage all reteste_chat_history" ON public.reteste_chat_history
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());