import AdminNav from "@/components/admin/AdminNav";
import Seo from "@/components/Seo";
import EstoqueGrid from "@/components/admin/estoque-v2/EstoqueGrid";

export default function AdminEstoque() {
  return (
    <div className="min-h-screen bg-background">
      <Seo title="Estoque & Produção · Samkhya" description="Gestão de ingredientes, produções e estoque Samkhya" />
      <AdminNav />
      <main>
        <header className="px-4 pt-4">
          <h1 className="text-xl font-semibold">Estoque & Produção — Samkhya</h1>
          <p className="text-muted-foreground text-xs">Selecione produtos para produzir; o estoque é abatido ao confirmar.</p>
        </header>
        <EstoqueGrid />
      </main>
    </div>
  );
}
