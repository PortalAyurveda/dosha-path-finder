CREATE OR REPLACE FUNCTION public.mockups_dados()
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'loja'
AS $function$
  SELECT CASE WHEN NOT public.is_admin() THEN NULL ELSE jsonb_build_object(
    'metricas', (SELECT to_jsonb(m) FROM (
       SELECT estacao, periodo_estacao, dosha_agravando, dosha_agravando_pct,
              dosha_aliviando, dosha_aliviando_pct, var_vata, var_pitta, var_kapha,
              testes_7d, terapeutas, frase_nugget,
              sintoma_vata, sintoma_pitta, sintoma_kapha,
              pct_vata_dom, pct_pitta_dom, pct_kapha_dom
       FROM public.metricas_index ORDER BY data_referencia DESC LIMIT 1) m),
    'testes_total', (SELECT count(*) FROM public.doshas_registros WHERE email LIKE '%@%'),
    'conversas', (SELECT coalesce(jsonb_agg(jsonb_build_object(
         'pergunta', left(c.pergunta_original, 220),
         'resposta', left(c.resposta_final, 380))), '[]'::jsonb)
       FROM (SELECT * FROM public.auditoria_rag
         WHERE email_aluno NOT ILIKE '%canario%' AND email_aluno NOT ILIKE '%portalayurveda@%'
           AND email_aluno NOT ILIKE '%teste%' AND email_aluno NOT ILIKE '%reteste.dev%'
           AND length(pergunta_original) BETWEEN 25 AND 220
           AND length(resposta_final) BETWEEN 120 AND 380
           AND resposta_final NOT ILIKE '%assin%' AND resposta_final NOT ILIKE '%médic%'
           AND resposta_final NOT ILIKE '%medic%' AND resposta_final NOT ILIKE '%nutricion%'
           AND pergunta_original NOT ILIKE '%erro%' AND pergunta_original NOT ILIKE '%não abre%'
           AND pergunta_original NOT ILIKE '%nao abre%' AND pergunta_original NOT ILIKE '%não consigo%'
         ORDER BY data_hora DESC LIMIT 6) c),
    'videos', (SELECT coalesce(jsonb_agg(jsonb_build_object(
         'titulo', coalesce(v.novo_titulo, v.titulo_original),
         'resumo', left(coalesce(v.mini_resumo,''), 160),
         'thumb', 'https://i.ytimg.com/vi/'||v.video_id||'/maxresdefault.jpg',
         'tags', coalesce(v.tags,''),
         'slug', v.slug)), '[]'::jsonb)
       FROM (SELECT * FROM public.videos_canonicos WHERE coalesce(novo_titulo,titulo_original) IS NOT NULL
             ORDER BY criado_em DESC NULLS LAST LIMIT 6) v),
    'artigos', (SELECT coalesce(jsonb_agg(jsonb_build_object(
         'titulo', a.title, 'resumo', left(coalesce(a.meta_description,''),180),
         'tags', coalesce(a.tags,''),
         'imagem', a.image_url, 'slug', a.link_do_artigo)), '[]'::jsonb)
       FROM (SELECT * FROM public.portal_conteudo WHERE status='published'
             ORDER BY created_at DESC LIMIT 6) a),
    'receitas', (SELECT coalesce(jsonb_agg(jsonb_build_object(
         'titulo', n.titulo, 'imagem', n.imagem_url,
         'resumo', left(n.nugget_json->>'resumo',160),
         'efeito', left(n.nugget_json->>'efeito_esperado',140),
         'tags', to_jsonb(coalesce(n.tags, ARRAY[]::text[])),
         'ingredientes', (SELECT string_agg(coalesce(i->>'qtd','')||' '||coalesce(i->>'item',''), ' · ')
            FROM jsonb_array_elements(
              CASE WHEN jsonb_typeof(n.nugget_json->'ingredientes') = 'array'
                   THEN n.nugget_json->'ingredientes' ELSE '[]'::jsonb END
            ) WITH ORDINALITY t(i, ord) WHERE ord <= 5))), '[]'::jsonb)
       FROM (SELECT * FROM public.rotina_nuggets WHERE imagem_url IS NOT NULL
             ORDER BY score DESC LIMIT 6) n),
    'cursos', (SELECT coalesce(jsonb_agg(jsonb_build_object(
         'titulo', c.titulo, 'capa', c.capa_url, 'slug', c.slug,
         'aulas', (SELECT count(*) FROM public.curso_aulas ca
                   JOIN public.curso_modulos cm ON ca.modulo_id=cm.id WHERE cm.curso_id=c.id))), '[]'::jsonb)
       FROM public.cursos c)
  ) END;
$function$;