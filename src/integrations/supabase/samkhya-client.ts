// Dedicated Supabase client for the Samkhya production/stock area (schema "samkhya").
// Schema is exposed via pgrst.db_schemas. Access restricted to admins by RLS.
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

// IMPORTANT: must share the same storageKey as the main client so the admin
// session is reused. With a different storageKey this client would have no
// session and queries would run as `anon`, failing all `is_admin()` RLS checks.
export const samkhyaSupabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  db: { schema: "samkhya" as never },
  auth: {
    storage: typeof window !== "undefined" ? localStorage : undefined,
    persistSession: true,
    autoRefreshToken: false, // refresh is handled by the main client
    detectSessionInUrl: false,
    storageKey: "sb-portalayurveda-auth",
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
  estimativa_3_meses: number | null;
  estimativa_mensal: number | null;
}

export type SkSemaforo = "verde" | "amarelo" | "vermelho";

export interface SkCapacidade {
  id: number;
  nome: string;
  peso_unidade_g: number | null;
  estimativa_3_meses: number | null;
  estimativa_mensal: number | null;
  meta_60_dias: number | null;
  unidades_possiveis: number | null;
  semaforo: SkSemaforo;
}

export interface SkSemaforoPotes {
  tipo: string;
  label: string;
  qnt_estoque: number;
  estimativa_mensal: number | null;
  meta_60_dias: number | null;
  dias_estoque: number | null;
  semaforo: SkSemaforo;
}

export interface SkSemaforoEtiquetas {
  produto_id: number;
  produto_nome: string;
  qnt_estoque: number;
  estimativa_mensal: number | null;
  meta_60_dias: number | null;
  dias_estoque: number | null;
  semaforo: SkSemaforo;
}

export interface SkPedidoCompraItem {
  ingrediente_id: number;
  ingrediente_nome: string;
  qtd_necessaria_g: number;
  qtd_arredondada_g: number;
  qtd_display: string;
  preco_estimado: number;
}

export interface SkPedidoCompra {
  id: number;
  criado_em: string | null;
  status: "aberto" | "enviado" | "recebido" | "cancelado" | string;
  itens: SkPedidoCompraItem[];
  total_estimado_r: number | null;
  notas: string | null;
  atualizado_em: string | null;
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

export type SkNecessidadeStatus = "ok" | "falta" | "sem_pedido";

export interface SkNecessidadeIngrediente {
  id: number;
  nome: string;
  categoria: string | null;
  qnt_estoque_g: number | null;
  qnt_necessaria_g: number | null;
  saldo_g: number | null;
  status: SkNecessidadeStatus | string;
  preco_kg: number | null;
  atualizado_em: string | null;
}
