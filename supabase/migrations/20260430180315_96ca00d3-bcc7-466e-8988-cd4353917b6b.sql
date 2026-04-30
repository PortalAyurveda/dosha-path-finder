CREATE POLICY "Anyone can delete dosha registros (admin)"
ON public.doshas_registros
FOR DELETE
TO anon, authenticated
USING (true);