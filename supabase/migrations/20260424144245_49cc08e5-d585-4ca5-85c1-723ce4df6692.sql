
-- portal_conteudo: liberar tudo
DROP POLICY IF EXISTS "Anyone can insert portal_conteudo" ON public.portal_conteudo;
DROP POLICY IF EXISTS "Anyone can update portal_conteudo" ON public.portal_conteudo;
DROP POLICY IF EXISTS "Anyone can delete portal_conteudo" ON public.portal_conteudo;
DROP POLICY IF EXISTS "Admins podem editar portal_conteudo" ON public.portal_conteudo;

CREATE POLICY "Anyone can insert portal_conteudo"
ON public.portal_conteudo FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update portal_conteudo"
ON public.portal_conteudo FOR UPDATE
USING (true) WITH CHECK (true);

CREATE POLICY "Anyone can delete portal_conteudo"
ON public.portal_conteudo FOR DELETE
USING (true);

-- Storage: liberar upload/update/delete nos buckets usados pela área admin
DROP POLICY IF EXISTS "Admin buckets public write" ON storage.objects;
DROP POLICY IF EXISTS "Admin buckets public update" ON storage.objects;
DROP POLICY IF EXISTS "Admin buckets public delete" ON storage.objects;
DROP POLICY IF EXISTS "Admin buckets public read" ON storage.objects;

CREATE POLICY "Admin buckets public read"
ON storage.objects FOR SELECT
USING (bucket_id IN ('portal_images','portal_capas','samkhya','fotos-lingua','terapeutas'));

CREATE POLICY "Admin buckets public write"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id IN ('portal_images','portal_capas','samkhya','fotos-lingua','terapeutas'));

CREATE POLICY "Admin buckets public update"
ON storage.objects FOR UPDATE
USING (bucket_id IN ('portal_images','portal_capas','samkhya','fotos-lingua','terapeutas'))
WITH CHECK (bucket_id IN ('portal_images','portal_capas','samkhya','fotos-lingua','terapeutas'));

CREATE POLICY "Admin buckets public delete"
ON storage.objects FOR DELETE
USING (bucket_id IN ('portal_images','portal_capas','samkhya','fotos-lingua','terapeutas'));
