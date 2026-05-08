
-- Helper: is_admin() (security definer evita recursão em policies)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.perfis WHERE id = auth.uid() AND role = 'admin'
  );
$$;

REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon;

-- ========== doshas_registros: remover DELETE anônimo ==========
DROP POLICY IF EXISTS "Anyone can delete dosha registros (admin)" ON public.doshas_registros;
CREATE POLICY "Admins can delete dosha registros"
  ON public.doshas_registros FOR DELETE TO authenticated
  USING (public.is_admin());

-- ========== portal_terapeutas: somente admin OU dono autenticado (por email) ==========
DROP POLICY IF EXISTS "Anyone can delete during tests" ON public.portal_terapeutas;
DROP POLICY IF EXISTS "Anyone can insert during tests" ON public.portal_terapeutas;
DROP POLICY IF EXISTS "Anyone can update during tests" ON public.portal_terapeutas;

CREATE POLICY "Admins manage terapeutas - delete"
  ON public.portal_terapeutas FOR DELETE TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins or owner can insert terapeuta"
  ON public.portal_terapeutas FOR INSERT TO authenticated
  WITH CHECK (
    public.is_admin()
    OR (auth.jwt() ->> 'email') IS NOT NULL
       AND lower(email) = lower(auth.jwt() ->> 'email')
  );

CREATE POLICY "Admins or owner can update terapeuta"
  ON public.portal_terapeutas FOR UPDATE TO authenticated
  USING (
    public.is_admin()
    OR (auth.jwt() ->> 'email') IS NOT NULL
       AND lower(email) = lower(auth.jwt() ->> 'email')
  )
  WITH CHECK (
    public.is_admin()
    OR (auth.jwt() ->> 'email') IS NOT NULL
       AND lower(email) = lower(auth.jwt() ->> 'email')
  );

-- ========== Conteúdo público: somente admin escreve ==========
-- samkhya
DROP POLICY IF EXISTS "Anyone can delete samkhya" ON public.samkhya;
DROP POLICY IF EXISTS "Anyone can insert samkhya" ON public.samkhya;
DROP POLICY IF EXISTS "Anyone can update samkhya" ON public.samkhya;
CREATE POLICY "Admins manage samkhya - insert" ON public.samkhya FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admins manage samkhya - update" ON public.samkhya FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins manage samkhya - delete" ON public.samkhya FOR DELETE TO authenticated USING (public.is_admin());

-- portal_conteudo
DROP POLICY IF EXISTS "Anyone can delete portal_conteudo" ON public.portal_conteudo;
DROP POLICY IF EXISTS "Anyone can insert portal_conteudo" ON public.portal_conteudo;
DROP POLICY IF EXISTS "Anyone can update portal_conteudo" ON public.portal_conteudo;
CREATE POLICY "Admins manage portal_conteudo - insert" ON public.portal_conteudo FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admins manage portal_conteudo - update" ON public.portal_conteudo FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins manage portal_conteudo - delete" ON public.portal_conteudo FOR DELETE TO authenticated USING (public.is_admin());

-- portal_oficial
DROP POLICY IF EXISTS "Anyone can delete portal_oficial" ON public.portal_oficial;
DROP POLICY IF EXISTS "Anyone can insert portal_oficial" ON public.portal_oficial;
DROP POLICY IF EXISTS "Anyone can update portal_oficial" ON public.portal_oficial;
CREATE POLICY "Admins manage portal_oficial - insert" ON public.portal_oficial FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admins manage portal_oficial - update" ON public.portal_oficial FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins manage portal_oficial - delete" ON public.portal_oficial FOR DELETE TO authenticated USING (public.is_admin());

-- portal_receitas
DROP POLICY IF EXISTS "Anyone can delete portal_receitas" ON public.portal_receitas;
DROP POLICY IF EXISTS "Anyone can insert portal_receitas" ON public.portal_receitas;
DROP POLICY IF EXISTS "Anyone can update portal_receitas" ON public.portal_receitas;
CREATE POLICY "Admins manage portal_receitas - insert" ON public.portal_receitas FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admins manage portal_receitas - update" ON public.portal_receitas FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins manage portal_receitas - delete" ON public.portal_receitas FOR DELETE TO authenticated USING (public.is_admin());

-- portal_lives
DROP POLICY IF EXISTS "Anyone can delete portal_lives" ON public.portal_lives;
DROP POLICY IF EXISTS "Anyone can insert portal_lives" ON public.portal_lives;
DROP POLICY IF EXISTS "Anyone can update portal_lives" ON public.portal_lives;
CREATE POLICY "Admins manage portal_lives - insert" ON public.portal_lives FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admins manage portal_lives - update" ON public.portal_lives FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins manage portal_lives - delete" ON public.portal_lives FOR DELETE TO authenticated USING (public.is_admin());

-- portal_vata
DROP POLICY IF EXISTS "Anyone can delete portal_vata" ON public.portal_vata;
DROP POLICY IF EXISTS "Anyone can insert portal_vata" ON public.portal_vata;
DROP POLICY IF EXISTS "Anyone can update portal_vata" ON public.portal_vata;
CREATE POLICY "Admins manage portal_vata - insert" ON public.portal_vata FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admins manage portal_vata - update" ON public.portal_vata FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins manage portal_vata - delete" ON public.portal_vata FOR DELETE TO authenticated USING (public.is_admin());

-- portal_pitta
DROP POLICY IF EXISTS "Anyone can delete portal_pitta" ON public.portal_pitta;
DROP POLICY IF EXISTS "Anyone can insert portal_pitta" ON public.portal_pitta;
DROP POLICY IF EXISTS "Anyone can update portal_pitta" ON public.portal_pitta;
CREATE POLICY "Admins manage portal_pitta - insert" ON public.portal_pitta FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admins manage portal_pitta - update" ON public.portal_pitta FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins manage portal_pitta - delete" ON public.portal_pitta FOR DELETE TO authenticated USING (public.is_admin());

-- portal_kapha
DROP POLICY IF EXISTS "Anyone can delete portal_kapha" ON public.portal_kapha;
DROP POLICY IF EXISTS "Anyone can insert portal_kapha" ON public.portal_kapha;
DROP POLICY IF EXISTS "Anyone can update portal_kapha" ON public.portal_kapha;
CREATE POLICY "Admins manage portal_kapha - insert" ON public.portal_kapha FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admins manage portal_kapha - update" ON public.portal_kapha FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admins manage portal_kapha - delete" ON public.portal_kapha FOR DELETE TO authenticated USING (public.is_admin());

-- ========== Storage: remover policies "public" que sobrepõem admin-only ==========
DROP POLICY IF EXISTS "Admin buckets public write" ON storage.objects;
DROP POLICY IF EXISTS "Admin buckets public update" ON storage.objects;
DROP POLICY IF EXISTS "Admin buckets public delete" ON storage.objects;
