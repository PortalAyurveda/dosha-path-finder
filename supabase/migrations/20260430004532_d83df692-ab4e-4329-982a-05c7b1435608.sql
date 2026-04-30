
-- Expose premium schema via PostgREST
ALTER ROLE authenticator SET pgrst.db_schemas = 'public, graphql_public, loja, premium';
NOTIFY pgrst, 'reload config';

-- Grants
GRANT USAGE ON SCHEMA premium TO anon, authenticated;
GRANT SELECT ON premium.objetivos_tratamento TO anon, authenticated;

-- RLS public read policy (data is keyed by user_email and accessed via /meu-dosha?id=...)
DROP POLICY IF EXISTS "Public read objetivos" ON premium.objetivos_tratamento;
CREATE POLICY "Public read objetivos" ON premium.objetivos_tratamento
  FOR SELECT TO anon, authenticated USING (true);
