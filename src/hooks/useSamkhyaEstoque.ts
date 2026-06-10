import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  samkhyaSupabase,
  type SkEstoqueRow,
  type SkProduto,
  type SkProducao,
  type SkReceita,
  type SkIngrediente,
  type SkVenda,
  type SkCapacidade,
  type SkSemaforoPotes,
  type SkSemaforoEtiquetas,
  type SkPedidoCompra,
  type SkPedidoCompraItem,
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
      if (error) {
        console.error("[samkhya] v_estoque_ingredientes:", error);
        throw error;
      }
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

export function useProdutosAtivos() {
  return useQuery({
    queryKey: ["samkhya", "produtos", "ativos"],
    queryFn: async () => {
      const { data, error } = await samkhyaSupabase
        .from("produtos")
        .select("*")
        .eq("ativo", true)
        .order("nome");
      if (error) throw error;
      return (data ?? []) as SkProduto[];
    },
  });
}

export function useReceitasAll() {
  return useQuery({
    queryKey: ["samkhya", "receitas", "all"],
    queryFn: async () => {
      const { data, error } = await samkhyaSupabase
        .from("receitas")
        .select("id, produto_id, ingrediente_id, quantidade_g");
      if (error) throw error;
      return (data ?? []) as SkReceita[];
    },
  });
}

export function useIngredientesRaw() {
  return useQuery({
    queryKey: ["samkhya", "ingredientes", "raw"],
    queryFn: async () => {
      const { data, error } = await samkhyaSupabase
        .from("ingredientes")
        .select("id, nome, qnt_estoque_g")
        .order("nome");
      if (error) throw error;
      return (data ?? []) as Pick<SkIngrediente, "id" | "nome" | "qnt_estoque_g">[];
    },
  });
}

export function useConfirmarProducao() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      producoes: { produto_id: number; unidades_desejadas: number }[];
      abates: { ingrediente_id: number; quantidade_g: number; novo_estoque: number }[];
    }) => {
      if (input.producoes.length > 0) {
        const { error: e1 } = await samkhyaSupabase.from("producoes").insert(
          input.producoes.map((p) => ({
            produto_id: p.produto_id,
            unidades_desejadas: p.unidades_desejadas,
            status: "confirmada",
            confirmado_em: new Date().toISOString(),
          })),
        );
        if (e1) throw e1;
      }
      for (const a of input.abates) {
        const { error: e2 } = await samkhyaSupabase
          .from("ingredientes")
          .update({ qnt_estoque_g: a.novo_estoque, atualizado_em: new Date().toISOString() })
          .eq("id", a.ingrediente_id);
        if (e2) throw e2;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["samkhya", "estoque"] });
      qc.invalidateQueries({ queryKey: ["samkhya", "ingredientes", "raw"] });
      qc.invalidateQueries({ queryKey: ["samkhya", "producoes"] });
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

// ===== Estimativas =====
export function useEstimativasVendas() {
  return useQuery({
    queryKey: ["samkhya", "produtos", "estimativas"],
    queryFn: async () => {
      const { data, error } = await samkhyaSupabase
        .from("produtos")
        .select("id, nome, estimativa_3_meses, estimativa_mensal, ativo")
        .eq("ativo", true)
        .order("estimativa_3_meses", { ascending: false, nullsFirst: false });
      if (error) throw error;
      return (data ?? []) as Pick<SkProduto, "id" | "nome" | "estimativa_3_meses" | "estimativa_mensal" | "ativo">[];
    },
  });
}

export function useUpdateEstimativa3Meses() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, total3m }: { id: number; total3m: number }) => {
      const { error } = await samkhyaSupabase
        .from("produtos")
        .update({ estimativa_3_meses: total3m })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["samkhya", "produtos"] });
      qc.invalidateQueries({ queryKey: ["samkhya", "capacidade"] });
      qc.invalidateQueries({ queryKey: ["samkhya", "semaforo"] });
    },
  });
}

// ===== Capacidade / Semáforos =====
export function useCapacidadeProducao() {
  return useQuery({
    queryKey: ["samkhya", "capacidade"],
    queryFn: async () => {
      const { data, error } = await samkhyaSupabase
        .from("v_capacidade_producao")
        .select("*")
        .order("dias_estoque_atual", { ascending: true, nullsFirst: false });
      if (error) throw error;
      return (data ?? []) as SkCapacidade[];
    },
  });
}

export function useUpdateProdutoEstoque() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, estoque_atual }: { id: number; estoque_atual: number }) => {
      const { error } = await samkhyaSupabase
        .from("produtos")
        .update({ estoque_atual })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["samkhya", "capacidade"] });
      qc.invalidateQueries({ queryKey: ["samkhya", "produtos"] });
      qc.invalidateQueries({ queryKey: ["samkhya", "semaforo"] });
    },
  });
}

export function useSemaforoPotes() {
  return useQuery({
    queryKey: ["samkhya", "semaforo", "potes"],
    queryFn: async () => {
      const { data, error } = await samkhyaSupabase.from("v_semaforo_potes").select("*").order("label");
      if (error) throw error;
      return (data ?? []) as SkSemaforoPotes[];
    },
  });
}

export function useSemaforoEtiquetas() {
  return useQuery({
    queryKey: ["samkhya", "semaforo", "etiquetas"],
    queryFn: async () => {
      const { data, error } = await samkhyaSupabase.from("v_semaforo_etiquetas").select("*").order("produto_nome");
      if (error) throw error;
      return (data ?? []) as SkSemaforoEtiquetas[];
    },
  });
}

export function useUpdatePoteEstoque() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ tipo, qnt }: { tipo: string; qnt: number }) => {
      const { error } = await samkhyaSupabase
        .from("potes_estoque")
        .update({ qnt_estoque: qnt, atualizado_em: new Date().toISOString() })
        .eq("tipo", tipo);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["samkhya", "semaforo", "potes"] }),
  });
}

export function useUpdateEtiquetaEstoque() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ produto_nome, qnt }: { produto_nome: string; qnt: number }) => {
      const { error } = await samkhyaSupabase
        .from("etiquetas_estoque")
        .update({ qnt_estoque: qnt, atualizado_em: new Date().toISOString() })
        .eq("produto_nome", produto_nome);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["samkhya", "semaforo", "etiquetas"] }),
  });
}

// ===== Ingredientes com preço (pro pedido de compra) =====
export function useIngredientesCompletos() {
  return useQuery({
    queryKey: ["samkhya", "ingredientes", "completos"],
    queryFn: async () => {
      const { data, error } = await samkhyaSupabase
        .from("ingredientes")
        .select("id, nome, qnt_estoque_g, preco_kg")
        .order("nome");
      if (error) throw error;
      return (data ?? []) as Pick<SkIngrediente, "id" | "nome" | "qnt_estoque_g" | "preco_kg">[];
    },
  });
}

// ===== Pedidos de Compra =====
export function usePedidosCompra() {
  return useQuery({
    queryKey: ["samkhya", "pedidos_compra"],
    queryFn: async () => {
      const { data, error } = await samkhyaSupabase
        .from("pedidos_compra")
        .select("*")
        .order("criado_em", { ascending: false });
      if (error) throw error;
      return (data ?? []) as SkPedidoCompra[];
    },
  });
}

export function useCriarPedidoCompra() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { itens: SkPedidoCompraItem[]; total: number }) => {
      const { error } = await samkhyaSupabase.from("pedidos_compra").insert({
        status: "aberto",
        itens: input.itens,
        total_estimado_r: input.total,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["samkhya", "pedidos_compra"] }),
  });
}

export function useAtualizarStatusPedido() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      pedido,
      novoStatus,
    }: {
      pedido: SkPedidoCompra;
      novoStatus: "enviado" | "recebido" | "cancelado";
    }) => {
      const { error } = await samkhyaSupabase
        .from("pedidos_compra")
        .update({ status: novoStatus, atualizado_em: new Date().toISOString() })
        .eq("id", pedido.id);
      if (error) throw error;

      if (novoStatus === "recebido") {
        // soma ao estoque de cada ingrediente
        for (const item of pedido.itens ?? []) {
          const { data: cur, error: e1 } = await samkhyaSupabase
            .from("ingredientes")
            .select("qnt_estoque_g")
            .eq("id", item.ingrediente_id)
            .maybeSingle();
          if (e1) throw e1;
          const atual = Number(cur?.qnt_estoque_g ?? 0);
          const { error: e2 } = await samkhyaSupabase
            .from("ingredientes")
            .update({
              qnt_estoque_g: atual + Number(item.qtd_arredondada_g || 0),
              atualizado_em: new Date().toISOString(),
            })
            .eq("id", item.ingrediente_id);
          if (e2) throw e2;
        }
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["samkhya", "pedidos_compra"] });
      qc.invalidateQueries({ queryKey: ["samkhya", "ingredientes"] });
      qc.invalidateQueries({ queryKey: ["samkhya", "estoque"] });
    },
  });
}

import type { SkNecessidadeIngrediente } from "@/integrations/supabase/samkhya-client";

export function useNecessidadeIngredientes() {
  return useQuery({
    queryKey: ["samkhya", "necessidade", "ingredientes"],
    queryFn: async () => {
      const { data, error } = await samkhyaSupabase
        .from("v_necessidade_ingredientes")
        .select("*")
        .order("nome");
      if (error) throw error;
      return (data ?? []) as SkNecessidadeIngrediente[];
    },
  });
}

export function useUpdateIngredienteEstoque() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, qnt }: { id: number; qnt: number }) => {
      const { error } = await samkhyaSupabase
        .from("ingredientes")
        .update({ qnt_estoque_g: qnt, atualizado_em: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["samkhya", "ingredientes"] });
      qc.invalidateQueries({ queryKey: ["samkhya", "necessidade"] });
      qc.invalidateQueries({ queryKey: ["samkhya", "estoque"] });
      qc.invalidateQueries({ queryKey: ["samkhya", "capacidade"] });
    },
  });
}
