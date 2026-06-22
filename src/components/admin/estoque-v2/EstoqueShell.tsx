import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useHashTab } from "@/hooks/useHashTab";
import { EstoqueProvider } from "./EstoqueContext";
import TabInsumos from "./tabs/TabInsumos";
import TabProdutos from "./tabs/TabProdutos";
import TabPotes from "./tabs/TabPotes";
import TabEtiquetas from "./tabs/TabEtiquetas";

export default function EstoqueShell() {
  const [tab, setTab] = useHashTab("insumos", "tab");
  return (
    <EstoqueProvider setTab={setTab}>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="insumos">Insumos</TabsTrigger>
          <TabsTrigger value="produtos">Produtos & Planejamento</TabsTrigger>
          <TabsTrigger value="potes">Potes</TabsTrigger>
          <TabsTrigger value="etiquetas">Etiquetas</TabsTrigger>
        </TabsList>
        <TabsContent value="insumos" className="mt-4">
          <TabInsumos />
        </TabsContent>
        <TabsContent value="produtos" className="mt-4">
          <TabProdutos />
        </TabsContent>
        <TabsContent value="potes" className="mt-4">
          <TabPotes />
        </TabsContent>
        <TabsContent value="etiquetas" className="mt-4">
          <TabEtiquetas />
        </TabsContent>
      </Tabs>
    </EstoqueProvider>
  );
}
