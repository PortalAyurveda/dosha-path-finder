
-- Expor schema rpg via PostgREST e habilitar leitura para admins
GRANT USAGE ON SCHEMA rpg TO authenticated, service_role;

-- Garantir RLS habilitado e policy de SELECT para admin em todas as tabelas do schema rpg
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT tablename FROM pg_tables WHERE schemaname = 'rpg'
  LOOP
    EXECUTE format('GRANT SELECT ON rpg.%I TO authenticated', r.tablename);
    EXECUTE format('GRANT ALL ON rpg.%I TO service_role', r.tablename);
    EXECUTE format('ALTER TABLE rpg.%I ENABLE ROW LEVEL SECURITY', r.tablename);
    EXECUTE format('DROP POLICY IF EXISTS "Admins can read %I" ON rpg.%I', r.tablename, r.tablename);
    EXECUTE format(
      'CREATE POLICY "Admins can read %I" ON rpg.%I FOR SELECT TO authenticated USING (public.has_role(auth.uid(), ''admin''::public.app_role))',
      r.tablename, r.tablename
    );
  END LOOP;
END $$;
