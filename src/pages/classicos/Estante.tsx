import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Search } from "lucide-react";
import Seo from "@/components/Seo";
import BannerSlot from "@/components/banners/BannerSlot";
import { Input } from "@/components/ui/input";
import { ESTANTES, fonteDevanagari, numero, rpcClassicos, type ObraLista } from "@/lib/classicos";

export default function ClassicosEstante() {
  const [termo, setTermo] = useState("");
  const obras = useQuery({
    queryKey: ["classicos-estante"],
    staleTime: 5 * 60 * 1000,
    queryFn: () => rpcClassicos<ObraLista>("classicos_estante"),
  });

  const busca = termo.trim().toLowerCase();
  const lista = (obras.data ?? []).filter(
    (o) => busca.length < 2 || o.nome.toLowerCase().includes(busca) || (o.autor ?? "").toLowerCase().includes(busca),
  );

  return (
    <>
      <Seo title="Estante dos textos clássicos" description="As obras clássicas de Ayurveda, Yoga e Vedānta traduzidas no Portal Ayurveda, por prateleira." />
      <div className="bg-classics-soft">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <Link to="/textos-classicos" className="text-base text-classics hover:underline">Textos Clássicos</Link>
          <h1 className="mt-2">Estante</h1>
        </div>
      </div>

      <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="relative mb-8 max-w-xl">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={termo}
            onChange={(e) => setTermo(e.target.value)}
            placeholder="Procurar um livro pelo nome"
            aria-label="Procurar um livro pelo nome"
            className="min-h-[52px] pl-12 text-base"
          />
        </div>

        {obras.isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-classics" /></div>
        ) : (
          ESTANTES.map((prateleira) => {
            const doGrupo = lista.filter((o) => o.estante === prateleira.chave);
            if (doGrupo.length === 0) return null;
            const versos = doGrupo.reduce((s, o) => s + (o.total_versos ?? 0), 0);
            return (
              <section key={prateleira.chave} className="mb-10">
                <h2 className="font-serif text-2xl font-bold text-primary">{prateleira.titulo}</h2>
                <p className="mb-4 mt-1 text-base text-muted-foreground">
                  {doGrupo.length} {doGrupo.length === 1 ? "obra" : "obras"} · {numero(versos)} versos
                </p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {doGrupo.map((obra) => (
                    <Link
                      key={obra.slug}
                      to={`/textos-classicos/${obra.slug}`}
                      className="flex flex-col rounded-2xl border border-border bg-card p-4 transition-shadow hover:shadow-md"
                    >
                      {obra.nome_devanagari && (
                        <span lang="sa" className="text-base text-classics" style={fonteDevanagari}>{obra.nome_devanagari}</span>
                      )}
                      <span className="mt-1 font-serif text-xl font-bold text-primary">{obra.nome}</span>
                      {(obra.autor || obra.epoca) && (
                        <span className="mt-1 text-base text-muted-foreground">
                          {[obra.autor, obra.epoca].filter(Boolean).join(" · ")}
                        </span>
                      )}
                      {obra.apresentacao && (
                        <span className="mt-2 text-base leading-relaxed text-muted-foreground">{obra.apresentacao}</span>
                      )}
                      <span className="mt-3 border-t border-border pt-3 text-base text-muted-foreground">
                        {numero(obra.total_capitulos)} capítulos · {numero(obra.total_versos)} versos
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })
        )}

        <BannerSlot slot="classicos_rodape" className="my-8 [&:empty]:hidden" />
      </main>
    </>
  );
}
