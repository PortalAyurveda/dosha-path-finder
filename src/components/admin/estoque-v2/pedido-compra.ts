import type {
  SkProduto,
  SkReceita,
  SkIngrediente,
  SkPedidoCompraItem,
} from "@/integrations/supabase/samkhya-client";

export type QtdProduzir = Record<number, number>; // produto_id -> qtd

/** Necessidade em gramas por ingrediente para um único produto + qtd unidades. */
function gramasPorProduto(
  produto: SkProduto,
  unidades: number,
  receitas: SkReceita[],
): Map<number, number> {
  const out = new Map<number, number>();
  if (!unidades || unidades <= 0) return out;
  const recs = receitas.filter((r) => r.produto_id === produto.id);
  if (recs.length === 0) return out;
  const batchTotal = recs.reduce((s, r) => s + Number(r.quantidade_g || 0), 0);
  const peso = Number(produto.peso_unidade_g || 0);
  if (batchTotal <= 0 || peso <= 0) return out;
  const unidadesPorBatch = batchTotal / peso;
  if (unidadesPorBatch <= 0) return out;
  const mult = unidades / unidadesPorBatch;
  for (const r of recs) {
    out.set(r.ingrediente_id, (out.get(r.ingrediente_id) ?? 0) + Number(r.quantidade_g) * mult);
  }
  return out;
}

function arredondar(faltaG: number): { qtd: number; display: string } | null {
  if (faltaG <= 0) return null;
  if (faltaG <= 500) return { qtd: 500, display: "500g" };
  const kg = Math.ceil(faltaG / 1000);
  return { qtd: kg * 1000, display: `${kg}kg` };
}

export interface PedidoMontado {
  itens: SkPedidoCompraItem[];
  total: number;
}

export function montarPedido(
  produtos: SkProduto[],
  qtdProduzir: QtdProduzir,
  receitas: SkReceita[],
  ingredientes: Pick<SkIngrediente, "id" | "nome" | "qnt_estoque_g" | "preco_kg">[],
): PedidoMontado {
  // 1+2+3: agrega necessidade
  const necessario = new Map<number, number>();
  for (const p of produtos) {
    const q = qtdProduzir[p.id] ?? 0;
    if (!q) continue;
    for (const [ingId, g] of gramasPorProduto(p, q, receitas)) {
      necessario.set(ingId, (necessario.get(ingId) ?? 0) + g);
    }
  }

  const mapIng = new Map(ingredientes.map((i) => [i.id, i]));
  const itens: SkPedidoCompraItem[] = [];
  let total = 0;

  for (const [ingId, nec] of necessario) {
    const ing = mapIng.get(ingId);
    const estoque = Number(ing?.qnt_estoque_g ?? 0);
    const falta = nec - estoque;
    const round = arredondar(falta);
    if (!round) continue;
    const precoKg = Number(ing?.preco_kg ?? 0);
    const preco = (round.qtd / 1000) * precoKg;
    total += preco;
    itens.push({
      ingrediente_id: ingId,
      ingrediente_nome: ing?.nome ?? `#${ingId}`,
      qtd_necessaria_g: Math.round(nec),
      qtd_arredondada_g: round.qtd,
      qtd_display: round.display,
      preco_estimado: Number(preco.toFixed(2)),
    });
  }

  itens.sort((a, b) => a.ingrediente_nome.localeCompare(b.ingrediente_nome, "pt-BR"));
  return { itens, total: Number(total.toFixed(2)) };
}

export const fmtBRL = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
