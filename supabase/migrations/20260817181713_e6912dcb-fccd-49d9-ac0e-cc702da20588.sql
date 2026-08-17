ALTER TABLE public.user_profiles ALTER COLUMN tokens_akasha SET DEFAULT 10;
UPDATE public.user_profiles SET tokens_akasha = 10 WHERE tokens_akasha > 10;