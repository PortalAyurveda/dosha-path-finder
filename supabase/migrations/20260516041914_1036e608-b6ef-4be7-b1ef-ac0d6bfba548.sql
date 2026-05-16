
CREATE POLICY "Admins inserem devlog"
ON public.devlog
FOR INSERT
TO authenticated
WITH CHECK (is_admin());

CREATE POLICY "Admins atualizam devlog"
ON public.devlog
FOR UPDATE
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Admins removem devlog"
ON public.devlog
FOR DELETE
TO authenticated
USING (is_admin());
