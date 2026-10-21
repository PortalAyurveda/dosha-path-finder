import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import Seo from "@/components/Seo";
import BannerSlot from "@/components/banners/BannerSlot";
import { fonteDevanagari, numero, rpcClassicos } from "@/lib/classicos";

type Cabecalho = {
  id: number; chave: string; nome: string; nome_popular: string | null; nome_latim: string | null;
  nome_devanagari: string | null; descricao: string | null; n_versos: number; n_obras: number;
};
type VersoPlanta = { obra: string; obra_slug: string; entrada: string | null; verso_no: string | null; sanscrito: string | null; texto_pt: string | null };

export default function ClassicosPlanta() {
  const { chave } = useParams<{ chave: string }>();

  const planta = useQuery({
    queryKey: ["classicos-planta", chave],
    enabled: !!chave,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => (await rpcClassicos<Cabecalho>("classicos_planta", { p_chave: chave }))[0] ?? null,
  });

  const id = planta.data?.id;
  const versos = useQuery({
    queryKey: ["classicos-planta-versos", id],
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    queryFn: () => rpcClassicos<VersoPlanta>("classicos_planta_ler", { p_planta_id: id }),
  });

  if (planta.isLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-classics" /></div>;
  }
  if (!planta.data) {
    return (
      <main className="w-full max-w-6xl mx-auto px-4 py-20 text-center">
        <h1>Entrada não encontrada</h1>
        <Link to="/textos-classicos/plantas" className="mt-4 inline-block text-base text-classics hover:underline">Ver a lista de A a Z</Link>
      </main>
    );
  }

  const p = planta.data;
  const lista = versos.data ?? [];

  return (
    <>
      <Seo title={`${p.nome} nos textos clássicos`} description={`O que os dicionários antigos de Ayurveda dizem sobre ${p.nome}${p.nome_popular ? ` (${p.nome_popular})` : ""}.`} />
      <div className="bg-classics-soft">
        <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-10">
          <Link to="/textos-classicos/plantas" className="text-base text-classics hover:underline">Plantas de A a Z</Link>
          <h1 className="mt-2">
            {p.nome}{" "}
            {p.nome_devanagari && <span lang="sa" className="text-2xl text-classics" style={fonteDevanagari}>{p.nome_devanagari}</span>}
          </h1>
          <p className="mt-2 text-base text-muted-foreground">
            {[p.nome_popular, p.nome_latim, `${numero(p.n_versos)} versos em ${numero(p.n_obras)} ${p.n_obras === 1 ? "livro" : "livros"}`]
              .filter(Boolean).join(" · ")}
          </p>
          {p.descricao && <p className="mt-3 text-base leading-relaxed">{p.descricao}</p>}
        </div>
      </div>

      <main className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {versos.isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-classics" /></div>
        ) : (
          <div className="space-y-4">
            {lista.map((v, i) => (
              <article key={i} className="rounded-2xl border border-classics/20 bg-card p-5">
                <p className="text-xs font-bold uppercase tracking-wide text-classics">
                  <Link to={`/textos-classicos/${v.obra_slug}`} className="hover:underline">{v.obra}</Link>
                  {v.verso_no ? ` · v. ${v.verso_no}` : ""}
                </p>
                {v.sanscrito && (
                  <p lang="sa" className="mt-3 text-lg leading-relaxed text-primary" style={fonteDevanagari}>{v.sanscrito}</p>
                )}
                {v.texto_pt && <p className="mt-3 text-base leading-relaxed">{v.texto_pt}</p>}
              </article>
            ))}
          </div>
        )}

        <BannerSlot slot="classicos_planta_fim" className="my-8 [&:empty]:hidden" />
      </main>
    </>
  );
}
