ALTER TABLE public.bling_tokens ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.bling_tokens FROM anon, authenticated;