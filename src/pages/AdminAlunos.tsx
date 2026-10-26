import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { GraduationCap, Plus } from "lucide-react";
import AdminNav from "@/components/admin/AdminNav";
import Seo from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AlunosFormacao from "@/components/admin/alunos/AlunosFormacao";
import AlunosTodos, { erroAlunos, rpcAlunos, type ConfigAlunos, type CursoAluno } from "@/components/admin/alunos/AlunosTodos";
import FichaAluno from "@/components/admin/alunos/FichaAluno";
import LiberarCursoDialog, { type LiberacaoInicial } from "@/components/admin/alunos/LiberarCursoDialog";
import EstenderCursoDialog from "@/components/admin/alunos/EstenderCursoDialog";

export default function AdminAlunos() {
  const [params, setParams] = useSearchParams();
  const aba = params.get("aba") === "formacao" ? "formacao" : "todos";
  const [config, setConfig] = useState<ConfigAlunos | null>(null);
  const configPedido = useRef<Promise<ConfigAlunos> | null>(null);
  const [revisao, setRevisao] = useState(0);
  const [chave, setChave] = useState<string | null>(null);
  const [liberar, setLiberar] = useState(false);
  const [inicial, setInicial] = useState<LiberacaoInicial>({});
  const [estender, setEstender] = useState<CursoAluno | null>(null);
  useEffect(() => {
    let ativo = true;
    configPedido.current ??= rpcAlunos<ConfigAlunos>("admin_alunos_config");
    configPedido.current.then((r) => { if (ativo) setConfig(r); }).catch((e) => { if (ativo) erroAlunos(e); });
    return () => { ativo = false; };
  }, []);
  function abrirLiberar(valor: LiberacaoInicial) { setInicial(valor); setLiberar(true); }
  function atualizar() { setRevisao((v) => v + 1); }
  return <div className="min-h-screen bg-background">
    <Seo title="Alunos — Admin" description="Gestão dos alunos da Formação Ayurveda" />
    <AdminNav />
    <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0"><h1 className="text-2xl font-heading font-bold flex items-center gap-2"><GraduationCap className="w-6 h-6 shrink-0" />Alunos</h1><p className="text-sm text-muted-foreground mt-1">Todos os cursos do Portal e a Formação.</p></div>
        <Button size="sm" className="gap-1.5 shrink-0 sm:h-10 sm:px-4" disabled={!config} onClick={() => abrirLiberar({})}><Plus className="w-4 h-4" />Liberar curso</Button>
      </header>
      <Tabs value={aba} onValueChange={(v) => { const nova = new URLSearchParams(params); if (v === "formacao") nova.set("aba", "formacao"); else nova.delete("aba"); setParams(nova); }}>
        <TabsList className="w-full sm:w-auto"><TabsTrigger className="flex-1" value="todos">Todos os alunos</TabsTrigger><TabsTrigger className="flex-1" value="formacao">Formação</TabsTrigger></TabsList>
        <TabsContent value="todos" className="mt-5"><AlunosTodos config={config} revisao={revisao} onAbrir={setChave} /></TabsContent>
        <TabsContent value="formacao" className="mt-5"><AlunosFormacao /></TabsContent>
      </Tabs>
    </main>
    <FichaAluno chave={chave} revisao={revisao} config={config} onClose={() => setChave(null)} onLiberar={abrirLiberar} onEstender={setEstender} onSucesso={atualizar} />
    <LiberarCursoDialog open={liberar} onOpenChange={setLiberar} inicial={inicial} config={config} onSucesso={atualizar} />
    <EstenderCursoDialog curso={estender} config={config} onClose={() => setEstender(null)} onSucesso={atualizar} />
  </div>;
}
