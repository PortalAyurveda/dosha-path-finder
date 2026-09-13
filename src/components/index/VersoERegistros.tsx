import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { akashaSlug } from "@/lib/akashaSlug";

type Verso = {
  livro: string;
  location_label: string;
  verse_no: string;
  verse_sanskrit: string;
  translation_pt: string;
};

type Registro = {
  id: number;
  titulo: string | null;
  tags: string | null;
  data_postagem: string | null;
};

const formatHour = (iso: string | null) => {
  if (!iso) return "--:--";
  try {
    const normalized = iso.includes("T") && !iso.endsWith("Z") && !/[+-]\d{2}:?\d{2}$/.test(iso) ? `${iso}Z` : iso;
    const date = new Date(normalized);
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "America/Sao_Paulo",
    });
  } catch {
    return "--:--";
  }
};

const extractEmojis = (tags: string | null) => {
  if (!tags) return "";
  const emojis = tags.match(/\p{Extended_Pictographic}/gu);
  return emojis ? emojis.slice(0, 4).join("") : "";
};

const VersoERegistros = () => {
  const { data: verso } = useQuery({
    queryKey: ["index-verso-do-dia"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("verse_of_the_day", {});
      if (error) throw error;
      return Array.isArray(data) ? (data[0] as Verso | undefined) ?? null : null;
    },
    staleTime: 60 * 60 * 1000,
  });

  const { data: registros } = useQuery({
    queryKey: ["index-registros-compactos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("registros_akashikos_publicos")
        .select("id, titulo, tags, data_postagem")
        .not("titulo", "is", null)
        .order("data_postagem", { ascending: false })
        .limit(6);
      if (error) throw error;
      return (data ?? []) as Registro[];
    },
    staleTime: 5 * 60 * 1000,
  });

  return (
    <section className="bg-card">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-5 px-4 py-8 sm:px-6 md:grid-cols-[5fr_7fr] md:py-10">
        <article className="flex flex-col rounded-[22px_3px_22px_3px] border border-classics/30 bg-classics-soft p-5">
          <h2 className="font-serif font-bold text-[19px] md:text-[22px] text-primary">Verso do dia</h2>
          {verso && (
            <>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {[verso.livro, verso.location_label, `v. ${verso.verse_no}`].map((label) => (
                  <span key={label} className="rounded-full bg-card px-2 py-1 text-[10px] uppercase font-bold text-classics">
                    {label}
                  </span>
                ))}
              </div>
              <p
                className="mt-4 text-[17px] leading-loose text-primary"
                style={{ fontFamily: "'Noto Serif Devanagari', 'Roboto Serif', serif" }}
              >
                {verso.verse_sanskrit}
              </p>
              <p className="mt-3 text-sm italic text-muted-foreground">{verso.translation_pt}</p>
            </>
          )}
          <Link to="/textos-classicos" className="mt-auto inline-flex items-center gap-1 pt-5 text-xs font-bold text-classics hover:underline">
            Ver os Textos Clássicos <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </article>

        <div>
          <h2 className="font-serif font-bold text-[19px] md:text-[22px] text-primary">Registros Akáshicos</h2>
          <p className="mt-1 text-sm text-muted-foreground">Memória viva das perguntas da comunidade.</p>
          <div className="mt-3 overflow-hidden rounded-[22px_3px_22px_3px] border border-border bg-background">
            <div className="flex items-center justify-between border-b border-border bg-akasha/5 px-4 py-2.5">
              <span className="text-[11px] uppercase font-bold text-akasha">O diário da Akasha</span>
              <span className="text-[10px] text-muted-foreground">1.783 registros</span>
            </div>
            <ul className="divide-y divide-border">
              {(registros ?? []).map((registro) => (
                <li key={registro.id}>
                  <Link
                    to={`/registros-akashikos/${akashaSlug(registro.titulo)}`}
                    className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-muted/40"
                  >
                    <span className="w-[38px] shrink-0 font-mono text-[11px] text-akasha">
                      {formatHour(registro.data_postagem)}
                    </span>
                    <span className="min-w-0 flex-1 font-serif font-bold text-[13.5px] leading-snug text-primary line-clamp-1">
                      {registro.titulo}
                    </span>
                    <span className="shrink-0 text-base" aria-hidden="true">{extractEmojis(registro.tags)}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-4 py-3">
              <Link to="/registros-akashikos" className="text-xs font-semibold text-akasha hover:underline">
                Ver todos os registros
              </Link>
              <Link to="/akasha" className="inline-flex items-center gap-1.5 rounded-full bg-akasha px-3 py-2 text-xs font-bold text-primary-foreground hover:opacity-90">
                <MessageCircle className="h-3.5 w-3.5" /> Perguntar à Akasha
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VersoERegistros;