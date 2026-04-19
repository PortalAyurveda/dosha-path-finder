CREATE POLICY "Public read access to samkhya clinical content"
ON public.samkhya
FOR SELECT
TO anon, authenticated
USING (true);