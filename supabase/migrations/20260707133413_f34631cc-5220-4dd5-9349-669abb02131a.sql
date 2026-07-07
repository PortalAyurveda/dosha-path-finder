CREATE OR REPLACE FUNCTION public.admin_akasha_historico(p_email text)
RETURNS TABLE(
  msg_id bigint,
  tipo text,
  conteudo text,
  data_hora timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'somente admin';
  END IF;

  RETURN QUERY
  SELECT
    ch.id::bigint AS msg_id,
    ch.message->>'type' AS tipo,
    CASE
      WHEN ch.message->>'type' = 'human'
        AND ch.message->>'content' LIKE '%Pergunta: %'
      THEN split_part(ch.message->>'content', 'Pergunta: ', 2)
      ELSE ch.message->>'content'
    END AS conteudo,
    ch.data_hora
  FROM public.chat_histories ch
  WHERE lower(ch.session_id) = lower(p_email)
    AND ch.message->>'type' IN ('human', 'ai')
    AND ch.message->>'content' NOT LIKE 'Calling %'
    AND coalesce(ch.message->>'content', '') <> ''
  ORDER BY ch.id ASC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_akasha_historico(text) TO authenticated;