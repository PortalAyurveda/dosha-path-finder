DROP POLICY IF EXISTS "Authenticated reads own or admin reads all" ON public.doshas_registros;

CREATE POLICY "Authenticated can read all dosha registros"
ON public.doshas_registros
FOR SELECT
TO authenticated
USING (true);