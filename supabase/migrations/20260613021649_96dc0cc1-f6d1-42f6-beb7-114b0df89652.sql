
ALTER TABLE public.reteste_sessao ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reteste_chat_history ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE ON public.reteste_sessao TO authenticated;
GRANT ALL ON public.reteste_sessao TO service_role;
GRANT SELECT, INSERT ON public.reteste_chat_history TO authenticated;
GRANT ALL ON public.reteste_chat_history TO service_role;

CREATE POLICY "user own reteste_sessao select" ON public.reteste_sessao
  FOR SELECT TO authenticated
  USING (user_email = (auth.jwt() ->> 'email'));

CREATE POLICY "user own reteste_sessao insert" ON public.reteste_sessao
  FOR INSERT TO authenticated
  WITH CHECK (user_email = (auth.jwt() ->> 'email'));

CREATE POLICY "user own reteste_sessao update" ON public.reteste_sessao
  FOR UPDATE TO authenticated
  USING (user_email = (auth.jwt() ->> 'email'))
  WITH CHECK (user_email = (auth.jwt() ->> 'email'));

CREATE POLICY "user own reteste_chat_history select" ON public.reteste_chat_history
  FOR SELECT TO authenticated
  USING (user_email = (auth.jwt() ->> 'email'));

CREATE POLICY "user own reteste_chat_history insert" ON public.reteste_chat_history
  FOR INSERT TO authenticated
  WITH CHECK (user_email = (auth.jwt() ->> 'email'));
