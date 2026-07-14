import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface Item {
  tipo: "video" | "receita_video" | "artigo" | "receita" | "produto" | string;
  id: string;
  titulo: string;
  rota: string;
  imagem: string | null;
  tags?: string[] | null;
  pontos?: number | null;
}

const SELO: Record<string, string> = {
  video: "Aula",
  receita_video: "Receita",
  artigo: "Artigo",
  receita: "Receita",
  produto: "Da loja",
};

const ORDEM: string[] = ["video", "artigo", "receita", "receita_video", "produto"];

function intercalar(items: Item[]): Item[] {
  const buckets: Record<string, Item[]> = {};
  items.forEach((it) => {
    (buckets[it.tipo] ||= []).push(it);
  });
  const out: Item[] = [];
  let added = true;
  while (added) {
    added = false;
    for (const t of ORDEM) {
      const b = buckets[t];
      if (b && b.length) {
        out.push(b.shift()!);
        added = true;
      }
    }
  }
  // remaining tipos not in ORDEM
  Object.values(buckets).forEach((b) => out.push(...b));
  return out.slice(0, 10);
}

interface Props {
  doshaPrincipal: string | null | undefined;
}

const PraVoceRail = ({ doshaPrincipal }: Props) => {
  const [items, setItems] = useState<Item[] | null>(null);

  useEffect(() => {
    if (!doshaPrincipal) return;
    const first = doshaPrincipal.split("-")[0]?.trim().toLowerCase();
    if (!first || !["vata", "pitta", "kapha"].includes(first)) return;
    let cancelled = false;
    (async () => {
      const { data, error } = await (supabase.rpc as any)("match_conteudo", {
        p_dosha: first,
        p_tags: null,
        p_limite_por_tipo: 3,
      });
      if (cancelled) return;
      if (!error && Array.isArray(data)) {
        setItems(intercalar(data as Item[]));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [doshaPrincipal]);

  if (!items || items.length === 0) return null;

  return (
    <section aria-labelledby="pra-voce-titulo" className="mt-6">
      <div className="mb-4 px-1">
        <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">
          Pra você
        </p>
        <h2
          id="pra-voce-titulo"
          className="font-serif text-xl md:text-2xl text-primary italic leading-snug"
        >
          Pra você, colhido do acervo
        </h2>
      </div>

      <div className="-mx-4 sm:mx-0">
        <div
          className="flex gap-3 md:gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory px-4 sm:px-0 pb-3"
          style={{ scrollbarWidth: "thin" }}
        >
          {items.map((it) => (
            <Link
              key={`${it.tipo}-${it.id}`}
              to={it.rota}
              className="group snap-start shrink-0 w-[160px] sm:w-[180px] md:w-[200px] rounded-2xl overflow-hidden border border-border bg-white hover:shadow-md transition-shadow"
            >
              <div className="aspect-[4/3] bg-muted overflow-hidden">
                {it.imagem ? (
                  <img
                    src={it.imagem}
                    alt={it.titulo}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-muted to-secondary/20" />
                )}
              </div>
              <div className="p-3">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-1">
                  {SELO[it.tipo] ?? it.tipo}
                </p>
                <p className="text-sm text-foreground font-medium leading-snug line-clamp-2">
                  {it.titulo}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PraVoceRail;
