
-- Allow admins to read/update/insert any user_profile (for manual premium activation)
CREATE POLICY "Admins can read all user_profiles"
ON public.user_profiles FOR SELECT
TO authenticated
USING (is_admin());

CREATE POLICY "Admins can update all user_profiles"
ON public.user_profiles FOR UPDATE
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Admins can insert user_profiles"
ON public.user_profiles FOR INSERT
TO authenticated
WITH CHECK (is_admin());

-- Allow admins to insert into assinaturas (for manual activation rows)
CREATE POLICY "admins_insert_assinaturas"
ON public.assinaturas FOR INSERT
TO authenticated
WITH CHECK (is_admin());
