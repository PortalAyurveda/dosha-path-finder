-- Permitir que admins editem conteúdo das tabelas de vídeos e artigos
-- Helper: usa public.perfis para checar role

-- portal_oficial
ALTER TABLE public.portal_oficial ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins podem editar portal_oficial" ON public.portal_oficial;
CREATE POLICY "Admins podem editar portal_oficial" ON public.portal_oficial
  FOR UPDATE TO authenticated
  USING ((SELECT role FROM public.perfis WHERE id = auth.uid()) = 'admin')
  WITH CHECK ((SELECT role FROM public.perfis WHERE id = auth.uid()) = 'admin');

-- portal_kapha
DROP POLICY IF EXISTS "Admins podem editar portal_kapha" ON public.portal_kapha;
CREATE POLICY "Admins podem editar portal_kapha" ON public.portal_kapha
  FOR UPDATE TO authenticated
  USING ((SELECT role FROM public.perfis WHERE id = auth.uid()) = 'admin')
  WITH CHECK ((SELECT role FROM public.perfis WHERE id = auth.uid()) = 'admin');

-- portal_pitta
DROP POLICY IF EXISTS "Admins podem editar portal_pitta" ON public.portal_pitta;
CREATE POLICY "Admins podem editar portal_pitta" ON public.portal_pitta
  FOR UPDATE TO authenticated
  USING ((SELECT role FROM public.perfis WHERE id = auth.uid()) = 'admin')
  WITH CHECK ((SELECT role FROM public.perfis WHERE id = auth.uid()) = 'admin');

-- portal_vata
DROP POLICY IF EXISTS "Admins podem editar portal_vata" ON public.portal_vata;
CREATE POLICY "Admins podem editar portal_vata" ON public.portal_vata
  FOR UPDATE TO authenticated
  USING ((SELECT role FROM public.perfis WHERE id = auth.uid()) = 'admin')
  WITH CHECK ((SELECT role FROM public.perfis WHERE id = auth.uid()) = 'admin');

-- portal_lives
DROP POLICY IF EXISTS "Admins podem editar portal_lives" ON public.portal_lives;
CREATE POLICY "Admins podem editar portal_lives" ON public.portal_lives
  FOR UPDATE TO authenticated
  USING ((SELECT role FROM public.perfis WHERE id = auth.uid()) = 'admin')
  WITH CHECK ((SELECT role FROM public.perfis WHERE id = auth.uid()) = 'admin');

-- portal_receitas
DROP POLICY IF EXISTS "Admins podem editar portal_receitas" ON public.portal_receitas;
CREATE POLICY "Admins podem editar portal_receitas" ON public.portal_receitas
  FOR UPDATE TO authenticated
  USING ((SELECT role FROM public.perfis WHERE id = auth.uid()) = 'admin')
  WITH CHECK ((SELECT role FROM public.perfis WHERE id = auth.uid()) = 'admin');

-- portal_conteudo (artigos)
DROP POLICY IF EXISTS "Admins podem editar portal_conteudo" ON public.portal_conteudo;
CREATE POLICY "Admins podem editar portal_conteudo" ON public.portal_conteudo
  FOR UPDATE TO authenticated
  USING ((SELECT role FROM public.perfis WHERE id = auth.uid()) = 'admin')
  WITH CHECK ((SELECT role FROM public.perfis WHERE id = auth.uid()) = 'admin');
