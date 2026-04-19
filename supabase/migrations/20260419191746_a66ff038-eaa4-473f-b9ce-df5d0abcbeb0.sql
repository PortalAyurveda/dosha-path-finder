-- Expose 'loja' schema to PostgREST so the Supabase JS client can query it
-- via supabase.schema('loja').from(...)

-- Grant usage on the schema to API roles
GRANT USAGE ON SCHEMA loja TO anon, authenticated, service_role;

-- Grant SELECT on all existing tables (RLS still applies)
GRANT SELECT ON ALL TABLES IN SCHEMA loja TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA loja TO service_role;

-- Default privileges for any future tables in this schema
ALTER DEFAULT PRIVILEGES IN SCHEMA loja GRANT SELECT ON TABLES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA loja GRANT ALL ON TABLES TO service_role;

-- Tell PostgREST to expose the 'loja' schema (alongside 'public' and 'graphql_public')
-- This is the critical line — without it, .schema('loja') returns "schema not found"
ALTER ROLE authenticator SET pgrst.db_schemas = 'public,graphql_public,loja';

-- Reload PostgREST config so the change takes effect immediately
NOTIFY pgrst, 'reload config';
NOTIFY pgrst, 'reload schema';