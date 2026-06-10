import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import type { SkProduto, SkReceita, SkIngrediente } from "@/integrations/supabase/samkhya-client";
import { necessidadePorProduto, type Selecao, fmtG } from "./calc";

interface Props {
  produtos: SkProduto[];
  receitas: SkReceita[];
  ingredientes: Pick<SkIngrediente, "id" | "nome">[];
  selecao: Selecao;
  setSelecao: (s: Selecao) => void;
  loading?: boolean;
}

export default function ColProduzir({
  produtos,
  receitas,
  ingredientes,
  selecao,
  setSelecao,
  loading,
}: Props) {
  const nomeIng = new Map(ingredientes.map((i) => [i.id, i.nome]));

  const setUnidades = (id: number, n: number) => {
    const next = { ...selecao };
    if (!n || n <= 0) delete next[id];
    else next[id] = n;
    setSelecao(next);
  };

  return (
    <div className="flex flex-col h-full border border-border rounded-lg bg-card overflow-hidden">
      <div className="px-3 py-2 border-b border-border bg-muted/40">
        <h3 className="text-sm font-semibold">O que quero produzir</h3>
        <p className="text-xs text-muted-foreground">{produtos.length} produtos ativos</p>
      </div>
      <div className="flex-1 overflow-y-auto divide-y divide-border">
        {loading && <p className="p-3 text-sm text-muted-foreground">Carregando…</p>}
        {produtos.map((p) => {
          const unidades = selecao[p.id] ?? 0;
          const ativo = unidades > 0;
          const itens = ativo ? necessidadePorProduto(p, unidades, receitas) : [];
          return (
            <div key={p.id} className="p-3 space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={ativo}
                  onCheckedChange={(c) => setUnidades(p.id, c ? Math.max(unidades, 1) : 0)}
                />
                <span className="flex-1 text-sm font-medium truncate">{p.nome}</span>
                <Input
                  type="number"
                  min={0}
                  className="w-20 h-8 text-right"
                  value={unidades || ""}
                  onChange={(e) => setUnidades(p.id, Number(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>
              {itens.length > 0 && (
                <p className="text-xs text-muted-foreground leading-snug pl-6">
                  {itens
                    .map((i) => `${nomeIng.get(i.ingrediente_id) ?? `#${i.ingrediente_id}`} +${fmtG(i.quantidade_g)}`)
                    .join(" · ")}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
