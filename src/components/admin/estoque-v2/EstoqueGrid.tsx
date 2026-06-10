import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  useIngredientesRaw,
  useProdutosAtivos,
  useReceitasAll,
  useConfirmarProducao,
} from "@/hooks/useSamkhyaEstoque";
import ColInsumos from "./ColInsumos";
import ColProduzir from "./ColProduzir";
import ColResultado from "./ColResultado";
import ColEmBreve from "./ColEmBreve";
import { agregarNecessidade, montarResultado, type Selecao } from "./calc";

export default function EstoqueGrid() {
  const ingQ = useIngredientesRaw();
  const prodQ = useProdutosAtivos();
  const recQ = useReceitasAll();
  const confirmar = useConfirmarProducao();

  const [selecao, setSelecao] = useState<Selecao>({});

  const ingredientes = ingQ.data ?? [];
  const produtos = prodQ.data ?? [];
  const receitas = recQ.data ?? [];

  const necessidade = useMemo(
    () => agregarNecessidade(produtos, selecao, receitas),
    [produtos, selecao, receitas],
  );

  const resultado = useMemo(
    () => montarResultado(necessidade, ingredientes),
    [necessidade, ingredientes],
  );

  const podeConfirmar = Object.values(selecao).some((n) => n > 0);

  const handleConfirmar = async () => {
    const producoes = Object.entries(selecao)
      .filter(([, u]) => u > 0)
      .map(([id, u]) => ({ produto_id: Number(id), unidades_desejadas: u }));
    const abates = Array.from(necessidade.entries()).map(([ingId, nec]) => {
      const cur = ingredientes.find((i) => i.id === ingId);
      const estoque = Number(cur?.qnt_estoque_g ?? 0);
      return {
        ingrediente_id: ingId,
        quantidade_g: nec,
        novo_estoque: estoque - nec,
      };
    });
    try {
      await confirmar.mutateAsync({ producoes, abates });
      setSelecao({});
      toast.success("Produção confirmada e estoque atualizado");
    } catch (e: any) {
      toast.error(e?.message ?? "Erro ao confirmar produção");
    }
  };

  const erro = ingQ.error || prodQ.error || recQ.error;

  return (
    <div className="px-4 py-4">
      {erro && (
        <div className="mb-3 p-3 rounded border border-destructive/40 bg-destructive/10 text-sm text-destructive">
          Erro ao carregar dados: {(erro as Error).message}
        </div>
      )}
      <div
        className="grid grid-cols-1 lg:grid-cols-5 gap-3"
        style={{ height: "calc(100vh - 9rem)" }}
      >
        <ColInsumos
          ingredientes={ingredientes}
          necessidade={necessidade}
          loading={ingQ.isLoading}
        />
        <ColProduzir
          produtos={produtos}
          receitas={receitas}
          ingredientes={ingredientes}
          selecao={selecao}
          setSelecao={setSelecao}
          loading={prodQ.isLoading || recQ.isLoading}
        />
        <ColResultado
          rows={resultado}
          onConfirmar={handleConfirmar}
          podeConfirmar={podeConfirmar}
          loading={confirmar.isPending}
        />
        <ColEmBreve titulo="Embalagens & Etiquetas" />
        <ColEmBreve titulo="Estoque de Produtos" />
      </div>
    </div>
  );
}
