CREATE TABLE public.aulas_ao_vivo (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  titulo TEXT NOT NULL,
  youtube_url TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.aulas_ao_vivo ENABLE ROW LEVEL SECURITY;

-- Public can read active aulas
CREATE POLICY "Public can view active aulas"
ON public.aulas_ao_vivo
FOR SELECT
USING (is_active = true);

-- Admins (perfis.role = 'admin') can do everything
CREATE POLICY "Admins can view all aulas"
ON public.aulas_ao_vivo
FOR SELECT
TO authenticated
USING (EXISTS (SELECT 1 FROM public.perfis WHERE perfis.id = auth.uid() AND perfis.role = 'admin'));

CREATE POLICY "Admins can insert aulas"
ON public.aulas_ao_vivo
FOR INSERT
TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.perfis WHERE perfis.id = auth.uid() AND perfis.role = 'admin'));

CREATE POLICY "Admins can update aulas"
ON public.aulas_ao_vivo
FOR UPDATE
TO authenticated
USING (EXISTS (SELECT 1 FROM public.perfis WHERE perfis.id = auth.uid() AND perfis.role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM public.perfis WHERE perfis.id = auth.uid() AND perfis.role = 'admin'));

CREATE POLICY "Admins can delete aulas"
ON public.aulas_ao_vivo
FOR DELETE
TO authenticated
USING (EXISTS (SELECT 1 FROM public.perfis WHERE perfis.id = auth.uid() AND perfis.role = 'admin'));

CREATE TRIGGER update_aulas_ao_vivo_updated_at
BEFORE UPDATE ON public.aulas_ao_vivo
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();