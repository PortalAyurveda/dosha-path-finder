

## Problema: RLS bloqueando leitura dos vídeos

A tabela `videos_seo2` tem Row Level Security (RLS) ativado, mas **nenhuma policy de SELECT** configurada. Por isso, todas as queries do frontend retornam `[]` (array vazio).

Os dados existem — confirmei 5+ vídeos com `video_id`, `novo_titulo`, `mini_resumo` e `tags` preenchidos.

## Solução

**Um único passo:** Criar uma RLS policy de SELECT público na tabela `videos_seo2`.

```sql
CREATE POLICY "Allow public read access"
  ON public.videos_seo2
  FOR SELECT
  TO anon, authenticated
  USING (true);
```

Esta tabela contém apenas dados públicos de SEO de vídeos do YouTube (títulos, descrições, tags) — não há dados sensíveis, então leitura pública é segura.

Nenhuma alteração de código é necessária. Após aplicar a migration, a Biblioteca vai funcionar imediatamente — busca, cards e player.

