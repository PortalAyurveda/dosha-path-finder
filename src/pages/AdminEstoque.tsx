import AdminNav from "@/components/admin/AdminNav";
import Seo from "@/components/Seo";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TabEstimativaVendas from "@/components/admin/estoque-v2/tabs/TabEstimativaVendas";
import TabResultadoFinal from "@/components/admin/estoque-v2/tabs/TabResultadoFinal";
import TabConfirmarProducao from "@/components/admin/estoque-v2/tabs/TabConfirmarProducao";
import TabEstoqueProdutos from "@/components/admin/estoque-v2/tabs/TabEstoqueProdutos";
import TabEstoqueEtiquetas from "@/components/admin/estoque-v2/tabs/TabEstoqueEtiquetas";

export default function AdminEstoque() {
  return (
    <div className="min-h-screen bg-background">
      <Seo title="Estoque & Produção · Samkhya" description="Gestão de estoque, produção e pedidos de compra Samkhya" />
      <AdminNav />
      <main className="px-4 py-4">
        <header className="mb-4">
          <h1 className="text-xl font-semibold">Estoque & Produção — Samkhya</h1>
          <p className="text-muted-foreground text-xs">Estimativas, produção, pedidos de compra e estoque de embalagens.</p>
        </header>

        <Tabs defaultValue="estimativa">
          <TabsList className="flex flex-wrap h-auto">
            <TabsTrigger value="estimativa">Estimativa de Vendas</TabsTrigger>
            <TabsTrigger value="resultado">Resultado Final</TabsTrigger>
            <TabsTrigger value="confirmar">Confirmar Produção</TabsTrigger>
            <TabsTrigger value="produtos">Estoque de Produtos</TabsTrigger>
            <TabsTrigger value="etiquetas">Etiquetas & Potes</TabsTrigger>
          </TabsList>

          <TabsContent value="estimativa" className="mt-4"><TabEstimativaVendas /></TabsContent>
          <TabsContent value="resultado" className="mt-4"><TabResultadoFinal /></TabsContent>
          <TabsContent value="confirmar" className="mt-4"><TabConfirmarProducao /></TabsContent>
          <TabsContent value="produtos" className="mt-4"><TabEstoqueProdutos /></TabsContent>
          <TabsContent value="etiquetas" className="mt-4"><TabEstoqueEtiquetas /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
