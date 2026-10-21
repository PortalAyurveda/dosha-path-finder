import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import Seo from "@/components/Seo";
import BannerSlot from "@/components/banners/BannerSlot";
import { fonteDevanagari, numero, rpcClassicos } from "@/lib/classicos";

type Cabecalho = {
  capitulo_id: number; rota: string; obra_slug: string; obra_nome: string; obra_devanagari: string | null;
  estante: string; nivel1: string | null; rotulo_nivel1: string | null; nivel2: string | null;
  rotulo_nivel2: string | null; titulo_pt: string | null; titulo_translit: string | null;
  titulo_devanagari: string | null; resumo: string | null; temas: string[] | null; n_versos: number;
  anterior_id: number | null; anterior_titulo: string | null; anterior_rota: string | null;
  proximo_id: number | null; proximo_titulo: string | null; proximo_rota: string | null;
};
type VersoCapitulo = { ordem: number; verso_no: string | null; sanscrito: string | null; texto_pt: string | null };

export default function ClassicosCapitulo() {
  const params = useParams();
  const slug = params.obra as string | undefined;
  const resto = (params["*"] ?? "") as string;
  const [mostrarSanscrito, setMostrarSanscrito] = useState(true);
  const [copiado, setCopiado] = useState(false);

  const cabecalho = useQuery({
    queryKey: ["classicos-capitulo", slug, resto],
    enabled: !!slug && resto.length > 0,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => (await rpcClassicos<Cabecalho>("classicos_capitulo_por_rota", { p_obra: slug, p_rota: resto }))[0] ?? null,
  });

  const id = cabecalho.data?.capitulo_id;
  const versos = useQuery({
    queryKey: ["classicos-capitulo-versos", id],
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    queryFn: () => rpcClassicos<VersoCapitulo>("classicos_capitulo_versos", { p_capitulo_id: id, p_limite: 400, p_offset: 0 }),
  });

  if (cabecalho.isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-classics" /></div>;
  }
  if (!cabecalho.data) {
    return (
      <main className="w-full max-w-6xl mx-auto px-4 py-20 text-center">
        <h1>Capítulo não encontrado</h1>
        <Link to={`/textos-classicos/${slug ?? ""}`} className="mt-4 inline-block text-base text-classics hover:underline">
          Voltar ao sumário
        </Link>
      </main>
    );
  }

  const c = cabecalho.data;
  const titulo = c.titulo_pt ?? c.titulo_translit ?? `${c.rotulo_nivel2 ?? "Capítulo"} ${c.nivel2 ?? ""}`;
  const caminho = [c.obra_nome, c.nivel1, c.nivel2 ? `${c.rotulo_nivel2 ?? "Capítulo"} ${c.nivel2}` : null]
    .filter(Boolean).join(" · ");

  return (
    <>
      <Seo title={`${titulo} · ${c.obra_nome}`} description={c.resumo ?? `${titulo}, de ${c.obra_nome}, com tradução em português.`} />
      <div className="bg-classics-soft">
        <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-10">
          <Link to={`/textos-classicos/${c.obra_slug}`} className="text-base text-classics hover:underline">{caminho}</Link>
          <h1 className="mt-2">{titulo}</h1>
          <p className="mt-2 text-base text-muted-foreground">
            {[c.titulo_translit, `${numero(c.n_versos)} versos`].filter(Boolean).join(" · ")}
          </p>
          {c.resumo && <p className="mt-3 text-base leading-relaxed">{c.resumo}</p>}
        </div>
      </div>

      <main className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setMostrarSanscrito((v) => !v)}
              className="min-h-[48px] rounded-xl border border-border bg-card px-5 text-base font-medium text-primary hover:bg-classics-soft"
            >
              {mostrarSanscrito ? "Esconder sânscrito" : "Mostrar sânscrito"}
            </button>
            <button
              type="button"
              onClick={() => {
                const texto = [
                  `${titulo} (${caminho})`,
                  "",
                  ...(versos.data ?? []).map((v) =>
                    [v.verso_no ? `v. ${v.verso_no}` : null, v.texto_pt].filter(Boolean).join(" "),
                  ),
                ].join("\n");
                void navigator.clipboard.writeText(texto).then(
                  () => setCopiado(true),
                  () => setCopiado(false),
                );
                window.setTimeout(() => setCopiado(false), 2500);
              }}
              className="min-h-[48px] rounded-xl border border-border bg-card px-5 text-base font-medium text-primary hover:bg-classics-soft"
            >
              {copiado ? "Capítulo copiado" : "Copiar capítulo"}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {c.anterior_rota && (
              <Link to={c.anterior_rota} className="inline-flex min-h-[48px] items-center gap-2 rounded-xl border border-border bg-card px-4 text-base text-primary hover:bg-classics-soft">
                <ArrowLeft className="h-5 w-5" /> Anterior
              </Link>
            )}
            {c.proximo_rota && (
              <Link to={c.proximo_rota} className="inline-flex min-h-[48px] items-center gap-2 rounded-xl border border-border bg-card px-4 text-base text-primary hover:bg-classics-soft">
                Próximo <ArrowRight className="h-5 w-5" />
              </Link>
            )}
          </div>
        </div>

        {versos.isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-classics" /></div>
        ) : (
          <div className="space-y-4">
            {(versos.data ?? []).map((v) => (
              <article key={v.ordem} id={`v${v.verso_no ?? v.ordem}`} className="rounded-2xl border border-classics/20 bg-card p-5 scroll-mt-24">
                {v.verso_no && <p className="text-base font-semibold text-muted-foreground">v. {v.verso_no}</p>}
                {mostrarSanscrito && v.sanscrito && (
                  <p lang="sa" className="mt-3 text-lg leading-relaxed text-primary" style={fonteDevanagari}>{v.sanscrito}</p>
                )}
                {v.texto_pt && <p className="mt-3 text-base leading-relaxed">{v.texto_pt}</p>}
              </article>
            ))}
          </div>
        )}

        <div className="mt-8 flex flex-wrap justify-between gap-3">
          {c.anterior_rota ? (
            <Link to={c.anterior_rota} className="inline-flex min-h-[48px] max-w-full items-center gap-2 rounded-xl border border-border bg-card px-4 text-base text-primary hover:bg-classics-soft">
              <ArrowLeft className="h-5 w-5 shrink-0" /> <span className="truncate">{c.anterior_titulo ?? "Anterior"}</span>
            </Link>
          ) : <span />}
          {c.proximo_rota && (
            <Link to={c.proximo_rota} className="inline-flex min-h-[48px] max-w-full items-center gap-2 rounded-xl border border-border bg-card px-4 text-base text-primary hover:bg-classics-soft">
              <span className="truncate">{c.proximo_titulo ?? "Próximo"}</span> <ArrowRight className="h-5 w-5 shrink-0" />
            </Link>
          )}
        </div>

        <BannerSlot slot="classicos_capitulo_fim" className="my-8 [&:empty]:hidden" />
      </main>
    </>
  );
}
