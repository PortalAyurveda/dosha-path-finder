import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Loader2, Save, ExternalLink, Trash2, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import AdminNav from "@/components/admin/AdminNav";
import { getTherapistProfilePath } from "@/lib/terapeutas";

interface Terapeuta {
  id: string;
  nome: string | null;
  email: string | null;
  imagem: string | null;
  ["imagem.1"]: string | null;
  especialidade: string | null;
  cidade: string | null;
  estado: string | null;
  pais?: string | null;
  whatsapp: string | null;
  instagram: string | null;
  website?: string | null;
  resumo: string | null;
  formado_desde: number | null;
  status: string | null;
  ["terapeutas(dinamica)"]: string | null;
  title: string | null;
}

const STATUS_OPTIONS = ["pendente", "aprovado", "rejeitado"];

const AdminTerapeutas = () => {
  const { toast } = useToast();
  const [terapeutas, setTerapeutas] = useState<Terapeuta[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");

  const fetchAll = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("portal_terapeutas")
      .select("*")
      .order("created date", { ascending: false });
    if (error) {
      toast({ title: "Erro ao carregar", description: error.message, variant: "destructive" });
    } else {
      setTerapeutas((data ?? []) as any);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const updateField = (id: string, field: keyof Terapeuta, value: any) => {
    setTerapeutas((list) =>
      list.map((t) => (t.id === id ? { ...t, [field]: value } : t)),
    );
  };

  const saveOne = async (t: Terapeuta) => {
    setSavingId(t.id);
    const payload: any = {
      nome: t.nome,
      title: t.nome, // mantém title sincronizado
      email: t.email,
      imagem: t.imagem,
      especialidade: t.especialidade,
      cidade: t.cidade,
      estado: t.estado,
      pais: t.pais,
      whatsapp: t.whatsapp,
      instagram: t.instagram,
      website: t.website,
      resumo: t.resumo,
      formado_desde: t.formado_desde,
      status: t.status,
    };
    const { error } = await supabase
      .from("portal_terapeutas")
      .update(payload)
      .eq("id", t.id);
    setSavingId(null);
    if (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Salvo!", description: `${t.nome ?? "Terapeuta"} atualizado.` });
    }
  };

  const deleteOne = async (t: Terapeuta) => {
    if (!window.confirm(`Excluir o cadastro de "${t.nome}"? Esta ação não pode ser desfeita.`)) return;
    const { error } = await supabase.from("portal_terapeutas").delete().eq("id", t.id);
    if (error) {
      toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Excluído", description: `${t.nome ?? "Terapeuta"} removido.` });
      setTerapeutas((list) => list.filter((x) => x.id !== t.id));
    }
  };

  const filtered = terapeutas.filter((t) => {
    if (statusFilter !== "todos" && (t.status ?? "pendente") !== statusFilter) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      t.nome?.toLowerCase().includes(q) ||
      t.email?.toLowerCase().includes(q) ||
      t.cidade?.toLowerCase().includes(q) ||
      t.estado?.toLowerCase().includes(q)
    );
  });

  const counts = {
    todos: terapeutas.length,
    pendente: terapeutas.filter((t) => (t.status ?? "pendente") === "pendente").length,
    aprovado: terapeutas.filter((t) => t.status === "aprovado").length,
    rejeitado: terapeutas.filter((t) => t.status === "rejeitado").length,
  };

  return (
    <>
      <Helmet>
        <title>Admin · Terapeutas | Portal Ayurveda</title>
      </Helmet>
      <AdminNav />

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <header>
          <h1 className="text-2xl font-bold">Terapeutas</h1>
          <p className="text-sm text-muted-foreground">
            {counts.todos} cadastros · {counts.pendente} pendentes · {counts.aprovado} aprovados
          </p>
        </header>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, email, cidade, estado…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="sm:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos ({counts.todos})</SelectItem>
              <SelectItem value="pendente">Pendentes ({counts.pendente})</SelectItem>
              <SelectItem value="aprovado">Aprovados ({counts.aprovado})</SelectItem>
              <SelectItem value="rejeitado">Rejeitados ({counts.rejeitado})</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-16">Nenhum terapeuta encontrado.</p>
        ) : (
          <div className="space-y-4">
            {filtered.map((t) => {
              const imgUrl = t.imagem ?? t["imagem.1"];
              const slug = t["terapeutas(dinamica)"];
              return (
                <article
                  key={t.id}
                  className="border border-border rounded-xl p-4 bg-card space-y-4"
                >
                  {/* Header com foto, nome, status */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted shrink-0 border border-border">
                      {imgUrl ? (
                        <img src={imgUrl} alt={t.nome ?? ""} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl text-muted-foreground">
                          ?
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <h2 className="font-bold text-base truncate">{t.nome ?? "(sem nome)"}</h2>
                          <p className="text-xs text-muted-foreground">{t.email ?? "(sem email)"}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            slug: <code className="bg-muted px-1 rounded">{slug ?? "—"}</code>
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {slug && t.status === "aprovado" && (
                            <Link
                              to={getTherapistProfilePath(slug)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs inline-flex items-center gap-1 text-primary hover:underline"
                            >
                              <ExternalLink className="h-3 w-3" /> ver público
                            </Link>
                          )}
                          <Select
                            value={t.status ?? "pendente"}
                            onValueChange={(v) => updateField(t.id, "status", v)}
                          >
                            <SelectTrigger className="w-32 h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {STATUS_OPTIONS.map((s) => (
                                <SelectItem key={s} value={s} className="text-xs">
                                  {s}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Campos editáveis (foco em nome, email, foto) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <Label className="text-xs">Nome</Label>
                      <Input
                        value={t.nome ?? ""}
                        onChange={(e) => updateField(t.id, "nome", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Email</Label>
                      <Input
                        value={t.email ?? ""}
                        onChange={(e) => updateField(t.id, "email", e.target.value)}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label className="text-xs">URL da foto</Label>
                      <Input
                        value={t.imagem ?? ""}
                        onChange={(e) => updateField(t.id, "imagem", e.target.value)}
                        placeholder="https://…"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Cidade</Label>
                      <Input
                        value={t.cidade ?? ""}
                        onChange={(e) => updateField(t.id, "cidade", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Estado / País</Label>
                      <div className="flex gap-2">
                        <Input
                          value={t.estado ?? ""}
                          onChange={(e) => updateField(t.id, "estado", e.target.value)}
                          placeholder="UF"
                          className="w-20"
                        />
                        <Input
                          value={t.pais ?? ""}
                          onChange={(e) => updateField(t.id, "pais", e.target.value)}
                          placeholder="País"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">WhatsApp</Label>
                      <Input
                        value={t.whatsapp ?? ""}
                        onChange={(e) => updateField(t.id, "whatsapp", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Instagram</Label>
                      <Input
                        value={t.instagram ?? ""}
                        onChange={(e) => updateField(t.id, "instagram", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Website</Label>
                      <Input
                        value={t.website ?? ""}
                        onChange={(e) => updateField(t.id, "website", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Atua desde</Label>
                      <Input
                        type="number"
                        value={t.formado_desde ?? ""}
                        onChange={(e) =>
                          updateField(
                            t.id,
                            "formado_desde",
                            e.target.value ? Number(e.target.value) : null,
                          )
                        }
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label className="text-xs">Especialidades (separadas por vírgula)</Label>
                      <Textarea
                        rows={2}
                        value={t.especialidade ?? ""}
                        onChange={(e) => updateField(t.id, "especialidade", e.target.value)}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label className="text-xs">Resumo</Label>
                      <Textarea
                        rows={4}
                        value={t.resumo ?? ""}
                        onChange={(e) => updateField(t.id, "resumo", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteOne(t)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Excluir
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => saveOne(t)}
                      disabled={savingId === t.id}
                    >
                      {savingId === t.id ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" /> Salvando…
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-1" /> Salvar
                        </>
                      )}
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
};

export default AdminTerapeutas;
