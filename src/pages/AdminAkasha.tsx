import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Search, X, MessageCircle, Loader2, ShieldCheck } from "lucide-react";
import AdminNav from "@/components/admin/AdminNav";

interface Conversa {
  email: string;
  nome: string | null;
  total_msgs: number;
  ultima_pergunta: string | null;
  ultima_resposta: string | null;
  ultima_data: string;
  total_geral: number;
}

interface Mensagem {
  msg_id: number;
  tipo: string;
  conteudo: string;
  data_hora: string;
}

const PAGE_SIZE = 20;

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

const fmtDay = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });

const fmtHour = (iso: string) =>
  new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

const AdminAkasha = () => {
  const [busca, setBusca] = useState("");
  const [buscaAtiva, setBuscaAtiva] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [conversas, setConversas] = useState<Conversa[]>([]);
  const [total, setTotal] = useState(0);

  const [openEmail, setOpenEmail] = useState<string | null>(null);
  const [openNome, setOpenNome] = useState<string | null>(null);
  const [historico, setHistorico] = useState<Mensagem[]>([]);
  const [loadingHist, setLoadingHist] = useState(false);

  const load = async () => {
    setLoading(true);
    console.log("[AdminAkasha] rpc admin_akasha_conversas", { p_busca: buscaAtiva, p_offset: page * PAGE_SIZE });
    const { data, error } = await supabase.rpc("admin_akasha_conversas", {
      p_busca: buscaAtiva,
      p_limit: PAGE_SIZE,
      p_offset: page * PAGE_SIZE,
    });
    console.log("[AdminAkasha] rpc result", { data, error });
    if (!error && data) {
      setConversas(data as Conversa[]);
      setTotal((data[0] as any)?.total_geral ?? 0);
    } else {
      setConversas([]);
      setTotal(0);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buscaAtiva, page]);

  const loadHistorico = async (email: string) => {
    setLoadingHist(true);
    const { data } = await supabase.rpc("admin_akasha_historico", { p_email: email });
    setHistorico((data as Mensagem[]) ?? []);
    setLoadingHist(false);
    setTimeout(() => {
      const el = document.getElementById("hist-scroll");
      if (el) el.scrollTop = el.scrollHeight;
    }, 50);
  };

  const openConversa = (c: Conversa) => {
    setOpenEmail(c.email);
    setOpenNome(c.nome || c.email);
    setHistorico([]);
    loadHistorico(c.email);
  };

  const handleBusca = () => {
    setPage(0);
    setBuscaAtiva(busca.trim() || null);
  };

  const limpar = () => {
    setBusca("");
    setBuscaAtiva(null);
    setPage(0);
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const inicio = total === 0 ? 0 : page * PAGE_SIZE + 1;
  const fim = Math.min((page + 1) * PAGE_SIZE, total);

  // Agrupar mensagens por dia
  const grupos: { dia: string; msgs: Mensagem[] }[] = [];
  historico.forEach((m) => {
    const dia = new Date(m.data_hora).toDateString();
    const last = grupos[grupos.length - 1];
    if (last && last.dia === dia) last.msgs.push(m);
    else grupos.push({ dia, msgs: [m] });
  });

  return (
    <>
      <Helmet>
        <title>Akasha — Auditoria de Conversas</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <AdminNav />
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-7 h-7 text-primary" />
            <h1 className="text-2xl font-heading font-bold text-foreground">
              Akasha — Auditoria de Conversas
            </h1>
          </div>

          {/* Busca */}
          <section className="bg-card border border-border rounded-xl p-4 flex flex-col sm:flex-row gap-2">
            <Input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleBusca()}
              placeholder="Buscar por email…"
              className="flex-1"
            />
            <Button onClick={handleBusca} className="gap-2">
              <Search className="w-4 h-4" /> Buscar
            </Button>
            {buscaAtiva && (
              <Button onClick={limpar} variant="outline" className="gap-2">
                <X className="w-4 h-4" /> Limpar
              </Button>
            )}
          </section>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-48 rounded-xl" />
              ))}
            </div>
          ) : conversas.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              Nenhuma conversa encontrada.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {conversas.map((c) => {
                  const isVisitante = c.email.toLowerCase().endsWith("@visitante.com");
                  const label = c.nome || c.email;
                  return (
                    <button
                      key={c.email}
                      onClick={() => openConversa(c)}
                      className="text-left bg-card border border-border rounded-xl p-4 space-y-3 hover:border-primary/50 hover:shadow-sm transition"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground truncate">{label}</p>
                          {c.nome && (
                            <p className="text-xs text-muted-foreground truncate">{c.email}</p>
                          )}
                        </div>
                        {isVisitante && (
                          <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                            visitante
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <MessageCircle className="w-3.5 h-3.5" />
                          {c.total_msgs}
                        </span>
                        <span>{fmtDate(c.ultima_data)}</span>
                      </div>

                      {c.ultima_pergunta && (
                        <p className="text-sm text-foreground line-clamp-2">
                          <span className="mr-1">👤</span>
                          {c.ultima_pergunta}
                        </p>
                      )}
                      {c.ultima_resposta && (
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          <span className="mr-1">🌸</span>
                          {c.ultima_resposta}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Paginação */}
              <div className="flex items-center justify-between pt-2">
                <p className="text-xs text-muted-foreground">
                  {inicio}–{fim} de {total}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 0}
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page + 1 >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Sheet conversa */}
      <Sheet open={!!openEmail} onOpenChange={(v) => !v && setOpenEmail(null)}>
        <SheetContent side="right" className="w-full sm:max-w-2xl flex flex-col p-0">
          <SheetHeader className="p-5 border-b border-border">
            <SheetTitle className="text-left">
              {openNome}
              {openNome !== openEmail && (
                <span className="block text-xs text-muted-foreground font-normal mt-0.5">
                  {openEmail}
                </span>
              )}
            </SheetTitle>
          </SheetHeader>

          <div
            id="hist-scroll"
            className="flex-1 overflow-y-auto p-5 space-y-6 bg-muted/20"
          >
            {loadingHist ? (
              <div className="flex items-center justify-center py-16 text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            ) : historico.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-16">
                Nenhuma mensagem.
              </p>
            ) : (
              grupos.map((g) => (
                <div key={g.dia} className="space-y-3">
                  <div className="sticky top-0 z-10 flex justify-center">
                    <span className="text-[10px] uppercase tracking-wider font-semibold bg-background border border-border rounded-full px-3 py-1 text-muted-foreground">
                      {fmtDay(g.msgs[0].data_hora)}
                    </span>
                  </div>
                  {g.msgs.map((m) => {
                    const isUser = m.tipo === "human";
                    return (
                      <div
                        key={m.msg_id}
                        className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                      >
                        <div className={`max-w-[85%] space-y-1 ${isUser ? "items-end" : "items-start"} flex flex-col`}>
                          <div
                            className={`rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap break-words ${
                              isUser
                                ? "bg-primary/10 text-foreground rounded-br-sm"
                                : "bg-card border border-border text-foreground rounded-bl-sm"
                            }`}
                          >
                            {m.conteudo}
                          </div>
                          <span className="text-[10px] text-muted-foreground px-1">
                            {fmtHour(m.data_hora)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default AdminAkasha;
