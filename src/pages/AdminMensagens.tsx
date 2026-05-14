import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import AdminNav from "@/components/admin/AdminNav";
import Seo from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface Mensagem {
  id: string;
  user_id: string | null;
  nome: string;
  email: string;
  tipo: string;
  assunto: string;
  mensagem: string;
  status: string;
  resposta_admin: string | null;
  created_at: string;
}

const tipoVariant = (tipo: string): { className: string; label: string } => {
  const t = tipo.toLowerCase();
  if (t.startsWith("bug"))
    return { className: "bg-destructive text-destructive-foreground", label: tipo };
  if (t.startsWith("elogio"))
    return { className: "bg-emerald-500 text-white", label: tipo };
  if (t.startsWith("sugest"))
    return { className: "bg-primary text-primary-foreground", label: tipo };
  return { className: "bg-secondary text-secondary-foreground", label: tipo };
};

const statusVariant = (status: string): { className: string; label: string } => {
  const s = status.toLowerCase();
  if (s === "respondido")
    return { className: "bg-emerald-500 text-white", label: "Respondido" };
  if (s === "lido")
    return { className: "bg-blue-500 text-white", label: "Lido" };
  return { className: "bg-muted text-foreground", label: "Novo" };
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

const AdminMensagens = () => {
  const [items, setItems] = useState<Mensagem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Mensagem | null>(null);
  const [resposta, setResposta] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("mensagens")
      .select("*")
      .order("created_at", { ascending: false });
    setLoading(false);
    if (error) {
      toast.error("Erro ao carregar mensagens");
      return;
    }
    setItems((data ?? []) as Mensagem[]);
  };

  useEffect(() => {
    load();
  }, []);

  const openMessage = async (m: Mensagem) => {
    setSelected(m);
    setResposta(m.resposta_admin ?? "");
    if (m.status === "novo") {
      await supabase.from("mensagens").update({ status: "lido" }).eq("id", m.id);
      setItems((prev) =>
        prev.map((x) => (x.id === m.id ? { ...x, status: "lido" } : x))
      );
      setSelected({ ...m, status: "lido" });
    }
  };

  const marcarLido = async () => {
    if (!selected) return;
    const { error } = await supabase
      .from("mensagens")
      .update({ status: "lido" })
      .eq("id", selected.id);
    if (error) return toast.error("Erro ao atualizar");
    toast.success("Marcada como lida");
    setItems((prev) =>
      prev.map((x) => (x.id === selected.id ? { ...x, status: "lido" } : x))
    );
    setSelected({ ...selected, status: "lido" });
  };

  const salvarResposta = async () => {
    if (!selected) return;
    setSaving(true);
    const { error } = await supabase
      .from("mensagens")
      .update({ resposta_admin: resposta, status: "respondido" })
      .eq("id", selected.id);
    setSaving(false);
    if (error) return toast.error("Erro ao salvar resposta");
    toast.success("Resposta salva");
    setItems((prev) =>
      prev.map((x) =>
        x.id === selected.id
          ? { ...x, resposta_admin: resposta, status: "respondido" }
          : x
      )
    );
    setSelected({ ...selected, resposta_admin: resposta, status: "respondido" });
  };

  const counts = useMemo(() => {
    const c = { novo: 0, lido: 0, respondido: 0 };
    items.forEach((m) => {
      const s = m.status as keyof typeof c;
      if (s in c) c[s]++;
    });
    return c;
  }, [items]);

  return (
    <>
      <Seo title="Mensagens — Admin" description="Caixa de entrada de contatos e sugestões." />
      <AdminNav />
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-heading text-2xl text-foreground">Mensagens</h1>
            <p className="text-sm text-muted-foreground">
              {counts.novo} novas · {counts.lido} lidas · {counts.respondido} respondidas
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={load}>
            Atualizar
          </Button>
        </div>

        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-3">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : items.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              Nenhuma mensagem ainda.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead className="hidden md:table-cell">E-mail</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Assunto</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((m) => {
                  const tv = tipoVariant(m.tipo);
                  const sv = statusVariant(m.status);
                  return (
                    <TableRow
                      key={m.id}
                      className="cursor-pointer"
                      onClick={() => openMessage(m)}
                    >
                      <TableCell className="text-xs whitespace-nowrap">
                        {formatDate(m.created_at)}
                      </TableCell>
                      <TableCell className="text-sm">{m.nome}</TableCell>
                      <TableCell className="text-sm hidden md:table-cell">{m.email}</TableCell>
                      <TableCell>
                        <Badge className={tv.className}>{tv.label}</Badge>
                      </TableCell>
                      <TableCell className="text-sm max-w-[260px] truncate">
                        {m.assunto}
                      </TableCell>
                      <TableCell>
                        <Badge className={sv.className}>{sv.label}</Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{selected.assunto}</DialogTitle>
                <DialogDescription>
                  {selected.nome} · {selected.email} · {formatDate(selected.created_at)}
                </DialogDescription>
              </DialogHeader>

              <div className="flex items-center gap-2">
                <Badge className={tipoVariant(selected.tipo).className}>
                  {selected.tipo}
                </Badge>
                <Badge className={statusVariant(selected.status).className}>
                  {statusVariant(selected.status).label}
                </Badge>
              </div>

              <div className="bg-muted rounded-lg p-4 text-sm whitespace-pre-wrap">
                {selected.mensagem}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Resposta interna (visível só para admin)
                </label>
                <Textarea
                  value={resposta}
                  onChange={(e) => setResposta(e.target.value)}
                  rows={5}
                  placeholder="Anote aqui sua resposta ou observação..."
                />
              </div>

              <div className="flex flex-wrap gap-2 justify-end">
                {selected.status !== "lido" && selected.status !== "respondido" && (
                  <Button variant="outline" onClick={marcarLido}>
                    Marcar como lido
                  </Button>
                )}
                <Button onClick={salvarResposta} disabled={saving}>
                  {saving ? "Salvando..." : "Salvar resposta"}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminMensagens;
