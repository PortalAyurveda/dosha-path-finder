import { useState } from "react";
import { X } from "lucide-react";
import AdminNav from "@/components/admin/AdminNav";
import Seo from "@/components/Seo";
import { Button } from "@/components/ui/button";
import EstoqueInsumosTable from "@/components/admin/estoque-v2/tabs/EstoqueInsumosTable";
import TabEstimativaVendas from "@/components/admin/estoque-v2/tabs/TabEstimativaVendas";
import TabResultadoFinal from "@/components/admin/estoque-v2/tabs/TabResultadoFinal";
import TabConfirmarProducao from "@/components/admin/estoque-v2/tabs/TabConfirmarProducao";
import TabEstoqueProdutos from "@/components/admin/estoque-v2/tabs/TabEstoqueProdutos";
import TabEstoqueEtiquetas from "@/components/admin/estoque-v2/tabs/TabEstoqueEtiquetas";

type PanelKey = "insumos" | "estimativa" | "resultado" | "confirmar" | "produtos" | "etiquetas";

const PANELS: { key: PanelKey; label: string; render: () => JSX.Element }[] = [
  { key: "insumos", label: "Estoque de Insumos", render: () => <EstoqueInsumosTable /> },
  { key: "estimativa", label: "Estimativa de Vendas", render: () => <TabEstimativaVendas /> },
  { key: "resultado", label: "Resultado Final", render: () => <TabResultadoFinal /> },
  { key: "confirmar", label: "Confirmar Produção", render: () => <TabConfirmarProducao /> },
  { key: "produtos", label: "Estoque de Produtos", render: () => <TabEstoqueProdutos /> },
  { key: "etiquetas", label: "Etiquetas & Potes", render: () => <TabEstoqueEtiquetas /> },
];

export default function AdminEstoque() {
  const [open, setOpen] = useState<Set<PanelKey>>(new Set(["insumos"]));

  const toggle = (k: PanelKey) =>
    setOpen((s) => {
      const next = new Set(s);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });

  const openedInOrder = PANELS.filter((p) => open.has(p.key));

  return (
    <div className="min-h-screen bg-background">
      <Seo title="Estoque & Produção · Samkhya" description="Gestão de estoque, produção e pedidos de compra Samkhya" />
      <AdminNav />
      <main className="px-4 py-4">
        <header className="mb-4">
          <h1 className="text-xl font-semibold">Estoque & Produção — Samkhya</h1>
          <p className="text-muted-foreground text-xs">Clique para abrir/fechar cada painel. Você pode deixar vários abertos lado a lado.</p>
        </header>

        <div className="flex flex-wrap gap-2 mb-4">
          {PANELS.map((p) => {
            const active = open.has(p.key);
            return (
              <Button
                key={p.key}
                size="sm"
                variant={active ? "default" : "outline"}
                onClick={() => toggle(p.key)}
              >
                {p.label}
              </Button>
            );
          })}
        </div>

        {openedInOrder.length === 0 ? (
          <div className="text-muted-foreground text-sm border rounded p-6 text-center">
            Nenhum painel aberto. Clique em um botão acima para abrir.
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2 items-start">
            {openedInOrder.map((p) => (
              <section
                key={p.key}
                className="flex-shrink-0 w-[640px] max-w-full rounded border bg-card"
              >
                <header className="flex items-center justify-between gap-2 px-3 py-2 border-b">
                  <div className="font-medium text-sm">{p.label}</div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={() => toggle(p.key)}
                    aria-label={`Fechar ${p.label}`}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </header>
                <div className="p-3">{p.render()}</div>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
