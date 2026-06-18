DROP POLICY IF EXISTS "Admins can upload therapist photos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update therapist photos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete therapist photos" ON storage.objects;

CREATE POLICY "Authenticated can upload therapist photos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'terapeutas');

CREATE POLICY "Authenticated can update therapist photos"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'terapeutas') WITH CHECK (bucket_id = 'terapeutas');

CREATE POLICY "Admins can delete therapist photos"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'terapeutas' AND is_admin());