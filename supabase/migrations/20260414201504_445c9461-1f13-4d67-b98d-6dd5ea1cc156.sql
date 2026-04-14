
-- Storage policies for portal_images bucket
-- Allow public read (bucket is already public, but policy needed)
CREATE POLICY "Public read portal_images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'portal_images');

-- Allow admin upload
CREATE POLICY "Admins can upload to portal_images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'portal_images'
  AND EXISTS (
    SELECT 1 FROM public.perfis
    WHERE perfis.id = auth.uid() AND perfis.role = 'admin'
  )
);

-- Allow admin update
CREATE POLICY "Admins can update portal_images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'portal_images'
  AND EXISTS (
    SELECT 1 FROM public.perfis
    WHERE perfis.id = auth.uid() AND perfis.role = 'admin'
  )
);

-- Allow admin delete
CREATE POLICY "Admins can delete from portal_images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'portal_images'
  AND EXISTS (
    SELECT 1 FROM public.perfis
    WHERE perfis.id = auth.uid() AND perfis.role = 'admin'
  )
);
