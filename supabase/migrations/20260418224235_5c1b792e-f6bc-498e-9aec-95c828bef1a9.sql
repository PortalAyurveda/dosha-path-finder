
CREATE OR REPLACE FUNCTION public.akasha_evolucao_diaria()
RETURNS TABLE(dia date, msgs bigint, usuarios bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    (data_hora AT TIME ZONE 'America/Sao_Paulo')::date AS dia,
    COUNT(*) FILTER (WHERE message->>'type' = 'human')::bigint AS msgs,
    COUNT(DISTINCT session_id) FILTER (WHERE message->>'type' = 'human')::bigint AS usuarios
  FROM public.chat_histories
  WHERE data_hora IS NOT NULL
  GROUP BY 1
  ORDER BY 1 ASC;
$$;

CREATE OR REPLACE FUNCTION public.akasha_distribuicao_horas()
RETURNS TABLE(hora int, msgs bigint, percentual numeric)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH base AS (
    SELECT EXTRACT(HOUR FROM data_hora AT TIME ZONE 'America/Sao_Paulo')::int AS hora
    FROM public.chat_histories
    WHERE data_hora IS NOT NULL
      AND message->>'type' = 'human'
  ),
  por_hora AS (
    SELECT hora, COUNT(*)::bigint AS msgs FROM base GROUP BY hora
  ),
  total AS (SELECT SUM(msgs)::numeric AS t FROM por_hora)
  SELECT
    h.hora,
    COALESCE(p.msgs, 0)::bigint AS msgs,
    CASE WHEN (SELECT t FROM total) > 0
      THEN ROUND(COALESCE(p.msgs, 0) * 100.0 / (SELECT t FROM total), 2)
      ELSE 0
    END AS percentual
  FROM generate_series(0, 23) AS h(hora)
  LEFT JOIN por_hora p ON p.hora = h.hora
  ORDER BY h.hora;
$$;

GRANT EXECUTE ON FUNCTION public.akasha_evolucao_diaria() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.akasha_distribuicao_horas() TO anon, authenticated;
