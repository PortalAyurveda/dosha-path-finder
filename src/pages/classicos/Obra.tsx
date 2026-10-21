import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Search } from "lucide-react";
import Seo from "@/components/Seo";
import BannerSlot from "@/components/banners/BannerSlot";
import { Input } from "@/components/ui/input";
import { fonteDevanagari, numero, rpcClassicos, type ObraLista } from "@/lib/classicos";

type Capitulo = {
  capitulo_id: number; rota: string; nivel1: string | null; rotulo_nivel1: string | null;
  nivel2: string | null; rotulo_nivel2: string | null; titulo_pt: string | null;
  titulo_translit: string | null; n_versos: number;
};
type Entrada = {
  id: number; chave: string; nome: string; nome_popular: string | null; nome_latim: string | null;
  nome_devanagari: string | null; n_obras: number; versos_nesta_obra: number; total: number;
};
type Letra = { letra: string; total: number };

export default function ClassicosObra() {
  const { obra: slug } = useParams<{ obra: string }>();
  const [secao, setSecao] = useState<string | null>(null);
  const [termo, setTermo] = useState("");
  const [busca, setBusca] = useState("");
  const [letra, setLetra] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setBusca(termo.trim()), 300);
    return () => clearTimeout(t);
  }, [termo]);

  const estante = useQuery({
    queryKey: ["classicos-estante"],
    staleTime: 5 * 60 * 1000,
    queryFn: () => rpcClassicos<ObraLista>("classicos_estante"),
  });
  const obra = (estante.data ?? []).find((o) => o.slug === slug);
  const ehDicionario = obra?.estante === "nighantu";

  const sumario = useQuery({
    queryKey: ["classicos-sumario", slug],
    enabled: !!slug && !!obra && !ehDicionario,
    staleTime: 5 * 60 * 1000,
    queryFn: () => rpcClassicos<Capitulo>("classicos_sumario", { p_obra: slug }),
  });

  const letras = useQuery({
    queryKey: ["classicos-letras", slug],
    enabled: !!slug && !!obra && ehDicionario,
    staleTime: 5 * 60 * 1000,
    queryFn: () => rpcClassicos<Letra>("classicos_letras_plantas", { p_obra: slug }),
  });

  const entradas = useQuery({
    queryKey: ["classicos-entradas", slug, busca, letra],
    enabled: !!slug && !!obra && ehDicionario,
    staleTime: 60 * 1000,
    queryFn: () =>
      rpcClassicos<Entrada>("classicos_plantas_listar", {
        p_obra: slug,
        p_busca: busca.length >= 2 ? busca : null,
        p_letra: busca.length >= 2 ? null : letra,
        p_limite: 200,
        p_offset: 0,
      }),
  });

  if (estante.isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-classics" /></div>;
  }
  if (!obra) {
    return (
      <main className="w-full max-w-6xl mx-auto px-4 py-20 text-center">
        <h1>Obra não encontrada</h1>
        <Link to="/textos-classicos/estante" className="mt-4 inline-block text-base text-classics hover:underline">Ver a estante</Link>
      </main>
    );
  }

  const capitulos = sumario.data ?? [];
  const secoes = Array.from(new Set(capitulos.map((c) => c.nivel1).filter(Boolean))) as string[];
  const secaoAtiva = secao ?? secoes[0] ?? null;
  const visiveis = secoes.length > 0 ? capitulos.filter((c) => c.nivel1 === secaoAtiva) : capitulos;

  return (
    <>
      <Seo title={obra.nome} description={obra.apresentacao ?? `${obra.nome} traduzido no Portal Ayurveda.`} />
      <div className="bg-classics-soft">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <Link to="/textos-classicos/estante" className="text-base text-classics hover:underline">Estante</Link>
          <h1 className="mt-2">
            {obra.nome}{" "}
            {obra.nome_devanagari && (
              <span lang="sa" className="text-2xl text-classics" style={fonteDevanagari}>{obra.nome_devanagari}</span>
            )}
          </h1>
          <p className="mt-3 text-base text-muted-foreground">
            {[obra.autor, obra.epoca].filter(Boolean).join(" · ")} · {numero(obra.total_capitulos)} capítulos · {numero(obra.total_versos)} versos
          </p>
          {obra.apresentacao && <p className="mt-3 max-w-3xl text-base leading-relaxed">{obra.apresentacao}</p>}
          {obra.nota_estado && (
            <p className="mt-3 rounded-xl border border-classics bg-card p-3 text-base">{obra.nota_estado}</p>
          )}
        </div>
      </div>

      <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {ehDicionario ? (
          <>
            <div className="relative mb-5 max-w-xl">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={termo}
                onChange={(e) => setTermo(e.target.value)}
                placeholder="Procurar uma entrada deste dicionário"
                aria-label="Procurar uma entrada deste dicionário"
                className="min-h-[52px] pl-12 text-base"
              />
            </div>

            <div className="mb-6 flex flex-wrap gap-2">
              {(letras.data ?? []).map((l) => (
                <button
                  key={l.letra}
                  type="button"
                  onClick={() => { setLetra(letra === l.letra ? null : l.letra); setTermo(""); }}
                  className={`inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border px-3 text-base font-bold ${
                    letra === l.letra ? "border-classics bg-classics text-white" : "border-border bg-card text-primary hover:bg-classics-soft"
                  }`}
                >
                  {l.letra}
                </button>
              ))}
            </div>

            {entradas.isLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-classics" /></div>
            ) : (
              <>
                <p className="mb-4 text-base text-muted-foreground">
                  {numero(entradas.data?.[0]?.total ?? 0)} entradas, em ordem alfabética.
                </p>
                <div className="overflow-hidden rounded-2xl border border-border bg-card">
                {(entradas.data ?? []).map((e) => (
                  <Link
                    key={e.id}
                    to={`/textos-classicos/plantas/${e.chave}`}
                    className="flex min-h-[64px] items-center gap-3 border-t border-border p-4 first:border-t-0 hover:bg-classics-soft"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block text-lg font-semibold text-primary">{e.nome}</span>
                      <span className="block text-base text-muted-foreground">
                        {[e.nome_devanagari, e.nome_popular, e.nome_latim, e.n_obras > 1 ? `em ${e.n_obras} livros` : null]
                          .filter(Boolean).join(" · ")}
                      </span>
                    </span>
                    <span className="shrink-0 text-base text-muted-foreground">
                      {numero(e.versos_nesta_obra)} {e.versos_nesta_obra === 1 ? "verso" : "versos"}
                    </span>
                  </Link>
                ))}
                </div>
              </>
            )}
          </>
        ) : sumario.isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-classics" /></div>
        ) : (
          <>
            {secoes.length > 1 && (
              <div className="mb-6 flex flex-wrap gap-2">
                {secoes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSecao(s)}
                    className={`min-h-[48px] rounded-xl border px-5 text-base font-medium transition-colors ${
                      s === secaoAtiva ? "border-classics bg-classics text-white" : "border-border bg-card text-primary hover:bg-classics-soft"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            <div className="overflow-hidden rounded-2xl border border-border bg-card">
              {visiveis.map((c) => (
                <Link
                  key={c.capitulo_id}
                  to={c.rota}
                  className="flex min-h-[64px] items-center gap-3 border-t border-border p-4 first:border-t-0 hover:bg-classics-soft"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-classics-soft text-base font-bold text-classics">
                    {c.nivel2 && c.nivel2.length <= 3 ? c.nivel2 : "॥"}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-lg font-semibold text-primary">
                      {c.titulo_pt ?? c.titulo_translit ?? `${c.rotulo_nivel2 ?? "Capítulo"} ${c.nivel2 ?? ""}`}
                    </span>
                    {c.titulo_translit && c.titulo_pt && (
                      <span className="block text-base text-muted-foreground">{c.titulo_translit}</span>
                    )}
                  </span>
                  <span className="shrink-0 text-base text-muted-foreground">{numero(c.n_versos)} versos</span>
                </Link>
              ))}
            </div>
          </>
        )}

        <BannerSlot slot="classicos_rodape" className="my-8 [&:empty]:hidden" />
      </main>
    </>
  );
}
