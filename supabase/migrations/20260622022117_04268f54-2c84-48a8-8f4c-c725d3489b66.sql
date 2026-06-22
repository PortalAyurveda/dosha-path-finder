DROP POLICY IF EXISTS "Authenticated can upload therapist photos" ON storage.objects;

CREATE POLICY "Anyone can upload therapist photos"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'terapeutas');