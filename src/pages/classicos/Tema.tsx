import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import Seo from "@/components/Seo";
import BannerSlot from "@/components/banners/BannerSlot";
import { numero, rpcClassicos } from "@/lib/classicos";

type Tema = { tema: string; rotulo: string; total: number };
type Capitulo = {
  capitulo_id: number; rota: string; obra_slug: string; obra_nome: string;
  titulo_pt: string | null; titulo_translit: string | null;
  nivel1: string | null; rotulo_nivel1: string | null; nivel2: string | null; rotulo_nivel2: string | null;
  n_versos: number; total: number;
};

export default function ClassicosTema() {
  const { tema } = useParams<{ tema: string }>();

  const temas = useQuery({
    queryKey: ["classicos-temas"],
    staleTime: 5 * 60 * 1000,
    queryFn: () => rpcClassicos<Tema>("classicos_temas"),
  });

  const capitulos = useQuery({
    queryKey: ["classicos-tema", tema],
    enabled: !!tema,
    staleTime: 5 * 60 * 1000,
    queryFn: () => rpcClassicos<Capitulo>("classicos_capitulos_por_tema", { p_tema: tema, p_limite: 200, p_offset: 0 }),
  });

  const atual = (temas.data ?? []).find((t) => t.tema === tema);
  const lista = capitulos.data ?? [];
  const obras = new Set(lista.map((c) => c.obra_slug)).size;

  return (
    <>
      <Seo title={`${atual?.rotulo ?? "Tema"} nos textos clássicos`} description={`Os capítulos dos clássicos de Ayurveda que falam de ${(atual?.rotulo ?? "").toLowerCase()}.`} />
      <div className="bg-classics-soft">
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-10">
          <Link to="/textos-classicos" className="text-base text-classics hover:underline">Textos Clássicos</Link>
          <h1 className="mt-2">{atual?.rotulo ?? tema}</h1>
          {lista.length > 0 && (
            <p className="mt-3 text-base text-muted-foreground">
              {numero(lista.length)} capítulos em {numero(obras)} {obras === 1 ? "obra" : "obras"}.
            </p>
          )}
        </div>
      </div>

      <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6 flex flex-wrap gap-2">
          {(temas.data ?? []).map((t) => (
            <Link key={t.tema} to={`/textos-classicos/tema/${t.tema}`}
              className={`inline-flex min-h-[48px] items-center rounded-full px-4 text-base ${
                t.tema === tema ? "bg-classics text-white" : "bg-classics-soft text-primary hover:bg-classics hover:text-white"
              }`}>
              {t.rotulo}
            </Link>
          ))}
        </div>

        {capitulos.isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-classics" /></div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            {lista.map((c) => (
              <Link key={c.capitulo_id} to={c.rota}
                className="flex min-h-[64px] items-center gap-3 border-t border-border p-4 first:border-t-0 hover:bg-classics-soft">
                <span className="min-w-0 flex-1">
                  <span className="block text-lg font-semibold text-primary">
                    {c.titulo_pt ?? c.titulo_translit ?? `${c.rotulo_nivel2 ?? "Capítulo"} ${c.nivel2 ?? ""}`}
                  </span>
                  <span className="block text-base text-muted-foreground">
                    {[c.obra_nome, c.nivel1, c.nivel2 ? `${c.rotulo_nivel2 ?? "cap."} ${c.nivel2}` : null].filter(Boolean).join(" · ")}
                  </span>
                </span>
                <span className="shrink-0 text-base text-muted-foreground">{numero(c.n_versos)} versos</span>
              </Link>
            ))}
          </div>
        )}

        <BannerSlot slot="classicos_rodape" className="my-8 [&:empty]:hidden" />
      </main>
    </>
  );
}
