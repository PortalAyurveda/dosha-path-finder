import { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Sparkles, Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const PRIMARY = "#352F54";
const AKASHA = "#9b73ad";
const AKASHA_LOGO =
  "https://static.wixstatic.com/media/b8f47f_105371e1ade24ccd9bd3406b83bd925e~mv2.png";
const LEAF = "24px 4px 24px 4px";

type Registro = {
  id: number;
  titulo: string | null;
  texto_inicio: string | null;
  tags: string | null;
  data_postagem: string | null;
};

type Feed = {
  id: string;
  dosha_nome: string | null;
  frase_akasha: string | null;
  status_visual: string | null;
  created_at: string | null;
};

const formatDateTime = (iso: string | null) => {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
  } catch {
    return "—";
  }
};

const extractEmojis = (tags: string | null) => {
  if (!tags) return "";
  const m = tags.match(/\p{Extended_Pictographic}/gu);
  return m ? m.slice(0, 4).join("") : "";
};

type Tab = "registros" | "feed";

const Metricas = () => {
  const [tab, setTab] = useState<Tab>("registros");
  const [search, setSearch] = useState("");

  const registrosQ = useQuery({
    queryKey: ["metricas_registros", search],
    queryFn: async () => {
      let q = supabase
        .from("akasha_memory")
        .select("id, titulo, texto_inicio, tags, data_postagem")
        .not("titulo", "is", null)
        .order("data_postagem", { ascending: false })
        .limit(80);
      if (search.trim()) {
        q = q.or(`titulo.ilike.%${search}%,texto_inicio.ilike.%${search}%,tags.ilike.%${search}%`);
      }
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as Registro[];
    },
    enabled: tab === "registros",
    staleTime: 60 * 1000,
  });

  const feedQ = useQuery({
    queryKey: ["metricas_feed"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("feed_resultados")
        .select("id, dosha_nome, frase_akasha, status_visual, created_at")
        .order("created_at", { ascending: false })
        .limit(80);
      if (error) throw error;
      return (data ?? []) as Feed[];
    },
    enabled: tab === "feed",
    staleTime: 60 * 1000,
  });

  return (
    <>
      <Helmet>
        <title>Métricas Akáshicas — Portal Ayurveda</title>
        <meta
          name="description"
          content="Compêndio de registros recentes e métricas vivas: pensamentos da Akasha (nossa I.A.) e o feed anônimo de resultados da comunidade."
        />
        <link rel="canonical" href="https://www.portalayurveda.com/metricas" />
      </Helmet>

      <main className="bg-background min-h-screen">
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-10 md:py-14">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Voltar ao início
          </Link>

          <header className="flex flex-col items-center text-center mb-8">
            <img src={AKASHA_LOGO} alt="Akasha IA" className="w-16 h-16 mb-3 object-contain" />
            <h1
              className="font-serif italic font-bold text-3xl md:text-4xl mb-2"
              style={{ color: PRIMARY }}
            >
              Métricas Akáshicas
            </h1>
            <p className="text-muted-foreground max-w-xl text-sm md:text-base">
              Compêndio anônimo da memória viva: pensamentos da Akasha e leituras recentes da
              comunidade.
            </p>
          </header>

          {/* Tabs */}
          <div className="flex justify-center gap-2 mb-6">
            <Button
              variant={tab === "registros" ? "default" : "outline"}
              size="sm"
              onClick={() => setTab("registros")}
              style={tab === "registros" ? { background: AKASHA, borderRadius: LEAF } : { borderRadius: LEAF }}
              className="text-white"
            >
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              Pensamentos de Akasha
            </Button>
            <Button
              variant={tab === "feed" ? "default" : "outline"}
              size="sm"
              onClick={() => setTab("feed")}
              style={tab === "feed" ? { background: PRIMARY, borderRadius: LEAF } : { borderRadius: LEAF }}
              className={tab === "feed" ? "text-white" : ""}
            >
              <Activity className="h-3.5 w-3.5 mr-1.5" />
              Feed de Resultados
            </Button>
          </div>

          {/* TAB: Registros */}
          {tab === "registros" && (
            <>
              <div className="max-w-md mx-auto mb-6">
                <Input
                  type="text"
                  placeholder="Buscar por palavra, tag ou tema…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-10"
                />
              </div>

              {registrosQ.isLoading ? (
                <ul className="space-y-2">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <li key={i} className="h-16 bg-muted/40 rounded-lg animate-pulse" />
                  ))}
                </ul>
              ) : (registrosQ.data ?? []).length === 0 ? (
                <p className="text-center text-muted-foreground py-12">Nenhum registro encontrado.</p>
              ) : (
                <ul className="border border-border bg-card divide-y divide-border" style={{ borderRadius: LEAF }}>
                  {(registrosQ.data ?? []).map((r) => (
                    <li key={r.id}>
                      <Link
                        to={`/registros/${r.id}`}
                        className="px-5 py-4 flex items-start gap-4 transition-colors hover:bg-muted/40 group"
                      >
                        <span
                          className="font-mono text-[11px] font-bold tabular-nums pt-1 w-20 shrink-0"
                          style={{ color: AKASHA }}
                        >
                          {formatDateTime(r.data_postagem)}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p
                            className="font-serif font-bold text-[15px] leading-snug line-clamp-1 group-hover:underline"
                            style={{ color: PRIMARY }}
                          >
                            {r.titulo}
                          </p>
                          {r.texto_inicio && (
                            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                              {r.texto_inicio.slice(0, 130)}…
                            </p>
                          )}
                        </div>
                        <span className="text-base shrink-0 pt-0.5" aria-hidden="true">
                          {extractEmojis(r.tags)}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}

          {/* TAB: Feed */}
          {tab === "feed" && (
            <>
              {feedQ.isLoading ? (
                <ul className="space-y-2">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <li key={i} className="h-16 bg-muted/40 rounded-lg animate-pulse" />
                  ))}
                </ul>
              ) : (feedQ.data ?? []).length === 0 ? (
                <p className="text-center text-muted-foreground py-12">Sem registros no feed.</p>
              ) : (
                <ul
                  className="border border-border bg-card divide-y divide-border"
                  style={{ borderRadius: LEAF }}
                >
                  {(feedQ.data ?? []).map((f) => (
                    <li key={f.id} className="px-5 py-4 flex items-start gap-4">
                      <span
                        className="font-mono text-[11px] font-bold tabular-nums pt-1 w-20 shrink-0 text-muted-foreground"
                      >
                        {formatDateTime(f.created_at)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          {f.dosha_nome && (
                            <span
                              className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
                              style={{ background: `${PRIMARY}12`, color: PRIMARY }}
                            >
                              {f.dosha_nome}
                            </span>
                          )}
                          {f.status_visual && (
                            <span
                              className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded"
                              style={{ background: `${AKASHA}18`, color: AKASHA }}
                            >
                              {f.status_visual}
                            </span>
                          )}
                        </div>
                        {f.frase_akasha && (
                          <p
                            className="font-serif italic text-[14px] leading-snug"
                            style={{ color: PRIMARY }}
                          >
                            "{f.frase_akasha}"
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <p className="text-center text-[11px] text-muted-foreground mt-4 italic">
                Resultados anônimos. Nomes da comunidade não são exibidos.
              </p>
            </>
          )}
        </section>
      </main>
    </>
  );
};

export default Metricas;
