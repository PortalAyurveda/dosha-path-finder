import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, List, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { akashaSlug } from "@/lib/akashaSlug";

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

const formatFull = (iso: string | null) => {
  if (!iso) return "—";
  try {
    // DB column stores UTC without tz suffix — append Z so JS parses as UTC
    const normalized = iso.includes("T") && !iso.endsWith("Z") && !/[+-]\d{2}:?\d{2}$/.test(iso) ? iso + "Z" : iso;
    const d = new Date(normalized);
    return d.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "America/Sao_Paulo",
    });
  } catch {
    return "—";
  }
};

const splitTags = (tags: string | null) => {
  if (!tags) return [];
  return tags
    .split(/[,\n]/)
    .map((t) => t.trim())
    .filter(Boolean);
};

const RegistroAkashico = () => {
  const { id, slug } = useParams<{ id?: string; slug?: string }>();

  const { data, isLoading, error } = useQuery({
    queryKey: ["registro_akashico", id ?? slug],
    queryFn: async () => {
      // Lookup by numeric id (legacy /registros/:id)
      if (id && !slug) {
        const { data, error } = await supabase
          .from("akasha_memory")
          .select("id, titulo, texto_inicio, tags, data_postagem")
          .eq("id", Number(id))
          .maybeSingle();
        if (error) throw error;
        return data as Registro | null;
      }
      // Lookup by slug — server-side accent-insensitive match via RPC
      const { data, error } = await (supabase as any).rpc("find_akasha_by_slug", { _slug: slug });
      if (error) throw error;
      const row = Array.isArray(data) ? data[0] : data;
      return (row ?? null) as Registro | null;
    },
    enabled: !!(id || slug),
  });

  return (
    <>
      <Helmet>
        <title>{data?.titulo ? `${data.titulo} — Registro Akáshico` : "Registro Akáshico"}</title>
        <meta name="description" content={data?.texto_inicio?.slice(0, 155) ?? "Registro de um pensamento da Akasha, nossa I.A. Ayurveda."} />
      </Helmet>

      <main className="bg-background min-h-screen">
        <article className="max-w-3xl mx-auto px-4 sm:px-6 py-10 md:py-14">
          <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
            <Link
              to="/registros-akashikos"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Voltar
            </Link>
            <Link
              to="/registros-akashikos"
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors hover:bg-muted/40"
              style={{ color: AKASHA, borderColor: `${AKASHA}40` }}
            >
              <List className="h-3.5 w-3.5" /> Ler o diário da Akasha — ver lista completa
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              <div className="h-8 bg-muted/40 rounded w-3/4 animate-pulse" />
              <div className="h-4 bg-muted/40 rounded w-1/3 animate-pulse" />
              <div className="space-y-2 mt-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-3 bg-muted/40 rounded animate-pulse" />
                ))}
              </div>
            </div>
          ) : error || !data ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground">Registro não encontrado.</p>
              <Link
                to="/registros-akashikos"
                className="inline-flex items-center gap-1 text-sm font-semibold mt-4"
                style={{ color: AKASHA }}
              >
                Ver todos os registros <ArrowLeft className="h-3.5 w-3.5 rotate-180" />
              </Link>
            </div>
          ) : (
            <>
              <header className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <img src={AKASHA_LOGO} alt="" className="w-10 h-10 object-contain" />
                  <span
                    className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full inline-flex items-center gap-1"
                    style={{ background: `${AKASHA}18`, color: AKASHA }}
                  >
                    <Sparkles className="h-3 w-3" /> Registro Akáshico
                  </span>
                </div>
                <h1
                  className="font-serif italic font-bold text-2xl md:text-3xl leading-tight mb-3"
                  style={{ color: PRIMARY }}
                >
                  {data.titulo}
                </h1>

                {splitTags(data.tags).length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {splitTags(data.tags).map((t, i) => (
                      <span
                        key={i}
                        className="text-base md:text-lg font-medium px-3 py-1 rounded-full border border-border bg-card inline-flex items-center gap-1.5"
                        style={{ color: AKASHA }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                <p className="text-sm text-muted-foreground">{formatFull(data.data_postagem)}</p>
              </header>

              {data.texto_inicio && (
                <div
                  className="bg-card border border-border p-6 md:p-8 mb-6"
                  style={{ borderRadius: LEAF }}
                >
                  <p
                    className="font-serif text-[17px] md:text-[19px] leading-relaxed whitespace-pre-line"
                    style={{ color: PRIMARY }}
                  >
                    {data.texto_inicio}
                  </p>
                </div>
              )}

              <div className="mt-10 text-center text-xs italic text-muted-foreground">
                Pergunta original anônima. A Akasha guarda apenas o essencial em forma de
                reflexão.
              </div>
            </>
          )}
        </article>
      </main>
    </>
  );
};

export default RegistroAkashico;
