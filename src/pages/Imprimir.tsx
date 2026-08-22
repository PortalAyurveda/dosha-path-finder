import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { Printer } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

type Peca = "semana" | "receitas" | "compras";
const PECAS_VALIDAS: Peca[] = ["semana", "receitas", "compras"];

interface RotinaRow {
  dia: number;
  slot: string;
  nugget_id: string;
  titulo: string;
  eh_receita: boolean;
  rende_porcoes: number | null;
  tempo_preparo_min: number | null;
  ingredientes: { exibicao: string; preparo?: string | null; opcional?: boolean }[] | null;
  modo_preparo: string[] | null;
}

interface ReceitaRow {
  nugget_id: string;
  titulo: string;
  rende_porcoes: number | null;
  tempo_preparo_min: number | null;
  ingredientes: { exibicao: string; preparo?: string | null; opcional?: boolean }[] | null;
  modo_preparo: string[] | null;
}

interface CompraRow {
  setor: string;
  setor_ordem: number;
  ingrediente: string;
  despensa: boolean | null;
  quantidade_texto: string | null;
  opcional: boolean | null;
  confianca: string | null;
  tem_estimativa: boolean | null;
  sugestao_troca: string | null;
}

const SETOR_NOME: Record<string, string> = {
  hortifruti: "Hortifrúti",
  proteinas: "Proteínas",
  laticinios: "Laticínios",
  graos_e_farinhas: "Grãos e farinhas",
  mercearia: "Mercearia",
  oleos_e_gorduras: "Óleos e gorduras",
  adocantes: "Adoçantes",
  especiarias: "Especiarias",
  ervas_medicinais: "Ervas",
  loja_samkhya: "Da Samkhya",
};

const SLOTS: { slot: string; nome: string }[] = [
  { slot: "ritual_manha", nome: "Ritual da manhã" },
  { slot: "cafe_manha", nome: "Café da manhã" },
  { slot: "lanche_manha", nome: "Lanche da manhã" },
  { slot: "almoco", nome: "Almoço" },
  { slot: "lanche_tarde", nome: "Lanche da tarde" },
  { slot: "jantar", nome: "Jantar" },
  { slot: "tonico_noite", nome: "Tônico da noite" },
  { slot: "bonus", nome: "Bônus do dia" },
];

const MarcaPortal = ({ size = "10mm" }: { size?: string }) => (
  <svg viewBox="0 0 120.32 120.17" style={{ width: size, height: size, flexShrink: 0 }} aria-hidden="true">
    <path fill="#ff8f8f" d="M120.32,120.17c-21.92-1.21-41.82-12.92-53.5-31.45h53.5v31.45Z" />
    <path fill="#6e81ff" d="M119.22,70.17c-13.34-17.6-35.27-28.05-59.1-28.05S14.41,52.57,1.09,70.17C8.75,26.39,35.17,10.11,60.16,0c24.99,10.11,51.42,26.4,59.06,70.17Z" />
    <path fill="#ff8f8f" d="M0,88.72h53.49c-11.68,18.53-31.58,30.24-53.49,31.45v-31.45Z" />
    <path fill="#f2cd00" d="M2.83,81.05c11.81-19.23,34.16-31.61,57.19-31.61h.28c23.04,0,45.39,12.38,57.2,31.61H2.83Z" />
  </svg>
);

const Cabecalho = ({ nome, dosha }: { nome: string; dosha: string | null }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      borderBottom: "1px solid #352F54",
      paddingBottom: "3mm",
      marginBottom: "5mm",
    }}
  >
    <MarcaPortal />
    <span style={{ marginLeft: "4mm", fontSize: "12pt", color: "#000" }}>
      {nome}
      {dosha ? ` · ${dosha}` : ""}
    </span>
    <span style={{ marginLeft: "auto", fontSize: "10pt", color: "#000" }}>portalayurveda.com</span>
  </div>
);

const Quadradinho = ({ mm }: { mm: string }) => (
  <span
    style={{
      display: "inline-block",
      width: mm,
      height: mm,
      border: "1pt solid #000",
      flexShrink: 0,
      marginRight: "3mm",
    }}
  />
);

const CartaoReceita = ({ r }: { r: ReceitaRow }) => {
  const apoio: string[] = [];
  if (r.rende_porcoes) apoio.push(`Rende ${r.rende_porcoes} ${r.rende_porcoes === 1 ? "porção" : "porções"}`);
  if (r.tempo_preparo_min) apoio.push(`${r.tempo_preparo_min} min`);
  const ings = (r.ingredientes ?? [])
    .map((i) => `${i.exibicao}${i.opcional ? " (opcional)" : ""}`)
    .join(" · ");
  const passos = (r.modo_preparo ?? []).map((p, i) => `${i + 1}. ${p}`).join(" ");
  return (
    <div
      style={{
        breakInside: "avoid",
        border: "0.5pt dashed #000",
        padding: "3mm",
        marginBottom: "4mm",
        lineHeight: 1.25,
      }}
    >
      <h3 className="font-serif" style={{ fontSize: "10.5pt", fontWeight: 700, margin: 0, color: "#000" }}>
        {r.titulo}
      </h3>
      {apoio.length > 0 && (
        <p style={{ fontSize: "8.5pt", margin: "1mm 0 0", color: "#000", lineHeight: 1.25 }}>{apoio.join(" · ")}</p>
      )}
      {ings && <p style={{ fontSize: "9pt", margin: "2mm 0 0", color: "#000", lineHeight: 1.25 }}>{ings}</p>}
      {passos && <p style={{ fontSize: "9pt", margin: "2mm 0 0", color: "#000", lineHeight: 1.25 }}>{passos}</p>}
    </div>
  );
};


export default function Imprimir() {
  const { user, profile, loading, role, roleLoading, doshaResult } = useUser();
  const [searchParams, setSearchParams] = useSearchParams();
  const [erroVazio, setErroVazio] = useState(false);
  const [imprimindo, setImprimindo] = useState(false);

  const pecas = useMemo<Peca[]>(() => {
    const raw = (searchParams.get("pecas") ?? "receitas").split(",").map((s) => s.trim());
    const ok = raw.filter((s): s is Peca => (PECAS_VALIDAS as string[]).includes(s));
    return ok.length > 0 ? ok : ["receitas"];
  }, [searchParams]);

  // Lido só na primeira renderização: depois disso a seleção é estado local.
  const [idsIniciais] = useState<string[] | null>(() => {
    const raw = new URLSearchParams(window.location.search).get("ids");
    if (!raw) return null;
    const arr = raw.split(",").map((s) => s.trim()).filter(Boolean);
    return arr.length > 0 ? arr : null;
  });


  const querSemana = pecas.includes("semana");
  const querReceitas = pecas.includes("receitas");
  const querCompras = pecas.includes("compras");
  const soSemana = querSemana && !querReceitas && !querCompras;

  const temAcesso = (() => {
    if (role === "admin") return true;
    if (!user || !profile) return false;
    if (profile.is_premium === true) return true;
    const planosValidos = ["rotina", "mensal", "anual"];
    const ativo = profile.subscription_status === "active";
    const planoOk = !!profile.plano && planosValidos.includes(profile.plano);
    const dataOk = !profile.premium_until || new Date(profile.premium_until) > new Date();
    return ativo && planoOk && dataOk;
  })();

  const { data: testeId } = useQuery({
    queryKey: ["imprimir-teste-id", doshaResult?.idPublico],
    enabled: !!doshaResult?.idPublico && temAcesso,

    queryFn: async () => {
      const { data, error } = await supabase.rpc("resultado_teste" as any, {
        p_idpublico: doshaResult!.idPublico,
      });
      if (error) throw error;
      return Array.isArray(data) && data[0]?.id ? (data[0].id as string) : null;
    },
  });

  const rotinaQuery = useQuery({
    queryKey: ["imprimir-rotina", testeId],
    enabled: !!testeId && temAcesso,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("rotina_para_impressao" as any, { p_teste_id: testeId! });
      if (error) throw error;
      return (data ?? []) as RotinaRow[];
    },
  });

  // Receitas da semana (sem repetir nugget_id, na ordem em que aparecem)
  const receitasDaSemana = useMemo(() => {
    const rows = rotinaQuery.data ?? [];
    const vistos = new Set<string>();
    const lista: { nugget_id: string; titulo: string }[] = [];
    rows.forEach((r) => {
      if (!r.eh_receita || vistos.has(r.nugget_id)) return;
      vistos.add(r.nugget_id);
      lista.push({ nugget_id: r.nugget_id, titulo: r.titulo });
    });
    return lista;
  }, [rotinaQuery.data]);

  const [selecionados, setSelecionados] = useState<string[] | null>(idsIniciais);

  // Sem ids na URL: começa com todas marcadas assim que a semana carrega.
  useEffect(() => {
    if (selecionados === null && receitasDaSemana.length > 0) {
      setSelecionados(receitasDaSemana.map((r) => r.nugget_id));
    }
  }, [selecionados, receitasDaSemana]);

  const nuggetIds = useMemo<string[]>(() => selecionados ?? [], [selecionados]);

  const aplicarSelecao = (proximos: string[]) => {
    setSelecionados(proximos);
    const next = new URLSearchParams(searchParams);
    if (proximos.length > 0) next.set("ids", proximos.join(","));
    else next.set("ids", "");
    setSearchParams(next, { replace: true });
  };

  const alternarReceita = (id: string, on: boolean) => {
    const atual = new Set(selecionados ?? []);
    if (on) atual.add(id);
    else atual.delete(id);
    aplicarSelecao(receitasDaSemana.filter((r) => atual.has(r.nugget_id)).map((r) => r.nugget_id));
  };

  const receitasQuery = useQuery({
    queryKey: ["imprimir-receitas", nuggetIds.join(",")],
    enabled: temAcesso && querReceitas && nuggetIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("receitas_para_impressao" as any, {
        p_nugget_ids: nuggetIds,
      });
      if (error) throw error;
      return (data ?? []) as ReceitaRow[];
    },
  });

  const pIds = nuggetIds.length > 0 ? nuggetIds : null;
  const comprasQuery = useQuery({
    queryKey: ["imprimir-compras", testeId, pIds?.join(",") ?? "null"],
    enabled: temAcesso && querCompras && !!testeId,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("lista_de_compras" as any, {
        p_teste_id: testeId!,
        p_nugget_ids: pIds,
      });
      if (error) throw error;
      return (data ?? []) as CompraRow[];
    },
  });


  const carregando =
    (querReceitas && nuggetIds.length > 0 && receitasQuery.isLoading) ||
    ((querSemana || querCompras) && !!testeId && rotinaQuery.isLoading) ||
    (querCompras && !!testeId && comprasQuery.isLoading);

  const erro = receitasQuery.isError || rotinaQuery.isError || comprasQuery.isError;

  const receitas = receitasQuery.data ?? [];
  const compras = comprasQuery.data ?? [];
  const rotina = rotinaQuery.data ?? [];

  const folhas =
    (querReceitas ? Math.ceil(nuggetIds.length / 6) : 0) +

    (querSemana ? 2 : 0) +
    (querCompras ? Math.max(1, Math.ceil(compras.length / 30)) : 0);

  const togglePeca = (p: Peca, on: boolean) => {
    const atual = new Set(pecas);
    if (on) atual.add(p);
    else atual.delete(p);
    const next = new URLSearchParams(searchParams);
    next.set("pecas", Array.from(atual).join(","));
    setSearchParams(next, { replace: true });
    setErroVazio(false);
  };

  const marcado = (p: Peca) => (searchParams.get("pecas") ?? "receitas").split(",").includes(p);
  const nenhumaMarcada = !(marcado("semana") || marcado("receitas") || marcado("compras"));

  const imprimir = () => {
    if (imprimindo || carregando) return;
    if (nenhumaMarcada) {
      setErroVazio(true);
      return;
    }
    setImprimindo(true);
    window.print();
    setTimeout(() => setImprimindo(false), 1500);
  };

  useEffect(() => {
    document.body.style.background = "#EDEBE6";
    return () => {
      document.body.style.background = "";
    };
  }, []);

  const primeiroNome = (profile?.nome ?? doshaResult?.nome ?? "").split(" ")[0] || "Você";
  const nomeCompleto = profile?.nome ?? doshaResult?.nome ?? "Você";
  const dosha = doshaResult?.doshaprincipal ?? null;

  if (loading || roleLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!temAcesso) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md text-center space-y-6">
          <p className="text-lg">Pra imprimir suas receitas você precisa entrar na sua conta.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild className="h-12 text-base">
              <Link to="/auth">Entrar</Link>
            </Button>
            <Button asChild variant="outline" className="h-12 text-base">
              <Link to="/assinar">Ver os planos</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const comprasNormais = compras.filter((c) => !c.opcional && !c.despensa && c.setor !== "nao_se_compra");
  const comprasOpcionais = compras.filter((c) => c.opcional && !c.despensa && c.setor !== "nao_se_compra");
  const comprasDespensa = compras.filter((c) => c.despensa && c.setor !== "nao_se_compra");

  const setores = Array.from(
    comprasNormais.reduce((map, c) => {
      if (!map.has(c.setor)) map.set(c.setor, []);
      map.get(c.setor)!.push(c);
      return map;
    }, new Map<string, CompraRow[]>())
  ).sort((a, b) => (a[1][0].setor_ordem ?? 0) - (b[1][0].setor_ordem ?? 0));

  const textoItem = (c: CompraRow) => c.quantidade_texto ?? c.ingrediente;

  const semReceita =
    querReceitas && !carregando && !erro && receitas.length === 0 && receitasDaSemana.length === 0;


  return (
    <div style={{ background: "#EDEBE6", minHeight: "100vh", padding: "16px 8px 40px" }}>
      <Helmet>
        <title>{`Receitas — ${primeiroNome}`}</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <style>{`@page { size: ${soSemana ? "A4 landscape" : "A4 portrait"}; margin: ${soSemana ? "10mm" : "12mm"}; }`}</style>
      <style>{`@media print {
        body * { visibility: hidden !important; }
        .no-print { display: none !important; }
        #folha-impressao, #folha-impressao * { visibility: visible !important; }
        #folha-impressao { position: static !important; width: auto !important; box-shadow: none !important; margin: 0 !important; padding: 0 !important; }
      }`}</style>
      <style>{`#folha-impressao p, #folha-impressao span, #folha-impressao li,
        #folha-impressao td, #folha-impressao th, #folha-impressao h1,
        #folha-impressao h2, #folha-impressao h3 { color: #000 !important; }`}</style>

      {/* BARRA DE OPÇÕES */}
      <div
        className="no-print"
        style={{
          background: "#fff",
          border: "1px solid #352F54",
          borderRadius: 12,
          maxWidth: "210mm",
          margin: "0 auto 20px",
          padding: 20,
        }}
      >
        <Link
          to="/minha-rotina"
          className="flex items-center underline text-[#352F54]"
          style={{ height: 48, fontSize: 17 }}
        >
          ← Voltar pra minha rotina
        </Link>
        <h1 className="font-serif" style={{ fontSize: 22, margin: "4px 0 12px", color: "#352F54" }}>
          O que você quer imprimir?
        </h1>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {([
            ["receitas", "As receitas"],
            ["compras", "A lista de compras"],
            ["semana", "A semana"],
          ] as [Peca, string][]).map(([p, label]) => (
            <div key={p}>
              <label
                className="flex items-center gap-3 cursor-pointer"
                style={{ height: 56, fontSize: 17 }}
              >
                <Checkbox
                  className="h-6 w-6 border-2 border-[#3F3A52]"
                  checked={marcado(p)}
                  onCheckedChange={(v) => togglePeca(p, v === true)}
                />
                <span>{label}</span>
              </label>

              {p === "receitas" && marcado("receitas") && receitasDaSemana.length > 0 && (
                <div style={{ margin: "4px 0 12px" }}>
                  <h2 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 8px", color: "#352F54" }}>
                    Quais receitas?
                  </h2>
                  <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                    <Button
                      type="button"
                      variant="outline"
                      style={{ height: 40, fontSize: 15 }}
                      onClick={() => aplicarSelecao(receitasDaSemana.map((r) => r.nugget_id))}
                    >
                      Marcar todas
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      style={{ height: 40, fontSize: 15 }}
                      onClick={() => aplicarSelecao([])}
                    >
                      Desmarcar todas
                    </Button>
                  </div>
                  <div
                    style={{
                      maxHeight: 320,
                      overflowY: "auto",
                      border: "1px solid #CFC9C0",
                      borderRadius: 8,
                      padding: "4px 10px",
                    }}
                  >
                    {receitasDaSemana.map((r) => (
                      <label
                        key={r.nugget_id}
                        className="flex items-center gap-3 cursor-pointer"
                        style={{ height: 44, fontSize: 16 }}
                      >
                        <Checkbox
                          className="h-[22px] w-[22px] border-2 border-[#3F3A52]"
                          checked={(selecionados ?? []).includes(r.nugget_id)}
                          onCheckedChange={(v) => alternarReceita(r.nugget_id, v === true)}
                        />
                        <span>{r.titulo}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <p role="status" style={{ fontSize: 17, margin: "12px 0" }}>
          {carregando
            ? "Montando as suas folhas…"
            : querReceitas && nuggetIds.length === 0
              ? "Nenhuma receita marcada"
              : `Vai sair em ${folhas} ${folhas === 1 ? "folha" : "folhas"}`}
        </p>

        <Button
          onClick={imprimir}
          className="w-full h-14 text-lg gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Printer style={{ width: 24, height: 24 }} />
          {carregando ? "Preparando…" : "Imprimir"}
        </Button>
        {erroVazio && (
          <p style={{ fontSize: 17, marginTop: 10 }} className="text-[#8A2A1B]">
            Marque o que você quer imprimir.
          </p>
        )}
        <p style={{ fontSize: 16, marginTop: 10 }}>No celular, esse botão salva em PDF.</p>
      </div>

      {erro && (
        <div className="no-print" style={{ maxWidth: "210mm", margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontSize: 18, marginBottom: 12 }}>Não consegui montar as folhas agora.</p>
          <Button
            className="h-12"
            onClick={() => {
              receitasQuery.refetch();
              rotinaQuery.refetch();
              comprasQuery.refetch();
            }}
          >
            Tentar de novo
          </Button>
        </div>
      )}

      {!erro && semReceita && !querSemana && !querCompras && (
        <div className="no-print" style={{ maxWidth: "210mm", margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontSize: 18 }}>Você ainda não marcou nenhuma receita.</p>
          <p style={{ fontSize: 16, margin: "8px 0 16px" }}>
            Volte pra sua rotina e marque as receitas que você quer levar pro papel.
          </p>
          <Button asChild className="h-12">
            <Link to="/minha-rotina">Ir pra minha rotina</Link>
          </Button>
        </div>
      )}

      {!erro && !carregando && (
        <div style={{ overflowX: "auto" }}>
          <div
            id="folha-impressao"
            style={{
              width: "210mm",
              margin: "0 auto",
              background: "#fff",
              boxShadow: "0 2px 12px rgba(0,0,0,.15)",
              padding: "12mm",
              lineHeight: 1.35,
              textAlign: "left",
              hyphens: "none",
              color: "#000",
            }}
          >
            {/* RECEITAS */}
            {querReceitas && receitas.length > 0 && (
              <section>
                <Cabecalho nome={nomeCompleto} dosha={dosha} />
                <div style={{ columnCount: 2, columnGap: "6mm" }}>
                  {receitas.map((r) => (
                    <CartaoReceita key={r.nugget_id} r={r} />
                  ))}
                </div>
              </section>
            )}

            {/* SEMANA */}
            {querSemana && rotina.length > 0 && (
              <>
                {[
                  [1, 2, 3, 4],
                  [5, 6, 7],
                ].map((dias, idx) => (
                  <section
                    key={idx}
                    style={idx === 1 || querReceitas ? { breakBefore: "page", paddingTop: idx === 1 ? "6mm" : 0 } : undefined}
                  >
                    <Cabecalho nome={nomeCompleto} dosha={dosha} />
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr>
                          <th style={{ border: "0.5pt solid #000", width: "32mm", fontSize: "13pt", padding: "2mm", textAlign: "left" }} />
                          {dias.map((d) => (
                            <th
                              key={d}
                              style={{ border: "0.5pt solid #000", fontSize: "13pt", fontWeight: 700, padding: "2mm", textAlign: "left" }}
                            >
                              Dia {d}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {SLOTS.map((s) => (
                          <tr key={s.slot}>
                            <td
                              style={{
                                border: "0.5pt solid #000",
                                borderRight: "1pt solid #000",
                                width: "32mm",
                                fontSize: "12pt",
                                fontWeight: 700,
                                padding: "2mm",
                                verticalAlign: "top",
                              }}
                            >
                              {s.nome}
                            </td>
                            {dias.map((d) => {
                              const item = rotina.find((r) => r.dia === d && r.slot === s.slot);
                              return (
                                <td
                                  key={d}
                                  style={{ border: "0.5pt solid #000", padding: "2mm", fontSize: "12pt", verticalAlign: "top" }}
                                >
                                  {item ? (
                                    <span style={{ display: "flex", alignItems: "flex-start" }}>
                                      <span
                                        style={{
                                          display: "inline-block",
                                          width: "6mm",
                                          height: "6mm",
                                          border: "1pt solid #000",
                                          flexShrink: 0,
                                          marginRight: "2mm",
                                        }}
                                      />
                                      <span>{item.titulo}</span>
                                    </span>
                                  ) : null}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </section>
                ))}
              </>
            )}

            {/* COMPRAS */}
            {querCompras && compras.length > 0 && (
              <section style={querReceitas || querSemana ? { breakBefore: "page", paddingTop: "6mm" } : undefined}>
                <Cabecalho nome={nomeCompleto} dosha={dosha} />
                <h2 className="font-serif" style={{ fontSize: "18pt", margin: "0 0 4mm", color: "#000" }}>
                  Lista de compras
                </h2>
                <div style={{ marginLeft: "16mm" }}>
                  {setores.map(([setor, itens]) => (
                    <div key={setor} style={{ marginBottom: "6mm", breakInside: "avoid" }}>
                      <h3
                        style={{
                          fontSize: "13pt",
                          fontWeight: 700,
                          borderBottom: "1px solid #000",
                          paddingBottom: "1mm",
                          margin: "0 0 3mm",
                          color: "#000",
                        }}
                      >
                        {SETOR_NOME[setor] ?? setor}
                      </h3>
                      {itens.map((c, i) => (
                        <div key={`${c.ingrediente}-${i}`} style={{ marginBottom: "7mm" }}>
                          <span style={{ display: "flex", alignItems: "flex-start", fontSize: "12pt" }}>
                            <Quadradinho mm="5mm" />
                            <span style={{ fontWeight: 700 }}>{textoItem(c)}</span>
                          </span>
                          {c.sugestao_troca && (
                            <p style={{ fontSize: "10pt", margin: "1mm 0 0 6mm", color: "#000" }}>{c.sugestao_troca}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}

                  {comprasOpcionais.length > 0 && (
                    <div style={{ marginBottom: "6mm" }}>
                      <h3 style={{ fontSize: "13pt", fontWeight: 700, borderBottom: "1px solid #000", paddingBottom: "1mm", margin: "0 0 3mm", color: "#000" }}>
                        Se você quiser
                      </h3>
                      {comprasOpcionais.map((c, i) => (
                        <div key={`${c.ingrediente}-op-${i}`} style={{ marginBottom: "7mm" }}>
                          <span style={{ display: "flex", alignItems: "flex-start", fontSize: "12pt" }}>
                            <Quadradinho mm="5mm" />
                            <span style={{ fontWeight: 700 }}>{textoItem(c)}</span>
                          </span>
                          {c.sugestao_troca && (
                            <p style={{ fontSize: "10pt", margin: "1mm 0 0 6mm", color: "#000" }}>{c.sugestao_troca}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {comprasDespensa.length > 0 && (
                    <div>
                      <h3 style={{ fontSize: "13pt", fontWeight: 700, borderBottom: "1px solid #000", paddingBottom: "1mm", margin: "0 0 2mm", color: "#000" }}>
                        Confira se você já tem em casa
                      </h3>
                      <p style={{ fontSize: "11pt", margin: "0 0 3mm", color: "#000" }}>
                        Tempero seco, sal e óleo duram meses.
                      </p>
                      <div style={{ columnCount: 2, columnGap: "6mm" }}>
                        {comprasDespensa.map((c, i) => (
                          <p key={`${c.ingrediente}-d-${i}`} style={{ fontSize: "11pt", margin: "0 0 2mm", color: "#000" }}>
                            {c.ingrediente}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
