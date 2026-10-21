import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, Loader2 } from "lucide-react";
import Seo from "@/components/Seo";
import BannerSlot from "@/components/banners/BannerSlot";
import VersoCard, { type Verso } from "@/components/textos/VersoCard";
import { supabase } from "@/integrations/supabase/client";

type Modulo = { order_index: number; title: string; description: string | null };
type ItemRoteiro = Verso & { module_order: number | null; item_order: number | null };

export default function ClassicosRoteiro() {
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [itens, setItens] = useState<ItemRoteiro[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [aberto, setAberto] = useState<number | null>(null);

  useEffect(() => {
    let vivo = true;
    (async () => {
      const [mods, versos] = await Promise.all([
        supabase.from("study_modules").select("order_index, title, description").eq("collection_id", 1).order("order_index"),
        supabase.from("study_program_export").select("module_order, item_order, livro, sthana, chapter_no, chapter_name, verse_no, verse_sanskrit, translation_pt"),
      ]);
      if (!vivo) return;
      setModulos((mods.data as Modulo[] | null) ?? []);
      setItens(
        (((versos.data as any[] | null) ?? []).map((r) => ({
          module_order: r.module_order,
          item_order: r.item_order,
          livro: r.livro,
          location_label: [r.sthana, r.chapter_no ? `cap. ${r.chapter_no}` : null, r.chapter_name].filter(Boolean).join(" · "),
          verse_no: r.verse_no,
          verse_sanskrit: r.verse_sanskrit,
          translation_pt: r.translation_pt,
        })) as ItemRoteiro[]).sort((a, b) => (a.item_order ?? 0) - (b.item_order ?? 0)),
      );
      setCarregando(false);
    })();
    return () => { vivo = false; };
  }, []);

  const porModulo = useMemo(() => {
    const mapa = new Map<number, ItemRoteiro[]>();
    for (const item of itens) {
      const chave = item.module_order ?? -1;
      mapa.set(chave, [...(mapa.get(chave) ?? []), item]);
    }
    return mapa;
  }, [itens]);

  return (
    <>
      <Seo title="Roteiro de estudo dos textos clássicos" description="O caminho guiado pelos clássicos de Ayurveda, módulo a módulo, com os versos de cada etapa." />
      <div className="bg-classics-soft">
        <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-10">
          <Link to="/textos-classicos" className="text-base text-classics hover:underline">Textos Clássicos</Link>
          <h1 className="mt-2">Roteiro de estudo</h1>
        </div>
      </div>

      <main className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {carregando ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-classics" /></div>
        ) : (
          <div className="space-y-3">
            {modulos.map((mod) => {
              const versos = porModulo.get(mod.order_index) ?? [];
              const expandido = aberto === mod.order_index;
              return (
                <div key={mod.order_index} className="overflow-hidden rounded-2xl border border-border bg-card">
                  <button type="button" onClick={() => setAberto(expandido ? null : mod.order_index)} aria-expanded={expandido}
                    className="flex min-h-[64px] w-full items-center gap-3 p-4 text-left">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-classics-soft text-base font-bold text-classics">
                      {mod.order_index}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-serif text-lg font-bold text-primary">{mod.title}</span>
                      {mod.description && <span className="mt-0.5 block text-base text-muted-foreground">{mod.description}</span>}
                    </span>
                    <span className="shrink-0 text-base text-muted-foreground">
                      {versos.length > 0 ? `${versos.length} versos` : "em curadoria"}
                    </span>
                    <ChevronDown className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform ${expandido ? "rotate-180" : ""}`} />
                  </button>
                  {expandido && (
                    <div className="space-y-3 border-t border-border bg-muted/20 p-4">
                      {versos.length > 0 ? versos.map((v, i) => <VersoCard key={i} verso={v} />)
                        : <p className="text-base text-muted-foreground">Este módulo ainda está em curadoria.</p>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        <BannerSlot slot="classicos_rodape" className="my-8 [&:empty]:hidden" />
      </main>
    </>
  );
}
