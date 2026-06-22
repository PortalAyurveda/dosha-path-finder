import AdminNav from "@/components/admin/AdminNav";
import Seo from "@/components/Seo";
import EstoqueShell from "@/components/admin/estoque-v2/EstoqueShell";

export default function AdminEstoque() {
  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Estoque & Produção · Samkhya"
        description="Gestão de estoque, produção e pedidos de compra Samkhya"
      />
      <AdminNav />
      <main className="px-4 py-4 max-w-[1400px] mx-auto">
        <header className="mb-4">
          <h1 className="text-xl font-semibold">Estoque & Produção — Samkhya</h1>
          <p className="text-muted-foreground text-xs">
            Insumos, produtos, potes e etiquetas. Semáforo único: 🔴 &lt;1 mês · 🟡 1–2 meses · 🟢 2+ meses.
          </p>
        </header>
        <EstoqueShell />
      </main>
    </div>
  );
}
