ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_aula;
ALTER TABLE public.chat_aula REPLICA IDENTITY FULL;