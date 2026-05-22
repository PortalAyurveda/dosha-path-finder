import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminNav from "@/components/admin/AdminNav";
import EstoqueTab from "@/components/admin/estoque/EstoqueTab";
import ProducaoTab from "@/components/admin/estoque/ProducaoTab";
import VendasTab from "@/components/admin/estoque/VendasTab";
import Seo from "@/components/Seo";
import { useHashTab } from "@/hooks/useHashTab";

export default function AdminEstoque() {
  const [tab, setTab] = useHashTab("estoque");
  return (
    <div className="min-h-screen bg-background">
      <Seo title="Estoque & Produção · Samkhya" description="Gestão de ingredientes, produções e vendas Samkhya" />
      <AdminNav />
      <main className="max-w-6xl mx-auto px-4 py-6">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold">Estoque & Produção — Samkhya</h1>
          <p className="text-muted-foreground text-sm">Ingredientes, produções planejadas e registro de vendas.</p>
        </header>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="estoque">Estoque</TabsTrigger>
            <TabsTrigger value="producao">Produção</TabsTrigger>
            <TabsTrigger value="vendas">Vendas</TabsTrigger>
          </TabsList>
          <TabsContent forceMount value="estoque" className="mt-6 data-[state=inactive]:hidden"><EstoqueTab /></TabsContent>
          <TabsContent forceMount value="producao" className="mt-6 data-[state=inactive]:hidden"><ProducaoTab /></TabsContent>
          <TabsContent forceMount value="vendas" className="mt-6 data-[state=inactive]:hidden"><VendasTab /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

