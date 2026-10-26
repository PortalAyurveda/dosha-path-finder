import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import AdminNav from "@/components/admin/AdminNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ArrowDown, ArrowLeft, ArrowUp, CalendarPlus, Eye, Loader2, MoreHorizontal, RefreshCw, Search } from "lucide-react";

interface Item {
  id: string;
  title: string;
  image_url: string | null;
  created_at: string;
  publicar_em: string | null;
  link_do_artigo: string | null;
  summary?: string | null;
}

const COLS = "id, title, image_url, created_at, publicar_em, link_do_artigo";
const DIAS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
const MESES = ["JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO", "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO"];

// publicar_em é uma data pura (AAAA-MM-DD); lida sem fuso pra não escorregar de dia.
const parseDia = (s: string) => {
  const [y, m, d] = s.slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, d);
};
const hojeSP = () => new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());
const somaDia = (iso: string, n: number) => {
  const d = parseDia(iso);
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const ddmm = (iso: string) => { const d = parseDia(iso); return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`; };
const ddmmaaaa = (iso: string) => `${ddmm(iso)}/${parseDia(iso).getFullYear()}`;
const diaSem = (iso: string) => DIAS[parseDia(iso).getDay()];
const ddmmCriado = (ts: string) => {
  const s = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date(ts));
  return ddmm(s);
};
const rotuloRelativo = (iso: string) => {
  const h = hojeSP();
  const d = iso.slice(0, 10);
  if (d === h) return "Hoje";
  if (d === somaDia(h, 1)) return "Amanhã";
  return null;
};
const erro = (e: { message?: string } | null) => toast.error(e?.message || "Algo deu errado");

const Capa = ({ src, className = "w-24" }: { src: string | null; className?: string }) => (
  <div className={`${className} aspect-video shrink-0 rounded-md overflow-hidden bg-muted`}>
    {src && <img src={src} alt="" className="w-full h-full object-cover" loading="lazy" />}
  </div>
);

const AdminAgenda = () => {
  const [fila, setFila] = useState<Item[]>([]);
  const [rascunhos, setRascunhos] = useState<Item[]>([]);
  const [publicados, setPublicados] = useState<Item[]>([]);
  const [totalPublicados, setTotalPublicados] = useState(0);
  const [loading, setLoading] = useState(true);
  const [ocupado, setOcupado] = useState<string | null>(null);
  const [verTodaFila, setVerTodaFila] = useState(false);
  const [verTodosRasc, setVerTodosRasc] = useState(false);
  const [verTodosPub, setVerTodosPub] = useState(false);
  const [porNaAgendaAberto, setPorNaAgendaAberto] = useState(false);
  const [busca, setBusca] = useState("");
  const [vendo, setVendo] = useState<Item | null>(null);
  const [mudandoData, setMudandoData] = useState<Item | null>(null);
  const [novaData, setNovaData] = useState("");

  const carregar = useCallback(async () => {
    const [f, r, p] = await Promise.all([
      supabase.from("portal_conteudo").select(COLS).eq("status", "draft").not("publicar_em", "is", null).order("publicar_em", { ascending: true }).order("created_at", { ascending: true }),
      supabase.from("portal_conteudo").select(COLS).eq("status", "draft").is("publicar_em", null).order("created_at", { ascending: false }),
      supabase.from("portal_conteudo").select(COLS, { count: "exact" }).eq("status", "published").not("publicar_em", "is", null).order("created_at", { ascending: false }).limit(verTodosPub ? 200 : 3),
    ]);
    if (f.error || r.error || p.error) erro(f.error || r.error || p.error);
    setFila((f.data || []) as Item[]);
    setRascunhos((r.data || []) as Item[]);
    setPublicados((p.data || []) as Item[]);
    setTotalPublicados(p.count || 0);
    setLoading(false);
  }, [verTodosPub]);

  useEffect(() => { carregar(); }, [carregar]);

  const rodar = async (chave: string, fn: () => PromiseLike<{ error: { message?: string } | null }>, ok: string) => {
    setOcupado(chave);
    const { error } = await fn();
    if (error) erro(error);
    else toast.success(ok);
    await carregar();
    setOcupado(null);
    return !error;
  };

  const rpc = supabase.rpc as unknown as (n: string, a?: Record<string, unknown>) => PromiseLike<{ error: { message?: string } | null }>;
  const porNaAgenda = (it: Item) => rodar(`por-${it.id}`, () => rpc("admin_agenda_mudar_data", { _id: it.id, _data: null }), "Foi para o fim da fila");
  const trocar = (a: Item, b: Item) => rodar(`troca-${a.id}`, () => rpc("admin_agenda_trocar", { _a: a.id, _b: b.id }), "Datas trocadas");
  const tirar = (it: Item) => { if (window.confirm(`Tirar "${it.title}" da agenda? Ele continua guardado como rascunho.`)) rodar(`tirar-${it.id}`, () => rpc("admin_agenda_tirar", { _id: it.id }), "Saiu da agenda"); };
  const publicarAgora = (it: Item) => { if (window.confirm(`Publicar "${it.title}" agora? Ele já entra na home.`)) rodar(`pub-${it.id}`, () => rpc("admin_agenda_publicar_agora", { _id: it.id }), "Publicado"); };
  const reorganizar = () => { if (window.confirm("Refazer as datas da fila, 1 por dia a partir de amanhã, na ordem atual?")) rodar("reorg", () => rpc("admin_agenda_reorganizar"), "Datas reorganizadas"); };
  const salvarData = async () => {
    if (!mudandoData || !novaData) return;
    const ok = await rodar(`data-${mudandoData.id}`, () => rpc("admin_agenda_mudar_data", { _id: mudandoData.id, _data: novaData }), "Data alterada");
    if (ok) setMudandoData(null);
  };

  const abrirVer = async (it: Item) => {
    setVendo(it);
    const { data, error } = await supabase.from("portal_conteudo").select("summary").eq("id", it.id).maybeSingle();
    if (error) return erro(error);
    setVendo((v) => (v && v.id === it.id ? { ...v, summary: data?.summary ?? "" } : v));
  };

  const primeiro = fila[0];
  const ultimo = fila[fila.length - 1];
  const visiveis = verTodaFila ? fila : fila.slice(0, 9);
  const grupos = useMemo(() => {
    const g: { mes: string; itens: { it: Item; idx: number }[] }[] = [];
    visiveis.forEach((it, idx) => {
      const d = parseDia(it.publicar_em!);
      const mes = `${MESES[d.getMonth()]} ${d.getFullYear()}`;
      if (!g.length || g[g.length - 1].mes !== mes) g.push({ mes, itens: [] });
      g[g.length - 1].itens.push({ it, idx });
    });
    return g;
  }, [visiveis]);

  const proximaTexto = primeiro?.publicar_em
    ? `${rotuloRelativo(primeiro.publicar_em) ? rotuloRelativo(primeiro.publicar_em) + ", " : ""}${diaSem(primeiro.publicar_em)} ${ddmm(primeiro.publicar_em)}, às 5h30`
    : "Fila vazia";
  const rascFiltrados = rascunhos.filter((r) => r.title.toLowerCase().includes(busca.trim().toLowerCase()));

  const botoesLinha = (it: Item, idx: number, mobile: boolean) => {
    const h = mobile ? "h-10" : "h-8";
    return (
      <>
        <Button size="sm" variant="outline" className={h} onClick={() => abrirVer(it)}><Eye className="w-3.5 h-3.5 mr-1" />Ver</Button>
        <Button size="sm" variant="outline" className={h} onClick={() => { setMudandoData(it); setNovaData(it.publicar_em?.slice(0, 10) || ""); }}>Mudar data</Button>
        <Button size="icon" variant="outline" className={`${h} w-${mobile ? "10" : "8"}`} aria-label="Subir" disabled={idx === 0 || !!ocupado} onClick={() => trocar(it, fila[idx - 1])}><ArrowUp className="w-4 h-4" /></Button>
        <Button size="icon" variant="outline" className={`${h} w-${mobile ? "10" : "8"}`} aria-label="Descer" disabled={idx === fila.length - 1 || !!ocupado} onClick={() => trocar(it, fila[idx + 1])}><ArrowDown className="w-4 h-4" /></Button>
        {mobile ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="outline" className="h-10 w-10 ml-auto" aria-label="Mais ações"><MoreHorizontal className="w-4 h-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover">
              <DropdownMenuItem onClick={() => publicarAgora(it)}>Publicar agora</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => tirar(it)}>Tirar da agenda</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <>
            <Button size="sm" className="h-8" disabled={!!ocupado} onClick={() => publicarAgora(it)}>Publicar agora</Button>
            <Button size="sm" variant="ghost" className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10" disabled={!!ocupado} onClick={() => tirar(it)}>Tirar</Button>
          </>
        )}
      </>
    );
  };

  return (
    <>
      <Helmet>
        <title>Admin · Agenda – Portal Ayurveda</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="min-h-screen bg-background">
        <AdminNav />
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
          {/* Cabeçalho */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <Button asChild variant="ghost" size="sm" className="gap-1 hidden sm:inline-flex">
                <Link to="/admin"><ArrowLeft className="w-4 h-4" />Voltar</Link>
              </Button>
              <h1 className="text-2xl font-heading font-bold text-foreground">Agenda</h1>
              <span className="text-sm text-muted-foreground whitespace-nowrap">{fila.length} na fila</span>
            </div>
            <Button size="sm" className="gap-1.5 shrink-0" onClick={() => { setBusca(""); setPorNaAgendaAberto(true); }}>
              <CalendarPlus className="w-4 h-4" />Pôr na agenda
            </Button>
          </div>

          {/* Cartões */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">{[0, 1, 2].map((i) => <Skeleton key={i} className={`h-24 rounded-lg ${i === 0 ? "col-span-2 sm:col-span-1" : ""}`} />)}</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="col-span-2 sm:col-span-1 border border-border rounded-lg p-4 bg-card">
                <p className="text-xs text-muted-foreground">Próxima publicação</p>
                <p className="text-lg font-heading font-bold text-foreground mt-1">{proximaTexto}</p>
                {primeiro && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{primeiro.title}</p>}
              </div>
              <div className="border border-border rounded-lg p-4 bg-card">
                <p className="text-xs text-muted-foreground">Na fila</p>
                <p className="text-lg font-heading font-bold text-foreground mt-1">
                  <span className="hidden sm:inline">{fila.length} artigos, 1 por dia</span>
                  <span className="sm:hidden">{fila.length}, 1 por dia</span>
                </p>
                {ultimo?.publicar_em && (
                  <p className="text-xs text-muted-foreground mt-1">
                    <span className="hidden sm:inline">O último sai em </span><span className="sm:hidden">Até </span>{ddmmaaaa(ultimo.publicar_em)}
                  </p>
                )}
              </div>
              <div className="border border-border rounded-lg p-4 bg-card">
                <p className="text-xs text-muted-foreground">Na home, "Conheça Ayurveda por aqui"</p>
                <p className="text-lg font-heading font-bold text-foreground mt-1">
                  <span className="hidden sm:inline">Vagas 7, 8 e 9 giram às 5h35</span>
                  <span className="sm:hidden">Vagas 7 a 9 giram</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="hidden sm:inline">A 7 é sempre o artigo do dia. As 6 primeiras são as suas.</span>
                  <span className="sm:hidden">Todo dia às 5h35</span>
                </p>
              </div>
            </div>
          )}

          {/* Próximas publicações */}
          <section className="border border-border rounded-lg bg-card p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-lg font-heading font-bold text-foreground">
                <span className="hidden sm:inline">Próximas publicações</span><span className="sm:hidden">Próximas</span>
              </h2>
              <Button size="sm" variant="outline" className="gap-1.5" disabled={!!ocupado || fila.length === 0} onClick={reorganizar}>
                {ocupado === "reorg" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}Reorganizar datas
              </Button>
            </div>
            {loading ? (
              <div className="space-y-2">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-16" />)}</div>
            ) : fila.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">Nenhum artigo na fila.</p>
            ) : (
              <div className="space-y-3">
                {grupos.map((g) => (
                  <div key={g.mes} className="space-y-2">
                    <div className="text-[11px] font-semibold tracking-wider text-muted-foreground bg-muted rounded px-2 py-1">{g.mes}</div>
                    {g.itens.map(({ it, idx }) => {
                      const rel = rotuloRelativo(it.publicar_em!);
                      return (
                        <div key={it.id}>
                          {/* Desktop */}
                          <div className="hidden md:flex items-center gap-3 border-b border-border/60 last:border-0 py-2">
                            <div className="w-12 text-center shrink-0">
                              <div className="text-xs text-muted-foreground">{diaSem(it.publicar_em!)}</div>
                              <div className="text-sm font-semibold text-foreground">{ddmm(it.publicar_em!)}</div>
                            </div>
                            <Capa src={it.image_url} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground line-clamp-2">{it.title}</p>
                              <div className="flex gap-1.5 mt-1">
                                <Badge variant="secondary" className="text-[10px]">Artigo</Badge>
                                {idx === 0 && rel && <Badge className="text-[10px]">{rel}</Badge>}
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">{botoesLinha(it, idx, false)}</div>
                          </div>
                          {/* Celular */}
                          <div className="md:hidden border border-border rounded-lg p-2.5 space-y-2.5">
                            <div className="flex gap-3">
                              <Capa src={it.image_url} className="w-28" />
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-semibold text-foreground">{diaSem(it.publicar_em!)} {ddmm(it.publicar_em!)}</span>
                                  {idx === 0 && rel && <Badge className="text-[10px]">{rel}</Badge>}
                                </div>
                                <p className="text-sm font-medium text-foreground line-clamp-3 mt-0.5">{it.title}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5">{botoesLinha(it, idx, true)}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
                {fila.length > 9 && (
                  <Button variant="outline" className="w-full" onClick={() => setVerTodaFila((v) => !v)}>
                    {verTodaFila ? "Mostrar menos" : `Mostrar os outros ${fila.length - 9} (até ${ddmmaaaa(ultimo.publicar_em!)})`}
                  </Button>
                )}
              </div>
            )}
          </section>

          {/* Rascunhos sem data */}
          <section className="border border-border rounded-lg bg-card p-4 space-y-3">
            <div>
              <h2 className="text-lg font-heading font-bold text-foreground">Rascunhos sem data</h2>
              <p className="text-xs text-muted-foreground">{rascunhos.length} artigos guardados que ainda não estão na fila</p>
            </div>
            <div className="space-y-2">
              {(verTodosRasc ? rascunhos : rascunhos.slice(0, 3)).map((r) => (
                <div key={r.id} className="flex flex-col sm:flex-row sm:items-center gap-2 border border-border rounded-lg p-2.5">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground line-clamp-2">{r.title}</p>
                    <p className="text-xs text-muted-foreground">criado {ddmmCriado(r.created_at)}</p>
                  </div>
                  <div className="flex gap-1.5">
                    <Button size="sm" variant="outline" className="h-10 sm:h-8" onClick={() => abrirVer(r)}><Eye className="w-3.5 h-3.5 mr-1" />Ver</Button>
                    <Button size="sm" className="h-10 sm:h-8" disabled={!!ocupado} onClick={() => porNaAgenda(r)}>
                      {ocupado === `por-${r.id}` && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />}Pôr na agenda
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            {rascunhos.length > 3 && (
              <button className="text-sm text-primary hover:underline" onClick={() => setVerTodosRasc((v) => !v)}>
                {verTodosRasc ? "Mostrar menos" : `Ver os ${rascunhos.length}`}
              </button>
            )}
          </section>

          {/* Publicados */}
          <section className="border border-border rounded-lg bg-card p-4 space-y-3">
            <h2 className="text-lg font-heading font-bold text-foreground">
              <span className="hidden sm:inline">Já publicados pela agenda</span><span className="sm:hidden">Já publicados</span>
            </h2>
            <div className="space-y-2">
              {publicados.map((p) => (
                <div key={p.id} className="flex items-center gap-3">
                  <Capa src={p.image_url} className="w-20" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground line-clamp-2">{p.title}</p>
                    {p.publicar_em && <Badge variant="outline" className="text-[10px] mt-1 border-green-600/40 text-green-700 bg-green-50">Publicado {ddmm(p.publicar_em)}</Badge>}
                  </div>
                  {p.link_do_artigo && (
                    <a href={`/blog/${p.link_do_artigo}`} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline shrink-0">
                      <span className="hidden sm:inline">Abrir no site</span><span className="sm:hidden">Abrir</span>
                    </a>
                  )}
                </div>
              ))}
            </div>
            {totalPublicados > 3 && (
              <button className="text-sm text-primary hover:underline" onClick={() => setVerTodosPub((v) => !v)}>
                {verTodosPub ? "Mostrar menos" : `Ver os ${totalPublicados}`}
              </button>
            )}
          </section>
        </div>
      </div>

      {/* Pôr na agenda */}
      <Dialog open={porNaAgendaAberto} onOpenChange={setPorNaAgendaAberto}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Pôr na agenda</DialogTitle>
            <DialogDescription>O artigo escolhido vai para o fim da fila.</DialogDescription>
          </DialogHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Pesquisar por título…" className="pl-9" />
          </div>
          <div className="max-h-[50vh] overflow-y-auto space-y-2">
            {rascFiltrados.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Nenhum rascunho sem data.</p>}
            {rascFiltrados.map((r) => (
              <div key={r.id} className="flex items-center gap-2 border border-border rounded-lg p-2">
                <p className="text-sm flex-1 min-w-0 line-clamp-2">{r.title}</p>
                <Button size="sm" disabled={!!ocupado} onClick={() => porNaAgenda(r)}>
                  {ocupado === `por-${r.id}` && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />}Pôr na agenda
                </Button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Mudar data */}
      <Dialog open={!!mudandoData} onOpenChange={(o) => !o && setMudandoData(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Mudar data</DialogTitle>
            <DialogDescription className="line-clamp-2">{mudandoData?.title}</DialogDescription>
          </DialogHeader>
          <Input type="date" min={hojeSP()} value={novaData} onChange={(e) => setNovaData(e.target.value)} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setMudandoData(null)}>Cancelar</Button>
            <Button disabled={!novaData || novaData < hojeSP() || !!ocupado} onClick={salvarData}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ver artigo */}
      <Dialog open={!!vendo} onOpenChange={(o) => !o && setVendo(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading text-2xl">{vendo?.title}</DialogTitle>
          </DialogHeader>
          {vendo?.image_url && <img src={vendo.image_url} alt="" className="w-full aspect-video object-cover rounded-lg" />}
          {vendo?.summary === undefined ? (
            <div className="space-y-2"><Skeleton className="h-4" /><Skeleton className="h-4" /><Skeleton className="h-4 w-2/3" /></div>
          ) : (
            <div
              className="prose prose-lg max-w-none text-foreground prose-headings:font-serif prose-headings:text-foreground prose-p:text-muted-foreground prose-p:leading-relaxed prose-li:text-muted-foreground prose-strong:text-foreground prose-a:text-primary prose-a:no-underline hover:prose-a:underline"
              dangerouslySetInnerHTML={{ __html: vendo.summary || "" }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminAgenda;
