CREATE OR REPLACE FUNCTION public.admin_akasha_conversas(p_busca text DEFAULT NULL, p_limit int DEFAULT 20, p_offset int DEFAULT 0)
RETURNS TABLE(email text, nome text, total_msgs bigint, ultima_pergunta text, ultima_resposta text, ultima_data timestamptz, total_geral bigint)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_admin() THEN RAISE EXCEPTION 'somente admin'; END IF;
  RETURN QUERY
  WITH conversas AS (
    SELECT ch.session_id,
      count(*) AS total_msgs,
      max(ch.data_hora) AS ultima_data,
      (SELECT c2.message->>'content' FROM chat_histories c2 WHERE c2.session_id = ch.session_id AND c2.message->>'type' = 'human' ORDER BY c2.id DESC LIMIT 1) AS ultima_pergunta,
      (SELECT c3.message->>'content' FROM chat_histories c3 WHERE c3.session_id = ch.session_id AND c3.message->>'type' = 'ai' AND c3.message->>'content' NOT LIKE 'Calling %' ORDER BY c3.id DESC LIMIT 1) AS ultima_resposta
    FROM chat_histories ch
    GROUP BY ch.session_id
  ), filtrado AS (
    SELECT * FROM conversas WHERE p_busca IS NULL OR session_id ILIKE '%' || p_busca || '%'
  )
  SELECT f.session_id, up.nome, f.total_msgs,
    CASE WHEN f.ultima_pergunta LIKE '%Pergunta: %' THEN split_part(f.ultima_pergunta, 'Pergunta: ', 2) ELSE f.ultima_pergunta END,
    f.ultima_resposta, f.ultima_data,
    (SELECT count(*) FROM filtrado)
  FROM filtrado f
  LEFT JOIN user_profiles up ON lower(up.email) = lower(f.session_id)
  ORDER BY f.ultima_data DESC
  LIMIT p_limit OFFSET p_offset;
END; $$;

CREATE OR REPLACE FUNCTION public.admin_akasha_historico(p_email text)
RETURNS TABLE(msg_id bigint, tipo text, conteudo text, data_hora timestamptz)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_admin() THEN RAISE EXCEPTION 'somente admin'; END IF;
  RETURN QUERY
  SELECT ch.id, ch.message->>'type',
    CASE WHEN ch.message->>'type' = 'human' AND ch.message->>'content' LIKE '%Pergunta: %'
         THEN split_part(ch.message->>'content', 'Pergunta: ', 2)
         ELSE ch.message->>'content' END,
    ch.data_hora
  FROM chat_histories ch
  WHERE lower(ch.session_id) = lower(p_email)
    AND ch.message->>'type' IN ('human','ai')
    AND ch.message->>'content' NOT LIKE 'Calling %'
    AND coalesce(ch.message->>'content','') <> ''
  ORDER BY ch.id ASC;
END; $$;

GRANT EXECUTE ON FUNCTION public.admin_akasha_conversas(text,int,int) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_akasha_historico(text) TO authenticated;