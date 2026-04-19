// Dedicated Supabase client for the Samkhya Loja (schema "loja").
// The main client (./client) is locked to the "public" schema via TypeScript types,
// so we use a separate untyped client to query loja.* tables.
//
// Usage:
//   import { lojaSupabase } from "@/integrations/supabase/loja-client";
//   const { data } = await lojaSupabase.from("produtos").select("*");
//
// The schema "loja" must be exposed via `pgrst.db_schemas` (handled in migration).

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

export const lojaSupabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  db: { schema: "loja" as never },
  auth: {
    persistSession: false, // auth handled by main client
    autoRefreshToken: false,
  },
});

// ---------- Types (manually maintained — schema is small and stable) ----------

export interface LojaCategoria {
  id: number;
  slug: string;
  nome: string;
  descricao: string | null;
  ordem: number | null;
  icone_emoji: string | null;
}

export interface LojaProduto {
  id: number;
  samkhya_id: number | null;
  slug: string;
  nome_display: string;
  preco_normal: number;
  preco_pix: number;
  stripe_price_id: string | null;
  imagem_url: string | null;
  ativo: boolean;
  destaque: boolean;
  ordem_exibicao: number | null;
  created_at: string | null;
}

export interface LojaProdutoComCategorias extends LojaProduto {
  produto_categorias: Array<{
    categorias: { slug: string; nome: string } | null;
  }>;
}

export interface LojaKit {
  id: number;
  slug: string;
  nome: string;
  descricao_curta: string | null;
  preco_normal: number;
  preco_pix: number;
  stripe_price_id: string | null;
  imagem_url: string | null;
  tipo_kit: string | null;
  ativo: boolean;
  ordem_exibicao: number | null;
  created_at: string | null;
}

export interface LojaKitItem {
  id: number;
  kit_id: number;
  produto_id: number | null;
  quantidade: number;
  nota: string | null;
  produtos: {
    nome_display: string;
    slug: string;
    imagem_url: string | null;
  } | null;
}

export interface LojaKitComItens extends LojaKit {
  kit_itens: LojaKitItem[];
}

// Clinical content lives in public.samkhya — joined via produto.samkhya_id
export interface SamkhyaClinico {
  "O que é": string | null;
  "Indicações": string | null;
  "Posologia": string | null;
  "Efeitos esperados": string | null;
}
