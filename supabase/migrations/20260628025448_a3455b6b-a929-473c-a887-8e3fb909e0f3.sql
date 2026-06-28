CREATE OR REPLACE FUNCTION public.rpg_admin_select(_table text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, rpg
AS $$
DECLARE
  result jsonb;
  allowed_tables text[] := ARRAY[
    'ability_templates',
    'action_log',
    'biomes',
    'campaigns',
    'cities',
    'class_templates',
    'devlog',
    'dungeons',
    'encounters',
    'establishments',
    'event_templates',
    'item_instances',
    'item_templates',
    'jobs',
    'monster_templates',
    'npcs',
    'player_state',
    'quests',
    'rooms',
    'shop_items'
  ];
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'forbidden: admin only';
  END IF;

  IF _table IS NULL OR NOT (_table = ANY (allowed_tables)) THEN
    RAISE EXCEPTION 'forbidden: invalid rpg table';
  END IF;

  EXECUTE format(
    'SELECT COALESCE(jsonb_agg(to_jsonb(t)), ''[]''::jsonb) FROM rpg.%I AS t',
    _table
  ) INTO result;

  RETURN COALESCE(result, '[]'::jsonb);
END;
$$;

REVOKE ALL ON FUNCTION public.rpg_admin_select(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.rpg_admin_select(text) FROM anon;
GRANT EXECUTE ON FUNCTION public.rpg_admin_select(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpg_admin_select(text) TO service_role;

NOTIFY pgrst, 'reload schema';