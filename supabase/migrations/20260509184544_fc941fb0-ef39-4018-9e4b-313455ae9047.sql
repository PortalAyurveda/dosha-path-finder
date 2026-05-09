-- Editable dosha test content + version history

CREATE TABLE IF NOT EXISTS public.dosha_test_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  part text NOT NULL,
  "group" text NULL,
  sort_order integer NOT NULL DEFAULT 0,
  text text NULL,
  options jsonb NOT NULL DEFAULT '[]'::jsonb,
  tag_label text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dosha_test_questions_part_order
  ON public.dosha_test_questions (part, "group", sort_order);

ALTER TABLE public.dosha_test_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read dosha_test_questions"
  ON public.dosha_test_questions FOR SELECT
  TO anon, authenticated USING (true);

CREATE POLICY "Admins insert dosha_test_questions"
  ON public.dosha_test_questions FOR INSERT
  TO authenticated WITH CHECK (is_admin());

CREATE POLICY "Admins update dosha_test_questions"
  ON public.dosha_test_questions FOR UPDATE
  TO authenticated USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Admins delete dosha_test_questions"
  ON public.dosha_test_questions FOR DELETE
  TO authenticated USING (is_admin());

CREATE TRIGGER trg_dosha_test_questions_updated_at
  BEFORE UPDATE ON public.dosha_test_questions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Version history table for rollback
CREATE TABLE IF NOT EXISTS public.dosha_test_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version_number serial UNIQUE,
  label text NULL,
  snapshot jsonb NOT NULL,
  created_by uuid NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.dosha_test_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read dosha_test_versions"
  ON public.dosha_test_versions FOR SELECT
  TO authenticated USING (is_admin());

CREATE POLICY "Admins insert dosha_test_versions"
  ON public.dosha_test_versions FOR INSERT
  TO authenticated WITH CHECK (is_admin());

-- Restore-from-version RPC: replaces all current rows with a snapshot
CREATE OR REPLACE FUNCTION public.restore_dosha_test_version(_version_number integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  snap jsonb;
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  SELECT snapshot INTO snap
    FROM public.dosha_test_versions
    WHERE version_number = _version_number;

  IF snap IS NULL THEN
    RAISE EXCEPTION 'version % not found', _version_number;
  END IF;

  DELETE FROM public.dosha_test_questions;

  INSERT INTO public.dosha_test_questions
    (id, part, "group", sort_order, text, options, tag_label, created_at, updated_at)
  SELECT
    COALESCE((row->>'id')::uuid, gen_random_uuid()),
    row->>'part',
    row->>'group',
    COALESCE((row->>'sort_order')::int, 0),
    row->>'text',
    COALESCE(row->'options', '[]'::jsonb),
    row->>'tag_label',
    COALESCE((row->>'created_at')::timestamptz, now()),
    now()
  FROM jsonb_array_elements(snap) AS row;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.restore_dosha_test_version(integer) FROM anon;
GRANT EXECUTE ON FUNCTION public.restore_dosha_test_version(integer) TO authenticated;