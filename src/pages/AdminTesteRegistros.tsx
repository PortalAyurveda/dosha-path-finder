import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Search, Send, Trash2, ShieldCheck, Loader2 } from "lucide-react";
import AdminNav from "@/components/admin/AdminNav";

interface Registro {
  id: string;
  idPublico: string;
  nome: string | null;
  email: string | null;
  created_at: string | null;
}

const WEBHOOK_URL = "https://n8n.portalayurveda.com/webhook/teste-dosha-ayurveda";
const PAGE_SIZE = 50;

const AdminTeste = () => {
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [resending, setResending] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Registro | null>(null);

  const fetchRegistros = async (term: string) => {
    setLoading(true);
    try {
      let query = supabase
        .from("doshas_registros")
        .select("id, idPublico, nome, email, created_at")
        .order("created_at", { ascending: false })
        .limit(PAGE_SIZE);

      const t = term.trim();
      if (t) {
        query = query.or(
          `email.ilike.%${t}%,nome.ilike.%${t}%,idPublico.ilike.%${t}%`,
        );
      }

      const { data, error } = await query;
      if (error) throw error;
      setRegistros((data ?? []) as Registro[]);
    } catch (e: any) {
      console.error("[AdminTeste] fetch error:", e);
      toast.error("Erro ao carregar testes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistros("");
  }, []);

  const handleSearch = () => fetchRegistros(search);

  const handleResend = async (reg: Registro) => {
    setResending(reg.id);
    try {
      // Busca a linha completa para enviar ao webhook
      const { data, error } = await supabase
        .from("doshas_registros")
        .select("*")
        .eq("id", reg.id)
        .maybeSingle();
      if (error) throw error;
      if (!data) {
        toast.error("Registro não encontrado");
        return;
      }

      const payload = {
        email: data.email?.toLowerCase?.() ?? data.email,
        idPublico: data.idPublico,
        title: data.nome,
        nome: data.nome,
        idade: data.idade,
        "conhecimento ayurveda": data.conhecimentoAyurveda || "Iniciante",
        altura: data.altura,
        peso: data.peso,
        imc: data.imc,
        datateste: data.created_at,
        vatascore: data.vatascore,
        pittascore: data.pittascore,
        kaphascore: data.kaphascore,
        doshaprincipal: data.doshaprincipal,
        agniPrincipal: data.agniPrincipal,
        agniirregular: data.agniirregular,
        agniforte: data.agniforte,
        agnifraco: data.agnifraco,
        relato_aberto: data.relato_aberto || "",
        agravVataTags: data.agravVataTags || "",
        agravPittaTags: data.agravPittaTags || "",
        agravKaphaTags: data.agravKaphaTags || "",
        alimVata: data.alimVata || "",
        alimPitta: data.alimPitta || "",
        alimKapha: data.alimKapha || "",
        aliment: data.aliment || "",
        remedios: data.remedios || "",
        mentoria: data.mentoria || "",
        diagn: data.diagn || "",
        espiritual: data.espiritual || "",
        produtos: data.produtos || "",
      };

      // Fire-and-forget, não aguardamos resposta
      fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch(() => {});

      toast.success("Teste reenviado para o webhook");
    } catch (e: any) {
      console.error("[AdminTeste] resend error:", e);
      toast.error("Erro ao reenviar teste");
    } finally {
      setResending(null);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    const reg = confirmDelete;
    setDeleting(reg.id);
    try {
      const { error } = await supabase
        .from("doshas_registros")
        .delete()
        .eq("id", reg.id);
      if (error) throw error;
      setRegistros((prev) => prev.filter((r) => r.id !== reg.id));
      toast.success("Teste deletado");
    } catch (e: any) {
      console.error("[AdminTeste] delete error:", e);
      toast.error("Erro ao deletar teste");
    } finally {
      setDeleting(null);
      setConfirmDelete(null);
    }
  };

  return (
    <>
      <Helmet>
        <title>Admin Testes – Portal Ayurveda</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <AdminNav />
        <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-7 h-7 text-primary" />
            <h1 className="text-2xl font-heading font-bold text-foreground">
              Testes de Dosha
            </h1>
          </div>

          {/* Search */}
          <section className="bg-card border border-border rounded-xl p-5 space-y-3">
            <h2 className="text-sm font-semibold text-foreground">
              Buscar por email, nome ou ID público
            </h2>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="email, nome ou ID público"
                className="flex-1"
              />
              <Button onClick={handleSearch} disabled={loading} className="gap-2">
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                Pesquisar
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Mostrando até {PAGE_SIZE} resultados, mais recentes primeiro.
            </p>
          </section>

          {/* List */}
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          ) : registros.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-8 text-center text-sm text-muted-foreground">
              Nenhum teste encontrado.
            </div>
          ) : (
            <div className="space-y-2">
              {registros.map((reg) => (
                <div
                  key={reg.id}
                  className="bg-card border border-border rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                >
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm min-w-0">
                    <span className="font-semibold text-foreground truncate">
                      {reg.nome || "—"}
                    </span>
                    <span className="text-muted-foreground hidden md:inline">|</span>
                    <span className="text-foreground/80 truncate">
                      {reg.email || "—"}
                    </span>
                    <span className="text-muted-foreground hidden md:inline">|</span>
                    <span className="text-xs text-muted-foreground font-mono">
                      {reg.idPublico}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleResend(reg)}
                      disabled={resending === reg.id}
                      className="gap-2"
                    >
                      {resending === reg.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      Reenviar
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setConfirmDelete(reg)}
                      disabled={deleting === reg.id}
                      className="gap-2"
                    >
                      {deleting === reg.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                      Deletar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AlertDialog
        open={!!confirmDelete}
        onOpenChange={(o) => !o && setConfirmDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar este teste?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação é irreversível. O registro de{" "}
              <strong>{confirmDelete?.nome || confirmDelete?.email || confirmDelete?.idPublico}</strong>{" "}
              será permanentemente removido.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AdminTeste;
