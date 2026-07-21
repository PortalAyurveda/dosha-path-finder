import { useCallback, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Loader2, Minus, Plus } from "lucide-react";
import PageContainer from "@/components/PageContainer";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/contexts/UserContext";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface DoshaTeste {
  id: string;
  idPublico: string;
  nome: string | null;
  vatascore: number | null;
  pittascore: number | null;
  kaphascore: number | null;
  agniPrincipal: string | null;
  doshaprincipal: string | null;
  created_at: string | null;
}

interface RevisaoResultado {
  sintese?: string;
  vatascore_antes?: number;
  vatascore_depois?: number;
  vst_antes?: string;
  vst_depois?: string;
  pittascore_antes?: number;
  pittascore_depois?: number;
  pst_antes?: string;
  pst_depois?: string;
  kaphascore_antes?: number;
  kaphascore_depois?: number;
  kst_antes?: string;
  kst_depois?: string;
  novoDosha?: string;
  agniNovo?: string;
  pesoStr?: string;
  data_revisao?: string;
  proxima_revisao?: string;
  metaV?: number;
  metaP?: number;
  metaK?: number;
}

interface Pergunta {
  id: number;
  pergunta: string;
}

type Letra = "A" | "B" | "C" | "D" | "E";
type FlowState =
  | "idle"
  | "hello_loading"
  | "hello_done"
  | "gerar_loading"
  | "form"
  | "calcular_loading"
  | "concluido";

const WEBHOOK = "https://n8n.portalayurveda.com/webhook/reteste-revisao";

const OPCOES: { letra: Letra; texto: string }[] = [
  { letra: "A", texto: "Melhorei muito" },
  { letra: "B", texto: "Melhorei um pouco" },
  { letra: "C", texto: "Igual" },
  { letra: "D", texto: "Piorei um pouco" },
  { letra: "E", texto: "Piorei muito" },
];

const PIE_COLORS: Record<string, string> = {
  Vata: "#6B8AFF",
  Pitta: "#FF7676",
  Kapha: "#9ED88B",
};

const getNivel = (score: number, dosha: "Vata" | "Pitta" | "Kapha"): string => {
  if (dosha === "Vata") {
    if (score >= 50) return "Fixado";
    if (score >= 36) return "Adoecido";
    if (score >= 25) return "Acúmulo";
    if (score >= 15) return "Normal";
    return "Pouco";
  }
  if (dosha === "Pitta") {
    if (score >= 50) return "Fixado";
    if (score >= 41) return "Adoecido";
    if (score >= 31) return "Acúmulo";
    if (score >= 15) return "Normal";
    return "Pouco";
  }
  if (score >= 60) return "Fixado";
  if (score >= 51) return "Adoecido";
  if (score >= 36) return "Acúmulo";
  if (score >= 15) return "Normal";
  return "Pouco";
};

const DOSHA_BADGE: Record<"Vata" | "Pitta" | "Kapha", string> = {
  Vata: "bg-blue-100 text-blue-700 border-blue-300",
  Pitta: "bg-red-100 text-red-700 border-red-300",
  Kapha: "bg-green-100 text-green-700 border-green-300",
};

const formatPeso = (n: number) => {
  if (n > 0) return `+${n} kg`;
  if (n < 0) return `${n} kg`;
  return `0 kg`;
};

const formatData = (s?: string) => {
  if (!s) return "";
  const d = new Date(s);
  if (isNaN(d.getTime())) return s;
  return d.toLocaleDateString("pt-BR");
};

const Revisao = () => {
  const { user, loading: authLoading } = useUser();
  const [loading, setLoading] = useState(true);
  const [teste, setTeste] = useState<DoshaTeste | null>(null);
  const [ultimaRevisao, setUltimaRevisao] = useState<RevisaoResultado | null>(null);

  // Máquina de estados do fluxo de nova revisão
  const [flow, setFlow] = useState<FlowState>("idle");
  const [sessaoId, setSessaoId] = useState<string | null>(null);
  const [akashaHello, setAkashaHello] = useState<string>("");
  const [perguntas, setPerguntas] = useState<Pergunta[]>([]);
  const [respostas, setRespostas] = useState<Record<number, Letra>>({});
  const [pesoDelta, setPesoDelta] = useState<number>(0);
  const [pesoOriginal, setPesoOriginal] = useState<string | null>(null);
  const [, setSinteseNova] = useState<string>("");
  const [erro, setErro] = useState<string | null>(null);
  const [revPhase, setRevPhase] = useState<"antes" | "depois">("antes");

  useEffect(() => {
    if (!ultimaRevisao) return;
    setRevPhase("antes");
    const t = setTimeout(() => setRevPhase("depois"), 800);
    return () => clearTimeout(t);
  }, [ultimaRevisao]);

  const fetchUltimaRevisao = useCallback(async (email: string) => {
    const { data } = await supabase
      .from("reteste_sessao" as any)
      .select("resultado")
      .eq("user_email", email)
      .eq("status", "concluido")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    const res = (data as any)?.resultado as RevisaoResultado | undefined;
    setUltimaRevisao(res ?? null);
  }, []);

  const loadAll = useCallback(async (email: string) => {
    const [testeRes, ultimaRes, andamentoRes, pesoRes] = await Promise.all([
      supabase
        .from("doshas_registros")
        .select('id, "idPublico", nome, vatascore, pittascore, kaphascore, "agniPrincipal", doshaprincipal, created_at')
        .eq("email", email)
        .eq("tipo", "teste")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("reteste_sessao" as any)
        .select("resultado")
        .eq("user_email", email)
        .eq("status", "concluido")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("reteste_sessao" as any)
        .select("id, momento, relato_abertura, pack_perguntas")
        .eq("user_email", email)
        .eq("status", "em_andamento")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("doshas_registros")
        .select("peso")
        .eq("email", email)
        .eq("tipo", "teste")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    if (testeRes.data) setTeste(testeRes.data as DoshaTeste);

    const ultRes = (ultimaRes.data as any)?.resultado as RevisaoResultado | undefined;
    setUltimaRevisao(ultRes ?? null);

    const pesoVal = (pesoRes.data as any)?.peso;
    setPesoOriginal(pesoVal != null && String(pesoVal).trim() !== "" ? String(pesoVal) : null);

    const sess = andamentoRes.data as any;
    if (sess?.id) {
      if (sess.momento === 1 && sess.relato_abertura) {
        setSessaoId(sess.id);
        setAkashaHello(String(sess.relato_abertura));
        setFlow("hello_done");
      } else if (sess.momento === 2 && Array.isArray(sess.pack_perguntas) && sess.pack_perguntas.length > 0) {
        setSessaoId(sess.id);
        setPerguntas(sess.pack_perguntas as Pergunta[]);
        setFlow("form");
      }
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user?.email) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      await loadAll(user.email!);
      if (cancelled) return;
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [authLoading, user?.email, loadAll]);

  const callWebhook = async (body: Record<string, unknown>) => {
    const isCalcular = body?.action === "calcular";
    const controller = isCalcular ? new AbortController() : null;
    const timeout = controller
      ? setTimeout(() => controller.abort(), 60000)
      : null;
    try {
      const res = await fetch(WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller?.signal,
      });
      if (timeout) clearTimeout(timeout);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      // Webhooks do n8n às vezes vêm como array
      return Array.isArray(json) ? json[0] : json;
    } catch (e: any) {
      if (timeout) clearTimeout(timeout);
      if (isCalcular && e?.name === "AbortError") {
        // Timeout de 60s — n8n pode ter completado mesmo assim.
        // Aguarda 2s e busca o resultado direto do banco.
        await new Promise((r) => setTimeout(r, 2000));
        if (user?.email) await loadAll(user.email);
        return null;
      }
      throw e;
    }
  };

  const handleFazerRevisao = async () => {
    if (!user?.email) return;
    setErro(null);
    const prev = flow;
    setFlow("hello_loading");
    try {
      const r = await callWebhook({
        action: "hello",
        email: user.email,
        nome: teste?.nome || "",
      });
      setSessaoId(r?.sessao_id ?? r?.sessaoId ?? r?.session_id ?? null);
      setAkashaHello(r?.resposta ?? r?.mensagem ?? r?.message ?? "");
      setFlow("hello_done");
    } catch (e) {
      console.error(e);
      setErro("Erro ao processar. Tente novamente.");
      setFlow(prev);
    }
  };

  const handleGerarRevisao = async () => {
    if (!user?.email) return;
    setErro(null);
    const prev = flow;
    setFlow("gerar_loading");
    try {
      const r = await callWebhook({
        action: "gerar",
        email: user.email,
        nome: teste?.nome || "",
        sessao_id: sessaoId,
      });
      const ps: Pergunta[] = r?.perguntas ?? r?.questions ?? [];

      setPerguntas(ps);
      setRespostas({});
      setFlow("form");
    } catch (e) {
      console.error(e);
      setErro("Erro ao processar. Tente novamente.");
      setFlow(prev);
    }
  };

  const handleEnviarRevisao = async () => {
    if (!user?.email) return;
    setErro(null);
    const prev = flow;
    setFlow("calcular_loading");
    try {
      await callWebhook({
        action: "calcular",
        email: user.email,
        nome: teste?.nome || "",
        sessao_id: sessaoId,
        respostas: Object.entries(respostas).map(([id, resposta]) => ({
          id: Number(id),
          resposta,
        })),
        peso_delta: pesoDelta,
      });
      // Reset all flow states to initial and re-fetch from DB
      setFlow("idle");
      setSessaoId(null);
      setAkashaHello("");
      setPerguntas([]);
      setRespostas({});
      setPesoDelta(0);
      setSinteseNova("");
      await loadAll(user.email);
    } catch (e) {
      console.error(e);
      setErro("Erro ao processar. Tente novamente.");
      setFlow(prev);
    }
  };

  const adjustPeso = (delta: number) => {
    setPesoDelta((v) => Math.max(-20, Math.min(20, v + delta)));
  };

  const todasRespondidas =
    perguntas.length > 0 && Object.keys(respostas).length === perguntas.length;

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-akasha" />
      </div>
    );
  }

  if (!user) return <Navigate to="/entrar?redirect=/revisao" replace />;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-akasha" />
      </div>
    );
  }

  const v = teste?.vatascore ?? 0;
  const p = teste?.pittascore ?? 0;
  const k = teste?.kaphascore ?? 0;
  const pieData = [
    { name: "Vata", value: v },
    { name: "Pitta", value: p },
    { name: "Kapha", value: k },
  ].filter((d) => d.value > 0);

  return (
    <>
      <Helmet>
        <title>Revisão · Akasha</title>
      </Helmet>
      <PageContainer title="Revisão · Akasha" description="Revisão do seu diagnóstico Ayurveda">
        <div className="max-w-2xl mx-auto space-y-4">
          {/* Resumo compacto */}
          {teste && (() => {
            const hasRev = !!ultimaRevisao && (
              ultimaRevisao.vatascore_depois != null ||
              ultimaRevisao.pittascore_depois != null ||
              ultimaRevisao.kaphascore_depois != null
            );
            const vAntes = ultimaRevisao?.vatascore_antes ?? v;
            const pAntes = ultimaRevisao?.pittascore_antes ?? p;
            const kAntes = ultimaRevisao?.kaphascore_antes ?? k;
            const vDepois = ultimaRevisao?.vatascore_depois ?? v;
            const pDepois = ultimaRevisao?.pittascore_depois ?? p;
            const kDepois = ultimaRevisao?.kaphascore_depois ?? k;
            const showDepois = hasRev && revPhase === "depois";
            const pieDataDyn = (showDepois
              ? [
                  { name: "Vata", value: vDepois },
                  { name: "Pitta", value: pDepois },
                  { name: "Kapha", value: kDepois },
                ]
              : [
                  { name: "Vata", value: hasRev ? vAntes : v },
                  { name: "Pitta", value: hasRev ? pAntes : p },
                  { name: "Kapha", value: hasRev ? kAntes : k },
                ]
            ).filter((d) => d.value > 0);
            const mes = ultimaRevisao?.data_revisao
              ? new Date(ultimaRevisao.data_revisao).toLocaleDateString("pt-BR", { month: "long" })
              : "";
            const titulo = hasRev && mes
              ? `Revisão de ${mes.charAt(0).toUpperCase() + mes.slice(1)}`
              : "Seu diagnóstico";
            return (
              <div className="rounded-xl border border-border bg-card p-3 flex items-center gap-3">
                <div className="w-20 h-20 shrink-0 transition-opacity duration-700">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieDataDyn}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={18}
                        outerRadius={36}
                        startAngle={90}
                        endAngle={-270}
                        stroke="none"
                        isAnimationActive
                        animationDuration={700}
                      >
                        {pieDataDyn.map((d) => (
                          <Cell
                            key={d.name}
                            fill={hasRev && !showDepois ? "#cbd5e1" : PIE_COLORS[d.name]}
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{titulo}</p>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {(
                      [
                        ["Vata", vAntes, vDepois],
                        ["Pitta", pAntes, pDepois],
                        ["Kapha", kAntes, kDepois],
                      ] as ["Vata" | "Pitta" | "Kapha", number, number][]
                    ).map(([name, antes, depois]) => {
                      const score = showDepois ? depois : antes;
                      const nivel = getNivel(score, name);
                      const grey = hasRev && !showDepois;
                      const label = hasRev && showDepois && antes !== depois
                        ? `${name} ${antes}→${depois} · ${nivel}`
                        : `${name} ${score} · ${nivel}`;
                      return (
                        <span
                          key={name}
                          className={cn(
                            "text-[10px] px-2 py-0.5 rounded-full border font-semibold transition-all duration-700",
                            grey
                              ? "bg-muted text-muted-foreground border-border opacity-70"
                              : DOSHA_BADGE[name]
                          )}
                        >
                          {label}
                        </span>
                      );
                    })}
                  </div>
                  {teste.agniPrincipal && (
                    <p className="text-[11px] text-muted-foreground mt-1 truncate">
                      Agni: <span className="text-foreground font-medium">{teste.agniPrincipal}</span>
                    </p>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Última revisão concluída */}
          {ultimaRevisao?.sintese && (() => {
            const proximaDate = ultimaRevisao.proxima_revisao
              ? new Date(ultimaRevisao.proxima_revisao)
              : ultimaRevisao.data_revisao
                ? new Date(new Date(ultimaRevisao.data_revisao).getTime() + 30 * 24 * 60 * 60 * 1000)
                : null;
            const proximaStr = proximaDate && !isNaN(proximaDate.getTime())
              ? proximaDate.toLocaleDateString("pt-BR")
              : null;
            const podeNovaRevisao = !!proximaDate && !isNaN(proximaDate.getTime()) && proximaDate.getTime() <= Date.now();
            return (
              <div className="rounded-xl border border-border bg-card p-4">
                <h2 className="font-serif text-base font-semibold mb-2">Sua última revisão</h2>
                {/* Evolução: Antes / Agora / Próximo objetivo */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {(
                    [
                      {
                        title: "Antes",
                        scores: [
                          ["Vata", ultimaRevisao.vatascore_antes ?? 0, ultimaRevisao.vst_antes],
                          ["Pitta", ultimaRevisao.pittascore_antes ?? 0, ultimaRevisao.pst_antes],
                          ["Kapha", ultimaRevisao.kaphascore_antes ?? 0, ultimaRevisao.kst_antes],
                        ] as ["Vata" | "Pitta" | "Kapha", number, string | undefined][],
                      },
                      {
                        title: "Agora",
                        scores: [
                          ["Vata", ultimaRevisao.vatascore_depois ?? 0, ultimaRevisao.vst_depois],
                          ["Pitta", ultimaRevisao.pittascore_depois ?? 0, ultimaRevisao.pst_depois],
                          ["Kapha", ultimaRevisao.kaphascore_depois ?? 0, ultimaRevisao.kst_depois],
                        ] as ["Vata" | "Pitta" | "Kapha", number, string | undefined][],
                      },
                      {
                        title: "Próximo objetivo",
                        scores: [
                          ["Vata", ultimaRevisao.metaV, "Meta"],
                          ["Pitta", ultimaRevisao.metaP, "Meta"],
                          ["Kapha", ultimaRevisao.metaK, "Meta"],
                        ] as ["Vata" | "Pitta" | "Kapha", number | undefined, string][],
                      },
                    ] as const
                  ).map((col) => (
                    <div key={col.title} className="rounded-lg border border-border bg-muted/30 p-2 space-y-1.5">
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground text-center font-semibold">
                        {col.title}
                      </p>
                      {col.scores.map(([name, score, status]) => {
                        const s = score ?? 0;
                        const st = status ?? getNivel(s, name);
                        return (
                          <div
                            key={name}
                            className={cn(
                              "rounded-md border px-2 py-1 text-center",
                              DOSHA_BADGE[name]
                            )}
                          >
                            <p className="text-[10px] font-bold uppercase tracking-wide leading-none">{name}</p>
                            <p className="text-xs font-semibold leading-none mt-0.5">{s}</p>
                            <p className="text-[10px] opacity-80 leading-none mt-0.5">{st}</p>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
                {/* Agni + Peso */}
                {(ultimaRevisao.agniNovo || ultimaRevisao.pesoStr) && (
                  <div className="flex flex-wrap gap-3 mb-3 text-xs text-muted-foreground">
                    {ultimaRevisao.agniNovo && (
                      <span>
                        Agni: <span className="text-foreground font-medium">{ultimaRevisao.agniNovo}</span>
                      </span>
                    )}
                    {ultimaRevisao.pesoStr && (
                      <span>
                        Peso: <span className="text-foreground font-medium">{ultimaRevisao.pesoStr}</span>
                      </span>
                    )}
                  </div>
                )}
                <div className="rounded-lg bg-muted/40 p-3 text-sm whitespace-pre-wrap leading-relaxed">
                  {ultimaRevisao.sintese}
                </div>
                {ultimaRevisao.data_revisao && (
                  <p className="text-xs text-muted-foreground mt-2">{formatData(ultimaRevisao.data_revisao)}</p>
                )}
                {proximaStr && (
                  <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border">
                    Próxima revisão disponível a partir de: <span className="font-medium text-foreground">{proximaStr}</span>
                  </p>
                )}
                {podeNovaRevisao && flow === "idle" && (
                  <div className="mt-3">
                    <Button
                      onClick={() => {
                        window.scrollTo({ top: 0, behavior: "smooth" });
                        handleFazerRevisao();
                      }}
                    >
                      Fazer nova revisão
                    </Button>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Card inicial — apenas quando não há revisão concluída e o fluxo ainda não começou */}
          {!ultimaRevisao?.sintese && flow === "idle" && (
            <div className="rounded-xl border border-border bg-card p-4 space-y-4">
              <div className="flex flex-col items-start gap-2">
                <p className="text-sm text-muted-foreground">
                  Pronto para revisar como você está se sentindo nos últimos 30 dias?
                </p>
                {(() => {
                  const testeDate = teste?.created_at ? new Date(teste.created_at) : null;
                  const dias = testeDate
                    ? Math.floor((Date.now() - testeDate.getTime()) / (1000 * 60 * 60 * 24))
                    : null;
                  const bloqueado = dias !== null && dias < 30;
                  const dataLiberacao = testeDate
                    ? new Date(testeDate.getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString("pt-BR")
                    : "";
                  return (
                    <>
                      <Button onClick={handleFazerRevisao} disabled={bloqueado}>
                        Fazer revisão
                      </Button>
                      {bloqueado && (
                        <p className="text-xs text-muted-foreground">
                          Sua revisão libera dia {dataLiberacao}
                        </p>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          )}

          {/* Estados ativos do fluxo — sempre renderizados, independente de haver revisão anterior */}
          {flow !== "idle" && (
            <div className="rounded-xl border border-border bg-card p-4 space-y-4">
              {erro && (
                <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm p-2">
                  {erro}
                </div>
              )}

              {flow === "hello_loading" && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" /> Akasha está preparando sua revisão...
                </div>
              )}

              {flow === "hello_done" && (
                <div className="space-y-3">
                  {akashaHello && (
                    <div className="rounded-lg bg-muted/40 p-3 text-sm whitespace-pre-wrap leading-relaxed">
                      {akashaHello}
                    </div>
                  )}
                  <Button onClick={handleGerarRevisao}>Gerar revisão</Button>
                </div>
              )}

              {flow === "gerar_loading" && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" /> Gerando perguntas...
                </div>
              )}

              {flow === "form" && (
                <div className="space-y-6">
                  {perguntas.map((pq, idx) => (
                    <div key={pq.id} className="space-y-3">
                      <p className="font-serif font-semibold text-foreground text-base leading-snug">
                        {idx + 1}. {pq.pergunta}
                      </p>
                      <div className="space-y-2">
                        {OPCOES.map((o) => {
                          const selected = respostas[pq.id] === o.letra;
                          return (
                            <button
                              key={o.letra}
                              type="button"
                              onClick={() =>
                                setRespostas((r) => ({ ...r, [pq.id]: o.letra }))
                              }
                              className={cn(
                                "w-full text-left p-3.5 rounded-xl border-2 transition-all text-sm leading-snug",
                                selected
                                  ? "border-primary bg-primary/10 font-medium"
                                  : "border-border bg-card hover:border-primary/40"
                              )}
                            >
                              {o.letra}) {o.texto}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  <div className="space-y-2 pt-2 border-t border-border">
                    <Label className="text-sm font-medium">
                      Variação de peso nos últimos 30 dias (kg)
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Peso informado no diagnóstico: {pesoOriginal || "não informado"}
                    </p>
                    <div className="flex items-center gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => adjustPeso(-1)}
                        disabled={pesoDelta <= -20}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="min-w-[80px] text-center font-semibold">
                        {formatPeso(pesoDelta)}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => adjustPeso(1)}
                        disabled={pesoDelta >= 20}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <Button onClick={handleEnviarRevisao} disabled={!todasRespondidas} className="w-full">
                    Enviar revisão
                  </Button>
                </div>
              )}

              {flow === "calcular_loading" && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" /> Calculando sua nova síntese...
                </div>
              )}
            </div>
          )}
        </div>
      </PageContainer>
    </>
  );
};

export default Revisao;
