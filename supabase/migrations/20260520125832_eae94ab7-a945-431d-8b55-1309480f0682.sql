-- Ensure browser API roles have the underlying privileges required by RLS policies
GRANT USAGE ON SCHEMA samkhya TO anon, authenticated;

GRANT SELECT ON ALL TABLES IN SCHEMA samkhya TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA samkhya TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA samkhya TO authenticated;

-- Keep future Samkhya tables/views usable by the admin area without repeating grants
ALTER DEFAULT PRIVILEGES IN SCHEMA samkhya GRANT SELECT ON TABLES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA samkhya GRANT INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA samkhya GRANT USAGE, SELECT ON SEQUENCES TO authenticated;

-- Make admin-only RLS explicit per operation on base tables
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['ingredientes', 'produtos', 'receitas', 'producoes', 'vendas'] LOOP
    EXECUTE format('DROP POLICY IF EXISTS admin_all ON samkhya.%I', t);
    EXECUTE format('DROP POLICY IF EXISTS admin_select ON samkhya.%I', t);
    EXECUTE format('DROP POLICY IF EXISTS admin_insert ON samkhya.%I', t);
    EXECUTE format('DROP POLICY IF EXISTS admin_update ON samkhya.%I', t);
    EXECUTE format('DROP POLICY IF EXISTS admin_delete ON samkhya.%I', t);

    EXECUTE format('CREATE POLICY admin_select ON samkhya.%I FOR SELECT TO authenticated USING (public.is_admin())', t);
    EXECUTE format('CREATE POLICY admin_insert ON samkhya.%I FOR INSERT TO authenticated WITH CHECK (public.is_admin())', t);
    EXECUTE format('CREATE POLICY admin_update ON samkhya.%I FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin())', t);
    EXECUTE format('CREATE POLICY admin_delete ON samkhya.%I FOR DELETE TO authenticated USING (public.is_admin())', t);
  END LOOP;
END $$;

ALTER VIEW samkhya.v_estoque_ingredientes SET (security_invoker = on);
ALTER VIEW samkhya.v_necessidade_ingredientes SET (security_invoker = on);
GRANT SELECT ON samkhya.v_estoque_ingredientes, samkhya.v_necessidade_ingredientes TO anon, authenticated;

NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';