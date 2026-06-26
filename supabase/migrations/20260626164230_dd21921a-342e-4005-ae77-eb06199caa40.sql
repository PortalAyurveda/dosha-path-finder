GRANT INSERT ON public.escola_alunos TO anon, authenticated;
GRANT SELECT, UPDATE ON public.escola_alunos TO authenticated;
GRANT ALL ON public.escola_alunos TO service_role;