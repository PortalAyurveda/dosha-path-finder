-- 1) Default UUID for id column (currently text, no default)
ALTER TABLE public.portal_terapeutas
  ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;

-- 2) Open RLS for tests (insert/update/delete) — leitura pública já existe
DROP POLICY IF EXISTS "Anyone can insert during tests" ON public.portal_terapeutas;
CREATE POLICY "Anyone can insert during tests"
  ON public.portal_terapeutas
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update during tests" ON public.portal_terapeutas;
CREATE POLICY "Anyone can update during tests"
  ON public.portal_terapeutas
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can delete during tests" ON public.portal_terapeutas;
CREATE POLICY "Anyone can delete during tests"
  ON public.portal_terapeutas
  FOR DELETE
  TO anon, authenticated
  USING (true);

-- 3) Storage bucket for therapist photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('terapeutas', 'terapeutas', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Public read for therapist photos
DROP POLICY IF EXISTS "Public read therapist photos" ON storage.objects;
CREATE POLICY "Public read therapist photos"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'terapeutas');

-- Open writes for tests (any user can upload/update/delete therapist photos)
DROP POLICY IF EXISTS "Anyone can upload therapist photos (test mode)" ON storage.objects;
CREATE POLICY "Anyone can upload therapist photos (test mode)"
  ON storage.objects
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'terapeutas');

DROP POLICY IF EXISTS "Anyone can update therapist photos (test mode)" ON storage.objects;
CREATE POLICY "Anyone can update therapist photos (test mode)"
  ON storage.objects
  FOR UPDATE
  TO anon, authenticated
  USING (bucket_id = 'terapeutas')
  WITH CHECK (bucket_id = 'terapeutas');

DROP POLICY IF EXISTS "Anyone can delete therapist photos (test mode)" ON storage.objects;
CREATE POLICY "Anyone can delete therapist photos (test mode)"
  ON storage.objects
  FOR DELETE
  TO anon, authenticated
  USING (bucket_id = 'terapeutas');