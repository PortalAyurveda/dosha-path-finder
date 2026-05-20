ALTER ROLE authenticator SET pgrst.db_schemas = 'public, graphql_public, loja, premium, samkhya';
NOTIFY pgrst, 'reload config';

ALTER TABLE samkhya.ingredientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE samkhya.producoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE samkhya.produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE samkhya.receitas ENABLE ROW LEVEL SECURITY;
ALTER TABLE samkhya.vendas ENABLE ROW LEVEL SECURITY;

GRANT USAGE ON SCHEMA samkhya TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA samkhya TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA samkhya TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA samkhya TO authenticated;

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['ingredientes','producoes','produtos','receitas','vendas']
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "admin_all" ON samkhya.%I', t);
    EXECUTE format('CREATE POLICY "admin_all" ON samkhya.%I FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin())', t);
  END LOOP;
END $$;