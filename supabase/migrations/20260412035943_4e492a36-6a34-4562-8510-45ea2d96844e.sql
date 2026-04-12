CREATE POLICY "Allow public read access"
ON public.portal_terapeutas
FOR SELECT
TO anon, authenticated
USING (true);