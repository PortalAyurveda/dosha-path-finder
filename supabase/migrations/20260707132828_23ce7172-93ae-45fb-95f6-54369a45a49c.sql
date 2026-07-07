CREATE OR REPLACE FUNCTION public.admin_akasha_conversas(p_busca text DEFAULT NULL, p_limit int DEFAULT 20, p_offset int DEFAULT 0)
RETURNS TABLE(email text, nome text, total_msgs bigint, ultima_pergunta text, ultima_resposta text, ultima_data timestamptz, total_geral bigint)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_admin() THEN RAISE EXCEPTION 'somente admin'; END IF;
  RETURN QUERY
  WITH agg AS (
    SELECT session_id,
      count(*)::bigint AS total_msgs,
      max(data_hora) AS ultima_data
    FROM chat_histories
    GROUP BY session_id
  ),
  last_h AS (
    SELECT DISTINCT ON (session_id) session_id, message->>'content' AS conteudo
    FROM chat_histories
    WHERE message->>'type' = 'human'
    ORDER BY session_id, id DESC
  ),
  last_a AS (
    SELECT DISTINCT ON (session_id) session_id, message->>'content' AS conteudo
    FROM chat_histories
    WHERE message->>'type' = 'ai' AND message->>'content' NOT LIKE 'Calling %'
    ORDER BY session_id, id DESC
  ),
  filtrado AS (
    SELECT a.session_id, a.total_msgs, a.ultima_data, lh.conteudo AS pergunta, la.conteudo AS resposta
    FROM agg a
    LEFT JOIN last_h lh ON lh.session_id = a.session_id
    LEFT JOIN last_a la ON la.session_id = a.session_id
    WHERE p_busca IS NULL OR a.session_id ILIKE '%' || p_busca || '%'
  ),
  contagem AS (SELECT count(*)::bigint AS n FROM filtrado)
  SELECT f.session_id, up.nome, f.total_msgs,
    CASE WHEN f.pergunta LIKE '%Pergunta: %' THEN split_part(f.pergunta, 'Pergunta: ', 2) ELSE f.pergunta END,
    f.resposta, f.ultima_data,
    (SELECT n FROM contagem)
  FROM filtrado f
  LEFT JOIN user_profiles up ON lower(up.email) = lower(f.session_id)
  ORDER BY f.ultima_data DESC NULLS LAST
  LIMIT p_limit OFFSET p_offset;
END; $$;