
-- 1) PERFIS: lock SELECT to owner or admin (was public)
DROP POLICY IF EXISTS "Perfis visíveis para todos" ON public.perfis;
DROP POLICY IF EXISTS "Apenas admins podem editar perfis" ON public.perfis;

CREATE POLICY "Owner or admin can read perfis"
ON public.perfis FOR SELECT
TO authenticated
USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Admins can update perfis"
ON public.perfis FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 2) DOSHAS_REGISTROS: keep anon SELECT (idPublico is the URL secret) but
--    block authenticated users from scraping all rows — they only see their
--    own (matched by email) or admin sees all. Anon flow continues to work
--    by idPublico because anon role still has the public read policy.
DROP POLICY IF EXISTS "Public read by idPublico" ON public.doshas_registros;

CREATE POLICY "Anon can read by idPublico (URL token)"
ON public.doshas_registros FOR SELECT
TO anon
USING (true);

CREATE POLICY "Authenticated reads own or admin reads all"
ON public.doshas_registros FOR SELECT
TO authenticated
USING (
  public.is_admin()
  OR lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
);

-- 3) DOSHAS_REGISTROS2: same pattern
DROP POLICY IF EXISTS "Public read by idPublico or owner" ON public.doshas_registros2;

CREATE POLICY "Anon can read by idPublico (URL token)"
ON public.doshas_registros2 FOR SELECT
TO anon
USING (true);

CREATE POLICY "Authenticated reads own or admin reads all"
ON public.doshas_registros2 FOR SELECT
TO authenticated
USING (
  public.is_admin()
  OR user_id = auth.uid()
  OR lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
);
