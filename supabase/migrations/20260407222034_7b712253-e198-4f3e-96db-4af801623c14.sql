ALTER TABLE public.portal_vata ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_pitta ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_kapha ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access" ON public.portal_vata;
CREATE POLICY "Allow public read access"
ON public.portal_vata
FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Allow public read access" ON public.portal_pitta;
CREATE POLICY "Allow public read access"
ON public.portal_pitta
FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Allow public read access" ON public.portal_kapha;
CREATE POLICY "Allow public read access"
ON public.portal_kapha
FOR SELECT
TO anon, authenticated
USING (true);