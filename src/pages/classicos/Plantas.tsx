import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Search } from "lucide-react";
import Seo from "@/components/Seo";
import BannerSlot from "@/components/banners/BannerSlot";
import { Input } from "@/components/ui/input";
import { fonteDevanagari, numero, rpcClassicos } from "@/lib/classicos";

type Planta = {
  id: number; chave: string; nome: string; nome_popular: string | null; nome_latim: string | null;
  nome_devanagari: string | null; n_versos: number; n_obras: number; total: number;
};
type Letra = { letra: string; total: number };

export default function ClassicosPlantas() {
  const [termo, setTermo] = useState("");
  const [busca, setBusca] = useState("");
  const [letra, setLetra] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<"todas" | "dois" | "popular">("todas");

  useEffect(() => {
    const t = setTimeout(() => setBusca(termo.trim()), 300);
    return () => clearTimeout(t);
  }, [termo]);

  const letras = useQuery({
    queryKey: ["classicos-letras", null],
    staleTime: 5 * 60 * 1000,
    queryFn: () => rpcClassicos<Letra>("classicos_letras_plantas", { p_obra: null }),
  });

  const plantas = useQuery({
    queryKey: ["classicos-plantas", busca, letra, filtro],
    staleTime: 60 * 1000,
    queryFn: () =>
      rpcClassicos<Planta>("classicos_plantas_listar", {
        p_busca: busca.length >= 2 ? busca : null,
        p_letra: busca.length >= 2 ? null : letra,
        p_minimo_obras: filtro === "dois" ? 2 : 1,
        p_so_com_popular: filtro === "popular",
        p_limite: 120,
        p_offset: 0,
      }),
  });

  const total = plantas.data?.[0]?.total ?? 0;

  return (
    <>
      <Seo title="Plantas dos textos clássicos" description="As entradas dos dicionários antigos de plantas do Ayurveda, de A a Z, com o que cada livro diz de cada uma." />
      <div className="bg-classics-soft">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <Link to="/textos-classicos" className="text-base text-classics hover:underline">Textos Clássicos</Link>
          <h1 className="mt-2">Plantas, alimentos e minerais</h1>
          <p className="mt-3 text-base text-muted-foreground">As entradas dos dicionários antigos (nighaṇṭu), reunidas em uma lista só.</p>
        </div>
      </div>

      <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="relative mb-5 max-w-xl">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={termo}
            onChange={(e) => setTermo(e.target.value)}
            placeholder="Procurar por nome sânscrito, nome popular ou nome em latim"
            aria-label="Procurar planta"
            className="min-h-[52px] pl-12 text-base"
          />
        </div>

        <div className="mb-5 flex flex-wrap gap-2">
          {([["todas", "Todas"], ["dois", "Em 2 livros ou mais"], ["popular", "Com nome em português"]] as const).map(
            ([chave, rotulo]) => (
              <button
                key={chave}
                type="button"
                onClick={() => setFiltro(chave)}
                className={`min-h-[48px] rounded-xl border px-5 text-base font-medium ${
                  filtro === chave ? "border-classics bg-classics text-white" : "border-border bg-card text-primary hover:bg-classics-soft"
                }`}
              >
                {rotulo}
              </button>
            ),
          )}
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

        {plantas.isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-classics" /></div>
        ) : (
          <>
            <p className="mb-4 text-base text-muted-foreground">{numero(total)} entradas</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(plantas.data ?? []).map((p) => (
                <Link key={p.id} to={`/textos-classicos/plantas/${p.chave}`}
                  className="flex flex-col rounded-2xl border border-border bg-card p-4 transition-shadow hover:shadow-md">
                  {p.nome_devanagari && (
                    <span lang="sa" className="text-base text-classics" style={fonteDevanagari}>{p.nome_devanagari}</span>
                  )}
                  <span className="mt-1 font-serif text-xl font-bold text-primary">{p.nome}</span>
                  {(p.nome_popular || p.nome_latim) && (
                    <span className="mt-1 text-base text-muted-foreground">
                      {[p.nome_popular, p.nome_latim].filter(Boolean).join(" · ")}
                    </span>
                  )}
                  <span className="mt-3 border-t border-border pt-3 text-base text-muted-foreground">
                    {numero(p.n_versos)} versos em {numero(p.n_obras)} {p.n_obras === 1 ? "livro" : "livros"}
                  </span>
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
