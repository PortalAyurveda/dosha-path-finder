
-- 1. doshas_registros: replace overly permissive ALL policy
DROP POLICY IF EXISTS "Acesso Total n8n" ON public.doshas_registros;

CREATE POLICY "Public read by idPublico"
  ON public.doshas_registros FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anon can insert test results"
  ON public.doshas_registros FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- 2. fotos_lingua: remove dangerous ALL policy, enable RLS stays
DROP POLICY IF EXISTS "Backend total access" ON public.fotos_lingua;

-- 3. doshas_registros2: enable RLS (policies already exist)
ALTER TABLE public.doshas_registros2 ENABLE ROW LEVEL SECURITY;

-- 4. Enable RLS on all public tables missing it
ALTER TABLE public.akasha_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.akasha_tags_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assistaliment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auditoria_rag ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_structure ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_histories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_histories_copy ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents_2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.glossario_doshas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.glossario_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jogo_campanha ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jogo_cenas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jogo_inventario ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jogo_monstros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jogo_personagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jornada_autodi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lista_email ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_conteudo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_dicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.samkhya ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testededosha ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos_seo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos_seo3 ENABLE ROW LEVEL SECURITY;

-- 5. Add public SELECT policies for tables the frontend needs
CREATE POLICY "Public read access"
  ON public.portal_conteudo FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public read access"
  ON public.portal_dicas FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public read access"
  ON public.testededosha FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public read access"
  ON public.glossario_doshas FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public read access"
  ON public.glossario_v2 FOR SELECT
  TO anon, authenticated
  USING (true);

-- 6. feed_resultados: drop overly permissive INSERT, keep SELECT
DROP POLICY IF EXISTS "Permitir inserção via n8n" ON public.feed_resultados;

-- 7. jornadaaliment: remove overly permissive anon ALL
DROP POLICY IF EXISTS "Anon Full Access" ON public.jornadaaliment;
