import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminNav from "@/components/admin/AdminNav";
import EstoqueTab from "@/components/admin/estoque/EstoqueTab";
import ProducaoTab from "@/components/admin/estoque/ProducaoTab";
import VendasTab from "@/components/admin/estoque/VendasTab";
import Seo from "@/components/Seo";

export default function AdminEstoque() {
  return (
    <div className="min-h-screen bg-background">
      <Seo title="Estoque & Produção · Samkhya" description="Gestão de ingredientes, produções e vendas Samkhya" />
      <AdminNav />
      <main className="max-w-6xl mx-auto px-4 py-6">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold">Estoque & Produção — Samkhya</h1>
          <p className="text-muted-foreground text-sm">Ingredientes, produções planejadas e registro de vendas.</p>
        </header>

        <Tabs defaultValue="estoque">
          <TabsList>
            <TabsTrigger value="estoque">Estoque</TabsTrigger>
            <TabsTrigger value="producao">Produção</TabsTrigger>
            <TabsTrigger value="vendas">Vendas</TabsTrigger>
          </TabsList>
          <TabsContent value="estoque" className="mt-6"><EstoqueTab /></TabsContent>
          <TabsContent value="producao" className="mt-6"><ProducaoTab /></TabsContent>
          <TabsContent value="vendas" className="mt-6"><VendasTab /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
