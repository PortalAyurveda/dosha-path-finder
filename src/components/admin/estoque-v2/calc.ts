import type { SkProduto, SkReceita, SkIngrediente } from "@/integrations/supabase/samkhya-client";

export type Selecao = Record<number, number>; // produto_id -> unidades

export interface IngNecessario {
  ingrediente_id: number;
  quantidade_g: number;
}

/** Calcula gramas necessárias por ingrediente para um único produto. */
export function necessidadePorProduto(
  produto: SkProduto,
  unidades: number,
  receitas: SkReceita[],
): IngNecessario[] {
  if (!unidades || unidades <= 0) return [];
  const recs = receitas.filter((r) => r.produto_id === produto.id);
  if (recs.length === 0) return [];
  const batchTotal = recs.reduce((s, r) => s + Number(r.quantidade_g || 0), 0);
  const peso = Number(produto.peso_unidade_g || 0);
  if (batchTotal <= 0 || peso <= 0) return [];
  const unidadesPorBatch = batchTotal / peso;
  if (unidadesPorBatch <= 0) return [];
  const mult = unidades / unidadesPorBatch;
  return recs.map((r) => ({
    ingrediente_id: r.ingrediente_id,
    quantidade_g: Number(r.quantidade_g) * mult,
  }));
}

/** Agrega gramas necessárias somando todos os produtos selecionados. */
export function agregarNecessidade(
  produtos: SkProduto[],
  selecao: Selecao,
  receitas: SkReceita[],
): Map<number, number> {
  const acc = new Map<number, number>();
  for (const p of produtos) {
    const u = selecao[p.id] ?? 0;
    if (!u) continue;
    for (const item of necessidadePorProduto(p, u, receitas)) {
      acc.set(item.ingrediente_id, (acc.get(item.ingrediente_id) ?? 0) + item.quantidade_g);
    }
  }
  return acc;
}

export interface ResultadoLinha {
  ingrediente_id: number;
  nome: string;
  necessario_g: number;
  estoque_g: number;
  falta_g: number;
  ok: boolean;
}

export function montarResultado(
  necessidade: Map<number, number>,
  ingredientes: Pick<SkIngrediente, "id" | "nome" | "qnt_estoque_g">[],
): ResultadoLinha[] {
  const mapIng = new Map(ingredientes.map((i) => [i.id, i]));
  const rows: ResultadoLinha[] = [];
  for (const [id, nec] of necessidade) {
    if (nec <= 0) continue;
    const ing = mapIng.get(id);
    const estoque = Number(ing?.qnt_estoque_g ?? 0);
    const falta = nec - estoque;
    rows.push({
      ingrediente_id: id,
      nome: ing?.nome ?? `#${id}`,
      necessario_g: nec,
      estoque_g: estoque,
      falta_g: falta > 0 ? falta : 0,
      ok: falta <= 0,
    });
  }
  rows.sort((a, b) => {
    if (a.ok !== b.ok) return a.ok ? 1 : -1;
    return a.nome.localeCompare(b.nome, "pt-BR");
  });
  return rows;
}

export const fmtG = (n: number) =>
  `${n.toLocaleString("pt-BR", { maximumFractionDigits: 0 })} g`;
