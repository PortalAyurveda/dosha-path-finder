
-- Create content_likes table for heart/like functionality
CREATE TABLE public.content_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_type text NOT NULL CHECK (content_type IN ('video', 'artigo')),
  content_id text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, content_type, content_id)
);

ALTER TABLE public.content_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own likes"
  ON public.content_likes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own likes"
  ON public.content_likes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own likes"
  ON public.content_likes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow public read for aggregate counts (engagement metrics)
CREATE POLICY "Anyone can count likes"
  ON public.content_likes FOR SELECT
  TO anon
  USING (true);
