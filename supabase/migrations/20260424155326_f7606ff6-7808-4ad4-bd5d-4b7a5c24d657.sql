-- =========================================================
-- MODO TESTES: liberar INSERT/UPDATE/DELETE públicos
-- =========================================================

-- ---------- VIDEOS (public schema) ----------
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['portal_vata','portal_pitta','portal_kapha','portal_lives','portal_oficial','portal_receitas']
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Admins podem editar %I" ON public.%I', t, t);
    EXECUTE format('DROP POLICY IF EXISTS "Anyone can insert %I" ON public.%I', t, t);
    EXECUTE format('DROP POLICY IF EXISTS "Anyone can update %I" ON public.%I', t, t);
    EXECUTE format('DROP POLICY IF EXISTS "Anyone can delete %I" ON public.%I', t, t);

    EXECUTE format('CREATE POLICY "Anyone can insert %I" ON public.%I FOR INSERT TO anon, authenticated WITH CHECK (true)', t, t);
    EXECUTE format('CREATE POLICY "Anyone can update %I" ON public.%I FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true)', t, t);
    EXECUTE format('CREATE POLICY "Anyone can delete %I" ON public.%I FOR DELETE TO anon, authenticated USING (true)', t, t);
  END LOOP;
END $$;

-- ---------- SAMKHYA conteúdo clínico (public.samkhya) ----------
DROP POLICY IF EXISTS "Anyone can insert samkhya" ON public.samkhya;
DROP POLICY IF EXISTS "Anyone can update samkhya" ON public.samkhya;
DROP POLICY IF EXISTS "Anyone can delete samkhya" ON public.samkhya;

CREATE POLICY "Anyone can insert samkhya" ON public.samkhya FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can update samkhya" ON public.samkhya FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete samkhya" ON public.samkhya FOR DELETE TO anon, authenticated USING (true);

-- ---------- LOJA SCHEMA ----------
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['produtos','kits','kit_itens','categorias','produto_categorias']
  LOOP
    EXECUTE format('ALTER TABLE loja.%I ENABLE ROW LEVEL SECURITY', t);

    EXECUTE format('DROP POLICY IF EXISTS "Admins can update %I" ON loja.%I', t, t);
    EXECUTE format('DROP POLICY IF EXISTS "Admins can insert %I" ON loja.%I', t, t);
    EXECUTE format('DROP POLICY IF EXISTS "Admins can delete %I" ON loja.%I', t, t);
    EXECUTE format('DROP POLICY IF EXISTS "Anyone can read %I" ON loja.%I', t, t);
    EXECUTE format('DROP POLICY IF EXISTS "Anyone can insert %I" ON loja.%I', t, t);
    EXECUTE format('DROP POLICY IF EXISTS "Anyone can update %I" ON loja.%I', t, t);
    EXECUTE format('DROP POLICY IF EXISTS "Anyone can delete %I" ON loja.%I', t, t);

    EXECUTE format('CREATE POLICY "Anyone can read %I" ON loja.%I FOR SELECT TO anon, authenticated USING (true)', t, t);
    EXECUTE format('CREATE POLICY "Anyone can insert %I" ON loja.%I FOR INSERT TO anon, authenticated WITH CHECK (true)', t, t);
    EXECUTE format('CREATE POLICY "Anyone can update %I" ON loja.%I FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true)', t, t);
    EXECUTE format('CREATE POLICY "Anyone can delete %I" ON loja.%I FOR DELETE TO anon, authenticated USING (true)', t, t);
  END LOOP;
END $$;

-- ---------- STORAGE: garantir buckets abertos (idempotente) ----------
DROP POLICY IF EXISTS "Admin buckets public read" ON storage.objects;
DROP POLICY IF EXISTS "Admin buckets public write" ON storage.objects;
DROP POLICY IF EXISTS "Admin buckets public update" ON storage.objects;
DROP POLICY IF EXISTS "Admin buckets public delete" ON storage.objects;

CREATE POLICY "Admin buckets public read" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id IN ('portal_images','portal_capas','samkhya','fotos-lingua','terapeutas'));

CREATE POLICY "Admin buckets public write" ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id IN ('portal_images','portal_capas','samkhya','fotos-lingua','terapeutas'));

CREATE POLICY "Admin buckets public update" ON storage.objects
  FOR UPDATE TO anon, authenticated
  USING (bucket_id IN ('portal_images','portal_capas','samkhya','fotos-lingua','terapeutas'))
  WITH CHECK (bucket_id IN ('portal_images','portal_capas','samkhya','fotos-lingua','terapeutas'));

CREATE POLICY "Admin buckets public delete" ON storage.objects
  FOR DELETE TO anon, authenticated
  USING (bucket_id IN ('portal_images','portal_capas','samkhya','fotos-lingua','terapeutas'));