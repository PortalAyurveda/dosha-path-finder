CREATE POLICY "Allow public read access"
  ON public.videos_seo2
  FOR SELECT
  TO anon, authenticated
  USING (true);