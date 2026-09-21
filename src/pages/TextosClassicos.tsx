import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { ChevronDown, Loader2, Search, Shuffle } from "lucide-react";
import Seo from "@/components/Seo";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AbaMelhoresVersos from "@/components/textos/AbaMelhoresVersos";
import { supabase } from "@/integrations/supabase/client";

type Verso = {
  livro: string | null;
  location_label: string | null;
  verse_no: string | null;
  verse_sanskrit: string | null;
  translation_pt: string | null;
};

const ABAS = [
  { id: "verso", sanskrit: "श्लोकः", label: "Verso do Dia" },
  { id: "roteiro", sanskrit: "अध्ययन", label: "Roteiro de Estudo" },
  { id: "pesquisar", sanskrit: "अन्वेषण", label: "Pesquisar" },
  { id: "melhores", sanskrit: "सुभाषित", label: "Melhores Versos" },
] as const;

type AbaId = (typeof ABAS)[number]["id"];

function VersoCard({ verso }: { verso: Verso }) {
  return (
    <article className="rounded-2xl border border-classics/20 bg-card p-5 md:p-6">
      <div className="flex flex-wrap items-center gap-2">
        {verso.livro && (
          <span className="rounded-full border border-classics/40 bg-classics-soft px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-classics">
            {verso.livro}
          </span>
        )}
        {verso.location_label && (
          <span className="rounded-full bg-muted px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {verso.location_label}
          </span>
        )}
        {verso.verse_no && (
          <span className="rounded-full bg-muted px-3 py-1 text-[11px] font-semibold text-muted-foreground">
            v. {verso.verse_no}
          </span>
        )}
      </div>

      {verso.verse_sanskrit && (
        <p
          lang="sa"
          className="mt-4 text-lg md:text-xl leading-relaxed text-primary"
          style={{ fontFamily: "'Noto Serif Devanagari', 'Roboto Serif', serif" }}
        >
          {verso.verse_sanskrit}
        </p>
      )}

      {verso.translation_pt && (
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">{verso.translation_pt}</p>
      )}
    </article>
  );
}

/* ---------------- Verso do dia ---------------- */

function AbaVersoDoDia() {
  const [verso, setVerso] = useState<Verso | null>(null);
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async (aleatorio: boolean) => {
    setCarregando(true);
    const { data } = await supabase.rpc(
      aleatorio ? "random_curated_verse" : "verse_of_the_day",
      {} as never,
    );
    const linha = Array.isArray(data) ? (data[0] as Verso | undefined) : undefined;
    setVerso(linha ?? null);
    setCarregando(false);
  }, []);

  useEffect(() => {
    void carregar(false);
  }, [carregar]);

  return (
    <section className="mx-auto max-w-2xl text-center">
      <h2 className="mb-5 text-left md:text-center">Verso do dia</h2>

      {carregando ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-classics" />
        </div>
      ) : verso ? (
        <div className="text-left">
          <VersoCard verso={verso} />
        </div>
      ) : (
        <p className="rounded-2xl border border-dashed border-border bg-muted/30 p-8 text-sm text-muted-foreground">
          Nenhum verso em destaque ainda.
        </p>
      )}

      <Button
        onClick={() => void carregar(true)}
        disabled={carregando}
        className="mt-6 bg-classics text-white hover:bg-classics/90"
      >
        <Shuffle className="mr-2 h-4 w-4" />
        Sortear outro verso
      </Button>
    </section>
  );
}

/* ---------------- Roteiro de estudo ---------------- */

type Modulo = { order_index: number; title: string; description: string | null };
type ItemRoteiro = Verso & { module_order: number | null; item_order: number | null };

function AbaRoteiro() {
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [itens, setItens] = useState<ItemRoteiro[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [aberto, setAberto] = useState<number | null>(null);

  useEffect(() => {
    let vivo = true;
    (async () => {
      const [mods, versos] = await Promise.all([
        supabase
          .from("study_modules")
          .select("order_index, title, description")
          .eq("collection_id", 1)
          .order("order_index"),
        supabase
          .from("study_program_export")
          .select(
            "module_order, item_order, livro, sthana, chapter_no, chapter_name, verse_no, verse_sanskrit, translation_pt",
          ),
      ]);
      if (!vivo) return;
      setModulos((mods.data as Modulo[] | null) ?? []);
      setItens(
        (((versos.data as any[] | null) ?? []).map((r) => ({
          module_order: r.module_order,
          item_order: r.item_order,
          livro: r.livro,
          location_label: [r.sthana, r.chapter_no ? `cap. ${r.chapter_no}` : null, r.chapter_name]
            .filter(Boolean)
            .join(" · "),
          verse_no: r.verse_no,
          verse_sanskrit: r.verse_sanskrit,
          translation_pt: r.translation_pt,
        })) as ItemRoteiro[]).sort((a, b) => (a.item_order ?? 0) - (b.item_order ?? 0)),
      );
      setCarregando(false);
    })();
    return () => {
      vivo = false;
    };
  }, []);

  const porModulo = useMemo(() => {
    const mapa = new Map<number, ItemRoteiro[]>();
    for (const item of itens) {
      const chave = item.module_order ?? -1;
      mapa.set(chave, [...(mapa.get(chave) ?? []), item]);
    }
    return mapa;
  }, [itens]);

  if (carregando) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-classics" />
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-3xl">
      <h2 className="mb-5">Roteiro de estudo</h2>
      <div className="space-y-3">
        {modulos.map((mod) => {
          const versos = porModulo.get(mod.order_index) ?? [];
          const expandido = aberto === mod.order_index;
          return (
            <div key={mod.order_index} className="overflow-hidden rounded-2xl border border-border bg-card">
              <button
                type="button"
                onClick={() => setAberto(expandido ? null : mod.order_index)}
                aria-expanded={expandido}
                className="flex w-full items-center gap-3 p-4 text-left"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-classics-soft text-sm font-bold text-classics">
                  {mod.order_index}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-serif text-base font-bold text-primary">{mod.title}</span>
                  {mod.description && (
                    <span className="mt-0.5 block text-sm text-muted-foreground">{mod.description}</span>
                  )}
                </span>
                <span className="shrink-0 text-xs font-semibold text-muted-foreground">
                  {versos.length > 0 ? `${versos.length} versos` : "em curadoria"}
                </span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${expandido ? "rotate-180" : ""}`}
                />
              </button>

              {expandido && (
                <div className="space-y-3 border-t border-border bg-muted/20 p-4">
                  {versos.length > 0 ? (
                    versos.map((v, i) => <VersoCard key={i} verso={v} />)
                  ) : (
                    <p className="text-sm text-muted-foreground">Este módulo ainda está em curadoria.</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ---------------- Pesquisar ---------------- */

const PAGINA = 20;

function AbaPesquisar() {
  const [termo, setTermo] = useState("");
  const [busca, setBusca] = useState("");
  const [resultados, setResultados] = useState<Verso[]>([]);
  const [total, setTotal] = useState(0);
  const [carregando, setCarregando] = useState(false);
  const offsetRef = useRef(0);

  useEffect(() => {
    const t = setTimeout(() => setBusca(termo.trim()), 300);
    return () => clearTimeout(t);
  }, [termo]);

  const buscar = useCallback(async (q: string, off: number) => {
    setCarregando(true);
    const { data } = await supabase.rpc("search_classical_verses", { q, lim: PAGINA, off } as never);
    const linhas = (data as any[] | null) ?? [];
    setTotal(linhas[0]?.total_count ? Number(linhas[0].total_count) : off > 0 ? total : 0);
    setResultados((antigos) => (off > 0 ? [...antigos, ...(linhas as Verso[])] : (linhas as Verso[])));
    offsetRef.current = off + linhas.length;
    setCarregando(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!busca) {
      setResultados([]);
      setTotal(0);
      offsetRef.current = 0;
      return;
    }
    void buscar(busca, 0);
  }, [busca, buscar]);

  return (
    <section className="mx-auto max-w-3xl">
      <h2 className="mb-5">Pesquisar no acervo</h2>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          placeholder="Buscar em português ou sânscrito…"
          className="pl-9"
          aria-label="Buscar versos"
        />
      </div>

      {busca && (
        <p className="mt-3 text-sm text-muted-foreground">
          {carregando && resultados.length === 0
            ? "Buscando…"
            : total > 0
              ? `${total} versos encontrados`
              : "Nenhum verso encontrado."}
        </p>
      )}

      <div className="mt-4 space-y-3">
        {resultados.map((v, i) => (
          <VersoCard key={i} verso={v} />
        ))}
      </div>

      {resultados.length > 0 && resultados.length < total && (
        <div className="mt-5 flex justify-center">
          <Button
            variant="outline"
            disabled={carregando}
            onClick={() => void buscar(busca, offsetRef.current)}
            className="border-classics/40 text-classics hover:bg-classics-soft"
          >
            {carregando ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Carregar mais
          </Button>
        </div>
      )}
    </section>
  );
}

/* ---------------- Página ---------------- */

export default function TextosClassicos() {
  const [aba, setAba] = useState<AbaId>("verso");

  return (
    <>
      <Seo
        title="Textos Clássicos"
        description="Biblioteca clássica de Ayurveda: verso do dia, roteiro de estudo e pesquisa nos tratados sânscritos com tradução em português."
      />
      <Helmet>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+Devanagari:wght@400;600&display=swap"
        />
      </Helmet>

      <div className="bg-classics-soft">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-10 md:py-14">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-classics">
            <span aria-hidden className="mr-2">॥</span>
            Biblioteca Clássica de Ayurveda
          </p>
          <h1 className="mt-2">Textos Clássicos</h1>
        </div>
      </div>

      <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-10">
        <div
          role="tablist"
          aria-label="Seções dos textos clássicos"
          className="mb-8 inline-flex flex-wrap gap-1 rounded-full bg-muted p-1"
        >
          {ABAS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={aba === t.id}
              onClick={() => setAba(t.id)}
              className={`rounded-full px-4 py-2 text-sm transition-colors ${
                aba === t.id ? "bg-card font-semibold text-primary shadow-sm" : "text-muted-foreground"
              }`}
            >
              <span
                aria-hidden
                className="mr-2 text-xs text-classics"
                style={{ fontFamily: "'Noto Serif Devanagari', serif" }}
              >
                {t.sanskrit}
              </span>
              {t.label}
            </button>
          ))}
        </div>

        {aba === "verso" && <AbaVersoDoDia />}
        {aba === "roteiro" && <AbaRoteiro />}
        {aba === "pesquisar" && <AbaPesquisar />}
        {aba === "melhores" && <AbaMelhoresVersos />}
      </main>
    </>
  );
}
