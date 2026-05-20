import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  samkhyaSupabase,
  type SkEstoqueRow,
  type SkProduto,
  type SkProducao,
  type SkReceita,
  type SkIngrediente,
  type SkVenda,
} from "@/integrations/supabase/samkhya-client";

const QK = {
  estoque: ["samkhya", "estoque"],
  produtos: ["samkhya", "produtos"],
  producoes: ["samkhya", "producoes"],
  receitas: (produtoId: number) => ["samkhya", "receitas", produtoId],
  vendas: ["samkhya", "vendas"],
};

export function useEstoque() {
  return useQuery({
    queryKey: QK.estoque,
    queryFn: async () => {
      const { data, error } = await samkhyaSupabase
        .from("v_estoque_ingredientes")
        .select("*");
      if (error) throw error;
      return (data ?? []) as SkEstoqueRow[];
    },
  });
}

export function useSaveIngrediente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<SkIngrediente> & { id?: number }) => {
      if (input.id) {
        const { id, ...patch } = input;
        const { error } = await samkhyaSupabase
          .from("ingredientes")
          .update(patch)
          .eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await samkhyaSupabase.from("ingredientes").insert(input);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QK.estoque });
    },
  });
}

export function useProdutos() {
  return useQuery({
    queryKey: QK.produtos,
    queryFn: async () => {
      const { data, error } = await samkhyaSupabase
        .from("produtos")
        .select("*")
        .order("nome");
      if (error) throw error;
      return (data ?? []) as SkProduto[];
    },
  });
}

export function useProducoesPlanejadas() {
  return useQuery({
    queryKey: QK.producoes,
    queryFn: async () => {
      const { data, error } = await samkhyaSupabase
        .from("producoes")
        .select("*, produtos(nome)")
        .eq("status", "planejada")
        .order("criado_em", { ascending: false });
      if (error) throw error;
      return (data ?? []) as SkProducao[];
    },
  });
}

export function useNovaProducao() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { produto_id: number; unidades_desejadas: number }) => {
      const { error } = await samkhyaSupabase.from("producoes").insert({
        ...input,
        status: "planejada",
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.producoes }),
  });
}

export function useUpdateProducaoStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: "confirmada" | "cancelada" }) => {
      const patch: Record<string, unknown> = { status };
      if (status === "confirmada") patch.confirmado_em = new Date().toISOString();
      const { error } = await samkhyaSupabase.from("producoes").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.producoes }),
  });
}

export interface NecessidadeRow {
  ingrediente_id: number;
  nome: string;
  necessario_g: number;
  estoque_g: number;
  saldo_g: number;
  ok: boolean;
}

export function useNecessidadeProducao(producao: SkProducao | null) {
  return useQuery({
    enabled: !!producao,
    queryKey: ["samkhya", "necessidade", producao?.id],
    queryFn: async (): Promise<NecessidadeRow[]> => {
      if (!producao) return [];
      const { data: receitas, error: errR } = await samkhyaSupabase
        .from("receitas")
        .select("id, produto_id, ingrediente_id, quantidade_g")
        .eq("produto_id", producao.produto_id);
      if (errR) throw errR;
      const ids = (receitas ?? []).map((r) => r.ingrediente_id);
      if (ids.length === 0) return [];
      const { data: ings, error: errI } = await samkhyaSupabase
        .from("ingredientes")
        .select("id, nome, qnt_estoque_g")
        .in("id", ids);
      if (errI) throw errI;
      const mapI = new Map<number, { nome: string; estoque: number }>(
        (ings ?? []).map((i) => [i.id, { nome: i.nome, estoque: Number(i.qnt_estoque_g) || 0 }]),
      );
      const unidades = Number(producao.unidades_desejadas) || 0;
      return (receitas as SkReceita[]).map((r) => {
        const ing = mapI.get(r.ingrediente_id);
        const necessario = Number(r.quantidade_g) * unidades;
        const estoque = ing?.estoque ?? 0;
        const saldo = estoque - necessario;
        return {
          ingrediente_id: r.ingrediente_id,
          nome: ing?.nome ?? `#${r.ingrediente_id}`,
          necessario_g: necessario,
          estoque_g: estoque,
          saldo_g: saldo,
          ok: saldo >= 0,
        };
      });
    },
  });
}

export function useVendas() {
  return useQuery({
    queryKey: QK.vendas,
    queryFn: async () => {
      const { data, error } = await samkhyaSupabase
        .from("vendas")
        .select("*, produtos(nome)")
        .order("data_venda", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as SkVenda[];
    },
  });
}

export function useNovaVenda() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      produto_id: number;
      quantidade: number;
      preco_unitario: number;
      canal: string;
      data_venda: string;
      notas?: string | null;
    }) => {
      const { error } = await samkhyaSupabase.from("vendas").insert(input);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.vendas }),
  });
}
