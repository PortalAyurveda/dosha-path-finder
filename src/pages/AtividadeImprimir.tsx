import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Printer } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { MarcaPortal } from "@/components/impressao/PecasImpressao";
import { ddmm, mensagemMotivo, rpc, useUrlsAssinadas, type Atividade, type Pergunta } from "@/components/atividades/base";
import { separarRelatorio, textoResposta } from "@/components/atividades/AtividadeRelatorio";

const tituloCurto = (p: Pergunta) => p.config?.rotulo_relatorio || p.secao || p.enunciado || p.codigo;

const AtividadeImprimir = () => {
  const { id = "" } = useParams();
  const [sp] = useSearchParams();
  const pessoa = sp.get("pessoa");
  const { profile, doshaResult, user } = useUser();
  const [erro, setErro] = useState<string | null>(null);
  const [dados, setDados] = useState<{
    atividade: Atividade;
    perguntas: Pergunta[];
    respostas: Record<string, any>;
    entregueEm: string | null;
    nome: string | null;
  } | null>(null);

  useEffect(() => {
    void (async () => {
      const d = await rpc("atividade_abrir", { p_atividade_id: id });
      if (!d?.ok) return setErro(mensagemMotivo(d?.motivo));
      const perguntas = [...(d.perguntas ?? [])].sort((a: Pergunta, b: Pergunta) => (a.ordem ?? 0) - (b.ordem ?? 0));
      if (pessoa) {
        const e = await rpc("atividade_entregas", { p_atividade_id: id });
        if (!e?.ok) return setErro(mensagemMotivo(e?.motivo));
        const reg = (e.entregas ?? []).find((x: any) => x.user_id === pessoa);
        if (!reg) return setErro("Esta pessoa ainda não respondeu.");
        setDados({ atividade: d.atividade, perguntas, respostas: reg.respostas ?? {}, entregueEm: reg.entregue_em, nome: reg.nome || reg.email });
      } else {
        setDados({
          atividade: d.atividade,
          perguntas,
          respostas: d.resposta?.respostas ?? {},
          entregueEm: d.resposta?.entregue_em ?? null,
          nome: (profile as any)?.nome ?? (profile as any)?.full_name ?? doshaResult?.nome ?? user?.email ?? null,
        });
      }
    })();
  }, [id, pessoa, profile, doshaResult?.nome, user?.email]);

  const s = dados ? separarRelatorio(dados.atividade, dados.perguntas, dados.respostas) : null;
  const linhasFotos = s ? s.linhas.filter((p) => p.tipo === "foto") : [];
  const outrasFotos = linhasFotos.flatMap((p) => Object.values((dados!.respostas[p.codigo] ?? {}) as Record<string, string>));
  const urls = useUrlsAssinadas([...(s?.fotoPaths ?? []), ...outrasFotos]);
  const doshaVal = s?.doshaCab ? dados!.respostas[s.doshaCab.codigo] : null;
  const voltar = pessoa ? "/admin/atividades" : -1;

  return (
    <div style={{ background: "#F3F1F6", minHeight: "100vh", padding: "20px 12px" }}>
      <Helmet>
        <title>Imprimir atividade · Portal Ayurveda</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <style>{`@page { size: A4 portrait; margin: 12mm; }`}</style>
      <style>{`@media print {
        body * { visibility: hidden !important; }
        .no-print { display: none !important; }
        #folha-impressao, #folha-impressao * { visibility: visible !important; }
        #folha-impressao { position: static !important; width: auto !important; box-shadow: none !important; margin: 0 !important; padding: 0 !important; }
      }`}</style>
      <style>{`#folha-impressao p, #folha-impressao span, #folha-impressao li,
        #folha-impressao td, #folha-impressao th, #folha-impressao h1,
        #folha-impressao h2, #folha-impressao h3 { color: #000 !important; }`}</style>

      <div className="no-print" style={{ background: "#fff", border: "1px solid #352F54", borderRadius: 12, maxWidth: "210mm", margin: "0 auto 20px", padding: 20 }}>
        {typeof voltar === "string" ? (
          <Link to={voltar} className="flex items-center underline text-[#352F54]" style={{ height: 48, fontSize: 17 }}>
            ← Voltar
          </Link>
        ) : (
          <button type="button" onClick={() => window.history.back()} className="flex items-center underline text-[#352F54]" style={{ height: 48, fontSize: 17 }}>
            ← Voltar
          </button>
        )}
        <button
          type="button"
          onClick={() => window.print()}
          disabled={!dados}
          className="mt-2 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#352F54] text-lg font-bold text-white disabled:opacity-60"
        >
          <Printer className="h-5 w-5" /> Imprimir
        </button>
        <p className="mt-2 text-center text-[15px] text-[#4A4560]">No celular, esse botão salva em PDF.</p>
      </div>

      <div
        id="folha-impressao"
        style={{ width: "210mm", maxWidth: "100%", margin: "0 auto", padding: "12mm", background: "#fff", color: "#000", textAlign: "left", boxShadow: "0 2px 12px rgba(0,0,0,.1)" }}
      >
        {erro && <p style={{ fontSize: "12pt" }}>{erro}</p>}
        {!erro && !dados && <p style={{ fontSize: "12pt" }}>Carregando…</p>}
        {dados && s && (
          <>
            <div style={{ display: "flex", alignItems: "center", borderBottom: "1px solid #352F54", paddingBottom: "3mm", marginBottom: "5mm" }}>
              <MarcaPortal />
              <div style={{ marginLeft: "4mm" }}>
                <h1 className="font-serif" style={{ fontSize: "15pt", margin: 0 }}>{dados.atividade.titulo}</h1>
                <span style={{ fontSize: "10pt" }}>
                  {[dados.nome, dados.entregueEm ? `Entregue em ${ddmm(dados.entregueEm)}` : null].filter(Boolean).join(" · ")}
                </span>
              </div>
              <span style={{ marginLeft: "auto", fontSize: "10pt" }}>portalayurveda.com</span>
            </div>

            <h2 className="font-serif" style={{ fontSize: "13pt", margin: "0 0 3mm" }}>{s.titulo}</h2>
            {s.fotoPaths.length > 0 && (
              <div style={{ display: "flex", gap: "3mm", marginBottom: "3mm" }}>
                {s.fotoPaths.map((p) => (urls[p] ? <img key={p} src={urls[p]} alt="" style={{ height: "45mm", width: "auto" }} /> : null))}
              </div>
            )}
            {s.numerosCab.length > 0 && <p style={{ fontSize: "11pt", margin: "0 0 2mm" }}>{s.numerosCab.join(" · ")}</p>}
            {doshaVal && (
              <p style={{ fontSize: "11pt", margin: "0 0 3mm" }}>
                Vata {doshaVal.vata}% · Pitta {doshaVal.pitta}% · Kapha {doshaVal.kapha}%
              </p>
            )}
            {[...s.destaques, ...s.linhas].map((p) => {
              const v = dados.respostas[p.codigo];
              let txt: string | null;
              if (p.tipo === "arquivo") txt = `${(Array.isArray(v) ? v : []).length} arquivo(s) enviado(s)`;
              else if (p.tipo === "foto") txt = null;
              else txt = textoResposta(p, v);
              return (
                <div key={p.id} style={{ breakInside: "avoid", marginBottom: "2.5mm" }}>
                  <p style={{ fontSize: "8.5pt", fontWeight: 700, textTransform: "uppercase", margin: 0 }}>{tituloCurto(p)}</p>
                  {p.tipo === "foto" ? (
                    <div style={{ display: "flex", gap: "3mm" }}>
                      {(Object.values(v ?? {}) as string[]).map((f) => (urls[f] ? <img key={f} src={urls[f]} alt="" style={{ height: "45mm" }} /> : null))}
                    </div>
                  ) : (
                    <p style={{ fontSize: "11pt", margin: 0, whiteSpace: "pre-line" }}>{txt ?? "—"}</p>
                  )}
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
};

export default AtividadeImprimir;
