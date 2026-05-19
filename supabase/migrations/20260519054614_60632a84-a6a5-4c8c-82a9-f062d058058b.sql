CREATE POLICY "admins_read_auditoria_rag" ON public.auditoria_rag
FOR SELECT TO authenticated USING (is_admin());