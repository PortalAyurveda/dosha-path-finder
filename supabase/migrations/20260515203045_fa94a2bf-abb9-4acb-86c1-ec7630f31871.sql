DROP POLICY IF EXISTS "authenticated_ve_todos" ON public.assinaturas;

CREATE POLICY "admins_ve_todas_assinaturas"
ON public.assinaturas
FOR SELECT
TO authenticated
USING (public.is_admin());