GRANT SELECT ON TABLE
  public.akasha_tags_inventory,
  public.portal_conteudo,
  public.videos_seo,
  public.videos_seo3,
  public.portal_vata,
  public.portal_pitta,
  public.portal_kapha,
  public.rotina_nuggets
TO authenticated;

DROP POLICY IF EXISTS "Admins can read akasha_tags_inventory for tags dashboard" ON public.akasha_tags_inventory;
CREATE POLICY "Admins can read akasha_tags_inventory for tags dashboard"
ON public.akasha_tags_inventory
FOR SELECT
TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can read videos_seo for tags dashboard" ON public.videos_seo;
CREATE POLICY "Admins can read videos_seo for tags dashboard"
ON public.videos_seo
FOR SELECT
TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can read videos_seo3 for tags dashboard" ON public.videos_seo3;
CREATE POLICY "Admins can read videos_seo3 for tags dashboard"
ON public.videos_seo3
FOR SELECT
TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can read portal_conteudo for tags dashboard" ON public.portal_conteudo;
CREATE POLICY "Admins can read portal_conteudo for tags dashboard"
ON public.portal_conteudo
FOR SELECT
TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can read portal_vata for tags dashboard" ON public.portal_vata;
CREATE POLICY "Admins can read portal_vata for tags dashboard"
ON public.portal_vata
FOR SELECT
TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can read portal_pitta for tags dashboard" ON public.portal_pitta;
CREATE POLICY "Admins can read portal_pitta for tags dashboard"
ON public.portal_pitta
FOR SELECT
TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can read portal_kapha for tags dashboard" ON public.portal_kapha;
CREATE POLICY "Admins can read portal_kapha for tags dashboard"
ON public.portal_kapha
FOR SELECT
TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can read rotina_nuggets for tags dashboard" ON public.rotina_nuggets;
CREATE POLICY "Admins can read rotina_nuggets for tags dashboard"
ON public.rotina_nuggets
FOR SELECT
TO authenticated
USING (public.is_admin());