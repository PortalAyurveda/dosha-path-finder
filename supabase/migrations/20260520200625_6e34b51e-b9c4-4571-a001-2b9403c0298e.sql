DROP POLICY IF EXISTS chat_aula_insert ON public.chat_aula;
CREATE POLICY chat_aula_insert ON public.chat_aula
FOR INSERT TO public
WITH CHECK ((mensagem <> '') AND (nome <> '') AND (length(mensagem) <= 500));