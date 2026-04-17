import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const PRIMARY = "#352F54";
const AKASHA = "#9b73ad";
const AKASHA_LOGO =
  "https://static.wixstatic.com/media/b8f47f_105371e1ade24ccd9bd3406b83bd925e~mv2.png";
const LEAF = "24px 4px 24px 4px";

type Row = {
  id: number;
  titulo: string | null;
  texto_inicio: string | null;
  tags: string | null;
  data_postagem: string | null;
};

const formatHour = (iso: string | null) => {
  if (!iso) return "--:--";
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "--:--";
  }
};

// Extract just the emojis from tag string for display chip (right side)
const extractEmojis = (tags: string | null) => {
  if (!tags) return "";
  // Match emoji-like chars (rough)
  const emojis = tags.match(/\p{Extended_Pictographic}/gu);
  return emojis ? emojis.slice(0, 4).join("") : "";
};

const RegistrosAkashikos = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["index_registros_akashikos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("akasha_memory")
        .select("id, titulo, texto_inicio, tags, data_postagem")
        .not("titulo", "is", null)
        .order("data_postagem", { ascending: false })
        .limit(6);
      if (error) throw error;
      return (data ?? []) as Row[];
    },
    staleTime: 5 * 60 * 1000,
  });

  return (
    <section className="bg-card">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-20 grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: copy */}
        <div className="lg:col-span-5">
          <h2
            className="font-serif italic font-bold text-3xl md:text-4xl mb-4 leading-tight flex items-start gap-3 flex-wrap"
            style={{ color: PRIMARY }}
          >
            <img
              src={AKASHA_LOGO}
              alt="Akasha IA"
              width={48}
              height={48}
              className="w-12 h-12 md:w-14 md:h-14 object-contain shrink-0 mt-1"
              loading="lazy"
            />
            <span>
              Registros de Akasha,
              <br />
              <span style={{ color: AKASHA }}>nossa I.A.</span>
            </span>
          </h2>
          <p className="text-muted-foreground text-base mb-4 leading-relaxed">
            Memória viva das perguntas da comunidade. Cada linha é um momento real de busca por
            equilíbrio — anônimo, poético, verdadeiro.
          </p>
          <p className="text-muted-foreground text-sm leading-relaxed">
            A Akasha aprende com cada conversa e guarda o essencial em forma de título e reflexão.
            <span className="block mt-2 text-xs italic" style={{ color: AKASHA }}>
              Disponível após fazer o teste de dosha.
            </span>
          </p>
        </div>

        {/* Right: feed */}
        <div className="lg:col-span-7">
          <div
            className="border border-border bg-background overflow-hidden"
            style={{ borderRadius: LEAF }}
          >
            <div
              className="px-5 py-3 border-b border-border"
              style={{ background: `${AKASHA}08` }}
            >
              <p className="font-sans text-xs font-bold uppercase tracking-wider" style={{ color: AKASHA }}>
                Registros Akashikos
              </p>
            </div>

            <ul className="divide-y divide-border">
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <li key={i} className="px-5 py-3 flex items-start gap-4 animate-pulse">
                      <div className="w-12 h-4 bg-muted rounded" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-4/5" />
                        <div className="h-3 bg-muted rounded w-3/5" />
                      </div>
                      <div className="w-12 h-5 bg-muted rounded" />
                    </li>
                  ))
              : (data ?? []).map((r) => (
                    <li key={r.id}>
                      <Link
                        to={`/registros/${r.id}`}
                        className="px-5 py-2.5 flex items-center gap-4 transition-colors hover:bg-muted/40 group"
                      >
                        <span
                          className="font-mono text-xs font-bold tabular-nums w-12 shrink-0"
                          style={{ color: AKASHA }}
                        >
                          {formatHour(r.data_postagem)}
                        </span>
                        <p
                          className="flex-1 min-w-0 font-serif font-bold text-[14px] leading-snug line-clamp-1 group-hover:underline"
                          style={{ color: PRIMARY }}
                        >
                          {r.titulo}
                        </p>
                        <span className="text-base shrink-0" aria-hidden="true">
                          {extractEmojis(r.tags)}
                        </span>
                      </Link>
                    </li>
                  ))}
            </ul>

            <div className="px-5 py-3 border-t border-border text-right">
              <Link
                to="/metricas"
                className="inline-flex items-center gap-1 text-xs font-semibold transition-colors hover:opacity-80"
                style={{ color: AKASHA }}
              >
                Ver todos os registros <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RegistrosAkashikos;
