import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminNav from "@/components/admin/AdminNav";
import Seo from "@/components/Seo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { Trash2, Plus } from "lucide-react";

type Redir = {
  id: string;
  de_path: string;
  para_path: string;
  ativo: boolean;
  nota: string | null;
  created_at?: string;
};

const AdminRedirecionamentos = () => {
  const [itens, setItens] = useState<Redir[] | null>(null);
  const [de, setDe] = useState("");
  const [para, setPara] = useState("");
  const [nota, setNota] = useState("");
  const [salvando, setSalvando] = useState(false);

  const carregar = async () => {
    const { data, error } = await supabase
      .from("redirecionamentos")
      .select("id, de_path, para_path, ativo, nota, created_at")
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Erro ao carregar", description: error.message, variant: "destructive" });
      setItens([]);
      return;
    }
    setItens((data ?? []) as Redir[]);
  };

  useEffect(() => {
    carregar();
  }, []);

  const criar = async () => {
    const dePath = de.trim();
    const paraPath = para.trim();
    if (!dePath || !paraPath) return;
    setSalvando(true);
    const { data, error } = await supabase
      .from("redirecionamentos")
      .insert({ de_path: dePath, para_path: paraPath, nota: nota.trim() || null, ativo: true })
      .select("id, de_path, para_path, ativo, nota, created_at")
      .single();
    setSalvando(false);
    if (error) {
      toast({ title: "Não foi possível criar", description: error.message, variant: "destructive" });
      return;
    }
    setItens((prev) => [data as Redir, ...(prev ?? [])]);
    setDe("");
    setPara("");
    setNota("");
  };

  const alternar = async (item: Redir) => {
    const novo = !item.ativo;
    setItens((prev) => prev?.map((i) => (i.id === item.id ? { ...i, ativo: novo } : i)) ?? prev);
    const { error } = await supabase.from("redirecionamentos").update({ ativo: novo }).eq("id", item.id);
    if (error) {
      setItens((prev) => prev?.map((i) => (i.id === item.id ? { ...i, ativo: item.ativo } : i)) ?? prev);
      toast({ title: "Erro ao atualizar", description: error.message, variant: "destructive" });
    }
  };

  const excluir = async (item: Redir) => {
    if (!window.confirm(`Excluir o redirecionamento de ${item.de_path}?`)) return;
    const anterior = itens;
    setItens((prev) => prev?.filter((i) => i.id !== item.id) ?? prev);
    const { error } = await supabase.from("redirecionamentos").delete().eq("id", item.id);
    if (error) {
      setItens(anterior ?? null);
      toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Seo title="Redirecionamentos — Admin" description="Gestão de redirecionamentos de URLs do portal." noindex />
      <AdminNav />
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <h1 className="text-2xl font-heading font-bold text-primary">Redirecionamentos</h1>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Novo redirecionamento</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground" htmlFor="de_path">De (caminho antigo)</label>
              <Input id="de_path" value={de} onChange={(e) => setDe(e.target.value)} placeholder="/aula/antiga" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground" htmlFor="para_path">Para (destino)</label>
              <Input id="para_path" value={para} onChange={(e) => setPara(e.target.value)} placeholder="/aula/nova" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground" htmlFor="nota">Nota (opcional)</label>
              <Input id="nota" value={nota} onChange={(e) => setNota(e.target.value)} placeholder="motivo" />
            </div>
            <Button onClick={criar} disabled={salvando || !de.trim() || !para.trim()} className="gap-1.5">
              <Plus className="h-4 w-4" /> Criar
            </Button>
          </CardContent>
        </Card>

        {!itens ? (
          <div className="space-y-2">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : itens.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum redirecionamento cadastrado.</p>
        ) : (
          <ul className="space-y-2">
            {itens.map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-sm truncate">
                    {item.de_path} <span className="text-muted-foreground">→</span> {item.para_path}
                  </p>
                  {item.nota && <p className="text-xs text-muted-foreground truncate">{item.nota}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={item.ativo}
                    onCheckedChange={() => alternar(item)}
                    aria-label={item.ativo ? "Desativar" : "Ativar"}
                  />
                  <span className="text-xs text-muted-foreground w-14">{item.ativo ? "Ativo" : "Inativo"}</span>
                  <Button size="icon" variant="ghost" onClick={() => excluir(item)} aria-label="Excluir">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
};

export default AdminRedirecionamentos;
