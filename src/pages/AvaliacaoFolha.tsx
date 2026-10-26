import { Link, Navigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarcaPortal } from "@/components/impressao/PecasImpressao";
import { useSouTerapeuta } from "@/hooks/useSouTerapeuta";
import { terapia, diaBR } from "@/lib/terapia";
import { iniciarDados, DOSHAS, NOMES } from "@/lib/terapiaAvaliacao";
import { linhasFolha } from "@/lib/terapiaAdicoes";
import "@/components/terapia/avaliacao/folha.css";
import Quadros from "@/components/terapia/quadro/Quadros";
export default function AvaliacaoFolha() {
  const { id, avaliacaoId } = useParams();
  const acesso = useSouTerapeuta();
  const q = useQuery({
    queryKey: ["avaliacao-folha", acesso.userId, id, avaliacaoId],
    enabled: acesso.permitido && !!id && !!avaliacaoId,
    queryFn: async () => {
      if (!id || !avaliacaoId) throw new Error("Avaliação não encontrada.");
      const [a, f, c, p] = await Promise.all([
        terapia.avaliacao(avaliacaoId),
        terapia.ficha(id),
        terapia.fichaConteudo(),
        terapia.painel(),
      ]);
      if (a.paciente_id !== id) throw new Error("Avaliação não encontrada.");
      return { a, f, c, p };
    },
    retry: false,
  });
  if (!acesso.carregando && !acesso.permitido && !acesso.error)
    return <Navigate to="/" replace />;
  const erro = acesso.error?.message ?? q.error?.message;
  const d = q.data;
  const anterior = d?.f.avaliacoes
    ?.filter(
      (a) =>
        a.id !== d.a.id && Date.parse(a.criado_em) < Date.parse(d.a.criado_em),
    )
    .sort((a, b) => Date.parse(b.criado_em) - Date.parse(a.criado_em))[0];
  return (
    <>
      <Helmet>
        <title>Folha da avaliação | Portal Ayurveda</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <nav className="no-print mx-auto flex max-w-4xl flex-wrap justify-between gap-3 px-4 py-5">
        <Button variant="outline" asChild>
          <Link
            to={`/painel-terapeuta/paciente/${id}/avaliacao/${avaliacaoId}`}
          >
            Voltar à avaliação
          </Link>
        </Button>
        <Button variant="outline" disabled={!d} onClick={() => window.print()}>
          <Printer className="mr-2 h-4 w-4" />
          Imprimir
        </Button>
      </nav>
      {erro ? (
        <p role="alert" className="p-6">
          {erro}
        </p>
      ) : !d ? (
        <p role="status" className="p-6">
          Carregando folha…
        </p>
      ) : (
        <article id="folha-avaliacao" className="avaliacao-folha">
          <header className="flex items-start justify-between gap-4 border-b border-border pb-4">
            <div>
              <h1 className="font-serif text-xl font-bold">{d.f.nome}</h1>
              <p>
                Ficha de avaliação ·{" "}
                {diaBR(d.a.consulta_inicio ?? d.a.criado_em)}
              </p>
            </div>
            <MarcaPortal />
          </header>
          {DOSHAS.some((k) => (d.a.leitura?.[k] ?? 0) > 0) && (
            <section>
              <h2>Leitura dos doshas</h2>
              <p>
                {DOSHAS.map((k) => `${NOMES[k]} ${d.a.leitura?.[k] ?? 0}`).join(
                  " · ",
                )}
              </p>
            </section>
          )}
          {d.a.resumo?.trim() && (
            <section>
              <h2>Resumo</h2>
              <p>{d.a.resumo}</p>
            </section>
          )}
          {linhasFolha(iniciarDados(d.a.dados), d.c).map((s) => (
            <section key={s.id}>
              <h2>{s.nome}</h2>
              {s.linhas.map((l, i) => (
                <p key={i} className="mb-2">
                  {l}
                </p>
              ))}
            </section>
          ))}
          <Quadros avaliacao={d.a.id} userId={acesso.userId} impressao />
          {anterior && (
            <section>
              <h2>Avaliação anterior · {diaBR(anterior.criado_em)}</h2>
              <p>
                {DOSHAS.map(
                  (k) => `${NOMES[k]} ${anterior.leitura?.[k] ?? 0}`,
                ).join(" · ")}
              </p>
              {anterior.resumo && <p>{anterior.resumo}</p>}
            </section>
          )}
          <footer className="mt-10 border-t border-border pt-3 text-xs">
            {d.p?.terapeuta.nome} · Portal Ayurveda
          </footer>
        </article>
      )}
    </>
  );
}
