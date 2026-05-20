// Dedicated Supabase client for the Samkhya production/stock area (schema "samkhya").
// Schema is exposed via pgrst.db_schemas. Access restricted to admins by RLS.
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

export const samkhyaSupabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  db: { schema: "samkhya" as never },
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: "sb-samkhya-prod",
  },
});

// ---------- Types ----------
export interface SkIngrediente {
  id: number;
  nome: string;
  categoria: string | null;
  qnt_estoque_g: number | null;
  preco_kg: number | null;
  notas: string | null;
  atualizado_em: string | null;
  criado_em: string | null;
}

export interface SkEstoqueRow extends SkIngrediente {
  qnt_estoque_kg: number | null;
  valor_em_estoque_r: number | null;
}

export interface SkProduto {
  id: number;
  nome: string;
  peso_unidade_g: number | null;
  custo_embalagem_r: number | null;
  preco_venda_r: number | null;
  preco_revenda_r: number | null;
  preco_terapeuta_r: number | null;
  ativo: boolean | null;
  criado_em: string | null;
}

export interface SkProducao {
  id: number;
  produto_id: number;
  unidades_desejadas: number;
  status: "planejada" | "confirmada" | "cancelada" | string | null;
  notas: string | null;
  criado_em: string | null;
  confirmado_em: string | null;
  produtos?: { nome: string } | null;
}

export interface SkReceita {
  id: number;
  produto_id: number;
  ingrediente_id: number;
  quantidade_g: number;
}

export interface SkVenda {
  id: number;
  produto_id: number;
  quantidade: number;
  preco_unitario: number | null;
  canal: string | null;
  data_venda: string | null;
  notas: string | null;
  criado_em: string | null;
  produtos?: { nome: string } | null;
}
