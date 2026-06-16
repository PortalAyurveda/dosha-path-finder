import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminNav from "@/components/admin/AdminNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

type Sessao = {
  id: string;
  user_email: string;
  created_at: string;
  updated_at: string;
  dosha_registro_origem_id: string | null;
  resultado: any;
};

type Teste = {
  id: string;
  nome: string | null;
  created_at: string;
  agniPrincipal: string | null;
};

const fmt = (d?: string | null) => {
  if (!d) return "—";
  const dt = new Date(d);
  return dt.toLocaleDateString("pt-BR") + " " + dt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
};

const Arrow = ({ a, b }: { a: any; b: any }) => (
  <span className="whitespace-nowrap text-sm">
    <span className="text-muted-foreground">{a ?? "—"}</span>
    <span className="mx-1">→</span>
    <span className="font-medium">{b ?? "—"}</span>
  </span>
);

export default function AdminRevisoes() {
  const qc = useQueryClient();
  const [busca, setBusca] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-revisoes"],
    queryFn: async () => {
      const { data: sess, error } = await supabase
        .from("reteste_sessao" as any)
        .select("id, user_email, created_at, updated_at, dosha_registro_origem_id, resultado")
        .eq("status", "concluido")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      const sessoes = (sess ?? []) as unknown as Sessao[];

      const ids = Array.from(
        new Set(sessoes.map((s) => s.dosha_registro_origem_id).filter(Boolean) as string[])
      );

      let testes: Record<string, Teste> = {};
      if (ids.length) {
        const { data: t } = await supabase
          .from("doshas_registros")
          .select('id, nome, created_at, "agniPrincipal"')
          .in("id", ids);
        for (const row of (t ?? []) as any[]) {
          testes[row.id] = row as Teste;
        }
      }
      return { sessoes, testes };
    },
  });

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = busca.trim().toLowerCase();
    if (!q) return data.sessoes;
    return data.sessoes.filter(
      (s) =>
        s.user_email?.toLowerCase().includes(q) ||
        (s.dosha_registro_origem_id && data.testes[s.dosha_registro_origem_id]?.nome?.toLowerCase().includes(q))
    );
  }, [data, busca]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const { error: e1 } = await supabase
        .from("reteste_chat_history" as any)
        .delete()
        .eq("sessao_id", id);
      if (e1) throw e1;
      const { error: e2 } = await supabase.from("reteste_sessao" as any).delete().eq("id", id);
      if (e2) throw e2;
      toast.success("Revisão excluída");
      qc.invalidateQueries({ queryKey: ["admin-revisoes"] });
    } catch (err: any) {
      toast.error("Erro ao excluir", { description: err?.message });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminNav />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Card>
          <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <CardTitle>Revisões</CardTitle>
            <Input
              placeholder="Buscar por email ou nome..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="md:max-w-xs"
            />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin mr-2" /> Carregando...
              </div>
            ) : filtered.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">Nenhuma revisão encontrada.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Data do teste</TableHead>
                      <TableHead>Data da revisão</TableHead>
                      <TableHead>Vata</TableHead>
                      <TableHead>Pitta</TableHead>
                      <TableHead>Kapha</TableHead>
                      <TableHead>Agni</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((s) => {
                      const teste = s.dosha_registro_origem_id ? data!.testes[s.dosha_registro_origem_id] : undefined;
                      const r = s.resultado ?? {};
                      const dataRev = r.data_revisao || s.updated_at;
                      return (
                        <TableRow key={s.id}>
                          <TableCell>
                            <div className="font-medium">{teste?.nome || "—"}</div>
                            <div className="text-xs text-muted-foreground">{s.user_email}</div>
                          </TableCell>
                          <TableCell className="text-sm">{fmt(teste?.created_at)}</TableCell>
                          <TableCell className="text-sm">{fmt(dataRev)}</TableCell>
                          <TableCell><Arrow a={r.vatascore_antes} b={r.vatascore_depois} /></TableCell>
                          <TableCell><Arrow a={r.pittascore_antes} b={r.pittascore_depois} /></TableCell>
                          <TableCell><Arrow a={r.kaphascore_antes} b={r.kaphascore_depois} /></TableCell>
                          <TableCell>
                            <Arrow a={teste?.agniPrincipal} b={r.agniNovo} />
                          </TableCell>
                          <TableCell className="text-right">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  disabled={deletingId === s.id}
                                  className="text-destructive hover:text-destructive"
                                >
                                  {deletingId === s.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="w-4 h-4" />
                                  )}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Excluir esta revisão?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    A sessão e todo o histórico de chat associado serão removidos permanentemente.
                                    Esta ação não pode ser desfeita.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(s.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Excluir
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
