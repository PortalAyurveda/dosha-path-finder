CREATE OR REPLACE FUNCTION public.rpg_rpc(_fn text, _args jsonb DEFAULT '{}'::jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'rpg'
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_result jsonb;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated');
  END IF;

  CASE _fn
    WHEN 'meus_personagens' THEN
      IF COALESCE((_args->>'p_user_id')::uuid, v_uid) <> v_uid THEN
        RETURN jsonb_build_object('ok', false, 'error', 'forbidden');
      END IF;
      v_result := rpg.meus_personagens(v_uid);

    WHEN 'criar_party' THEN
      IF COALESCE((_args->>'p_host_user_id')::uuid, v_uid) <> v_uid THEN
        RETURN jsonb_build_object('ok', false, 'error', 'forbidden');
      END IF;
      v_result := rpg.criar_party(
        (_args->>'p_campaign_id')::uuid,
        v_uid,
        COALESCE((_args->>'p_max')::integer, 4)
      );

    WHEN 'entrar_party' THEN
      v_result := rpg.entrar_party(_args->>'p_join_code');

    WHEN 'estado_party' THEN
      v_result := rpg.estado_party((_args->>'p_party_id')::uuid);

    WHEN 'marcar_pronto' THEN
      v_result := rpg.marcar_pronto(
        (_args->>'p_player_id')::uuid,
        COALESCE((_args->>'p_ready')::boolean, false)
      );

    WHEN 'iniciar_jogo' THEN
      IF COALESCE((_args->>'p_host_user_id')::uuid, v_uid) <> v_uid THEN
        RETURN jsonb_build_object('ok', false, 'error', 'forbidden');
      END IF;
      v_result := rpg.iniciar_jogo(
        (_args->>'p_party_id')::uuid,
        v_uid
      );

    WHEN 'cena_atual' THEN
      v_result := rpg.cena_atual((_args->>'p_player_id')::uuid);

    WHEN 'classe_config' THEN
      v_result := rpg.classe_config(_args->>'p_classe');

    WHEN 'criar_personagem' THEN
      IF COALESCE((_args->>'p_user_id')::uuid, v_uid) <> v_uid THEN
        RETURN jsonb_build_object('ok', false, 'error', 'forbidden');
      END IF;
      v_result := rpg.criar_personagem(
        (_args->>'p_party_id')::uuid,
        v_uid,
        _args->>'p_nome',
        _args->>'p_classe',
        COALESCE(_args->'p_pontos', '{}'::jsonb)
      );

    WHEN 'inventario' THEN
      v_result := rpg.inventario((_args->>'p_player_id')::uuid);

    WHEN 'equipar' THEN
      v_result := rpg.equipar(
        (_args->>'p_player_id')::uuid,
        (_args->>'p_item_instance_id')::uuid
      );

    WHEN 'desequipar' THEN
      v_result := rpg.desequipar(
        (_args->>'p_player_id')::uuid,
        (_args->>'p_item_instance_id')::uuid
      );

    WHEN 'mapa' THEN
      v_result := rpg.mapa((_args->>'p_player_id')::uuid);

    WHEN 'chatlog' THEN
      v_result := rpg.chatlog(
        (_args->>'p_party_id')::uuid,
        COALESCE((_args->>'p_limit')::integer, 200)
      );

    WHEN 'evento_pendente' THEN
      v_result := rpg.evento_pendente((_args->>'p_player_id')::uuid);

    ELSE
      RETURN jsonb_build_object('ok', false, 'error', 'forbidden: invalid rpg rpc');
  END CASE;

  RETURN v_result;
EXCEPTION
  WHEN invalid_text_representation OR invalid_parameter_value THEN
    RETURN jsonb_build_object('ok', false, 'error', 'parametros_invalidos');
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpg_rpc(text, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpg_rpc(text, jsonb) TO service_role;

CREATE OR REPLACE FUNCTION public.rpg_admin_select(_table text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public', 'rpg'
AS $$
DECLARE
  result jsonb;
  clean_table text := regexp_replace(COALESCE(_table, ''), '^rpg\.', '');
  allowed_tables text[] := ARRAY[
    'ability_templates',
    'action_log',
    'biomes',
    'campaigns',
    'cities',
    'class_templates',
    'devlog',
    'dungeons',
    'effects',
    'encounters',
    'establishments',
    'event_templates',
    'item_instances',
    'item_templates',
    'jobs',
    'map_nodes',
    'monster_templates',
    'npcs',
    'parties',
    'player_state',
    'quests',
    'rooms',
    'shop_items'
  ];
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'forbidden: admin only';
  END IF;

  IF clean_table = '' OR NOT (clean_table = ANY (allowed_tables)) THEN
    RAISE EXCEPTION 'forbidden: invalid rpg table';
  END IF;

  EXECUTE format(
    'SELECT COALESCE(jsonb_agg(to_jsonb(t)), ''[]''::jsonb) FROM rpg.%I AS t',
    clean_table
  ) INTO result;

  RETURN COALESCE(result, '[]'::jsonb);
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpg_admin_select(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpg_admin_select(text) TO service_role;