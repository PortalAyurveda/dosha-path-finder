
-- Remover policies "test mode" do bucket terapeutas (anon write)
DROP POLICY IF EXISTS "Anyone can upload therapist photos (test mode)" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update therapist photos (test mode)" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete therapist photos (test mode)" ON storage.objects;

-- Substituir por policies restritas a admins
CREATE POLICY "Admins can upload therapist photos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'terapeutas' AND public.is_admin());

CREATE POLICY "Admins can update therapist photos"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'terapeutas' AND public.is_admin())
  WITH CHECK (bucket_id = 'terapeutas' AND public.is_admin());

CREATE POLICY "Admins can delete therapist photos"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'terapeutas' AND public.is_admin());

-- Remover policies abertas do bucket fotos-lingua (anon write/update)
DROP POLICY IF EXISTS "Upload Fotos Lingua" ON storage.objects;
DROP POLICY IF EXISTS "Atualizar Fotos Lingua" ON storage.objects;

-- Revogar EXECUTE público de função administrativa
REVOKE EXECUTE ON FUNCTION public.restore_dosha_test_version(integer) FROM anon;
