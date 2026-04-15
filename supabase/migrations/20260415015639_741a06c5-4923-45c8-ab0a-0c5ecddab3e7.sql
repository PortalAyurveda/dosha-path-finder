
CREATE TABLE public.user_content_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_type text NOT NULL CHECK (content_type IN ('video', 'artigo')),
  content_id text NOT NULL,
  viewed_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, content_type, content_id)
);

ALTER TABLE public.user_content_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own views"
  ON public.user_content_views FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own views"
  ON public.user_content_views FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
