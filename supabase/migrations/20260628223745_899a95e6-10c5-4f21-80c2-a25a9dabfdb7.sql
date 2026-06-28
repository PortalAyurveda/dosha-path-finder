REVOKE EXECUTE ON FUNCTION public.rpg_rpc(text, jsonb) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.rpg_rpc(text, jsonb) FROM anon;
GRANT EXECUTE ON FUNCTION public.rpg_rpc(text, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpg_rpc(text, jsonb) TO service_role;

REVOKE EXECUTE ON FUNCTION public.rpg_admin_select(text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.rpg_admin_select(text) FROM anon;
GRANT EXECUTE ON FUNCTION public.rpg_admin_select(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpg_admin_select(text) TO service_role;