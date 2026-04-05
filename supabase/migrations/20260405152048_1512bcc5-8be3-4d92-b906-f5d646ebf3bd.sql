-- Allow public read access to portal tables
CREATE POLICY "Allow public read access" ON public.portal_oficial FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow public read access" ON public.portal_receitas FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow public read access" ON public.portal_lives FOR SELECT TO anon, authenticated USING (true);