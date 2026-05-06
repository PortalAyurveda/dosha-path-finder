-- Enable RLS on tables exposed via PostgREST without it
ALTER TABLE public.portal_graficos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plano_30_dias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metricas_snapshot ENABLE ROW LEVEL SECURITY;

-- Revoke public EXECUTE on internal SECURITY DEFINER functions
-- These are only used by triggers / auth hooks and should not be callable by clients.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.handle_new_document() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.gerar_embedding_testededosha() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.gerar_embedding_jornada() FROM anon, authenticated, public;