
-- 1) Suporte a múltiplas imagens por produto
ALTER TABLE loja.produtos
  ADD COLUMN IF NOT EXISTS imagens text[] DEFAULT '{}'::text[];

-- Backfill: se já existe imagem_url e o array está vazio, copia para o array
UPDATE loja.produtos
SET imagens = ARRAY[imagem_url]
WHERE imagem_url IS NOT NULL
  AND imagem_url <> ''
  AND (imagens IS NULL OR array_length(imagens, 1) IS NULL);

-- 2) Política de UPDATE para admins em loja.produtos
DROP POLICY IF EXISTS "Admins podem editar produtos" ON loja.produtos;
CREATE POLICY "Admins podem editar produtos"
ON loja.produtos
FOR UPDATE
TO authenticated
USING (
  (SELECT role FROM public.perfis WHERE id = auth.uid()) = 'admin'
)
WITH CHECK (
  (SELECT role FROM public.perfis WHERE id = auth.uid()) = 'admin'
);

-- 3) Política de UPDATE para admins em loja.kits
DROP POLICY IF EXISTS "Admins podem editar kits" ON loja.kits;
CREATE POLICY "Admins podem editar kits"
ON loja.kits
FOR UPDATE
TO authenticated
USING (
  (SELECT role FROM public.perfis WHERE id = auth.uid()) = 'admin'
)
WITH CHECK (
  (SELECT role FROM public.perfis WHERE id = auth.uid()) = 'admin'
);
