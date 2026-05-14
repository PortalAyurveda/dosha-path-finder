CREATE POLICY "Public read metricas_snapshot"
  ON public.metricas_snapshot FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public read portal_graficos"
  ON public.portal_graficos FOR SELECT
  TO anon, authenticated
  USING (true);