import { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { fetchMetricas, type MetricasData } from "@/lib/metricasFetch";
import { HBar, VBars } from "@/components/metricas/Bars";

// ─── Paleta exata do briefing ───
const C = {
  primary: "#352F54",
  vata: "#6B8AFF",
  pitta: "#FF7676",
  kapha: "#4ADE80",
  accent: "#FACC15",
  bg: "#FAF8F4",
  card: "#ffffff",
  border: "#EDE8F5",
  muted: "#7C7189",
  akasha: "#9b73ad",
};

const SERIF = "'Roboto Serif', serif";
const SANS = "'DM Sans', sans-serif";

const card = "rounded-[20px] border bg-white";
const cardStyle: React.CSSProperties = { borderColor: C.border };

const fmt = (n: number | null | undefined) =>
  n == null ? "—" : n.toLocaleString("pt-BR");

const fmtDate = (iso: string | null) => {
  if (!iso) return "—";
  try {
    return new Date(iso + "T00:00:00").toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
};

const doshaColor = (label: string): string => {
  const l = label.toLowerCase();
  const has = (k: string) => l.includes(k);
  if (l === "vata" || l === "pitta" || l === "kapha") {
    return l === "vata" ? C.vata : l === "pitta" ? C.pitta : C.kapha;
  }
  // Combinados → gradiente das duas cores
  const colors: string[] = [];
  if (has("vata")) colors.push(C.vata);
  if (has("pitta")) colors.push(C.pitta);
  if (has("kapha")) colors.push(C.kapha);
  if (colors.length >= 2)
    return `linear-gradient(90deg, ${colors[0]} 0%, ${colors[1]} 100%)`;
  return C.primary;
};

const agniColor = (label: string): string => {
  const l = label.toLowerCase();
  if (l.includes("irregular") || l.includes("inconstante")) return C.vata;
  if (l.includes("forte") || l.includes("intensa")) return C.pitta;
  if (l.includes("fraca") || l.includes("lenta")) return C.kapha;
  if (l.includes("constante") || l.includes("boa")) return C.accent;
  return C.muted;
};

// ─── KPI card ───
const Kpi = ({
  value,
  label,
  bg = "white",
  fg = C.primary,
}: {
  value: string;
  label: string;
  bg?: string;
  fg?: string;
}) => (
  <div
    className="rounded-[20px] p-5 border flex flex-col gap-1"
    style={{ background: bg, borderColor: bg === "white" ? C.border : "transparent", color: fg }}
  >
    <div className="text-3xl md:text-4xl font-bold tabular-nums" style={{ fontFamily: SERIF }}>
      {value}
    </div>
    <div
      className="text-xs uppercase tracking-wider opacity-90"
      style={{ fontFamily: SANS }}
    >
      {label}
    </div>
  </div>
);

// ─── Section title ───
const SectionTitle = ({ kicker, title }: { kicker: string; title: string }) => (
  <div className="mb-6">
    <p className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: C.muted, fontFamily: SANS }}>
      {kicker}
    </p>
    <h2
      className="text-2xl md:text-[28px] font-bold mt-1"
      style={{ color: C.primary, fontFamily: SERIF }}
    >
      {title}
    </h2>
  </div>
);

// ─── FadeIn on viewport ───
const FadeIn = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(16px)",
        transition: `opacity 600ms ease-out ${delay}ms, transform 600ms ease-out ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
};

// ─── Header com pattern SVG ───
const HeaderHero = ({ kpis }: { kpis: MetricasData["kpis"] }) => (
  <header
    className="relative overflow-hidden"
    style={{ background: `linear-gradient(135deg, ${C.primary} 0%, #4a3d7a 100%)` }}
  >
    {/* Pattern SVG */}
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        opacity: 0.08,
        backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'><circle cx='10' cy='10' r='1.5' fill='white'/><circle cx='40' cy='25' r='2' fill='white'/><circle cx='65' cy='10' r='1' fill='white'/><circle cx='20' cy='55' r='1.8' fill='white'/><circle cx='55' cy='60' r='2.2' fill='white'/><circle cx='75' cy='45' r='1.2' fill='white'/></svg>")`,
      }}
    />
    <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-16">
      <h1
        className="text-3xl md:text-5xl font-bold text-white"
        style={{ fontFamily: SERIF }}
        dangerouslySetInnerHTML={{
          __html: 'Portal das <em style="font-style:italic;font-weight:500">Métricas</em>',
        }}
      />
      <p
        className="text-white/80 mt-3 max-w-2xl text-sm md:text-base"
        style={{ fontFamily: SANS }}
      >
        Inteligência Clínica e Comportamental · Base real de diagnósticos ayurvédicos
      </p>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-8">
        <Kpi value={fmt(kpis.total)} label="Diagnósticos Realizados" />
        <Kpi value={fmt(kpis.vata)} label="Vatas na Base" bg={C.vata} fg="#ffffff" />
        <Kpi value={fmt(kpis.pitta)} label="Pittas na Base" bg={C.pitta} fg="#ffffff" />
        <Kpi value={fmt(kpis.kapha)} label="Kaphas na Base" bg={C.kapha} fg="#06381a" />
        <Kpi value={fmt(kpis.akashaMsgs)} label="Interações com a Akasha" bg={C.accent} fg="#3a2e00" />
      </div>
    </div>
  </header>
);

// ─── Loading state ───
const LoadingPulse = () => (
  <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-6">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className={`${card} p-8 animate-pulse h-48`} style={cardStyle} />
    ))}
  </div>
);

// ──────────────────────────── PAGE ────────────────────────────

const Metricas = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["metricas-portal"],
    queryFn: fetchMetricas,
    staleTime: 60 * 60 * 1000,
    gcTime: 2 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  return (
    <>
      <Helmet>
        <title>Portal das Métricas — Inteligência Clínica Ayurveda</title>
        <meta
          name="description"
          content="Inteligência Clínica e Comportamental sobre uma base real de diagnósticos ayurvédicos: distribuição de doshas, agni, sintomas, alimentos e interações com a IA Akasha."
        />
        <link rel="canonical" href="https://www.portalayurveda.com/metricas" />
      </Helmet>

      <main style={{ background: C.bg, fontFamily: SANS }} className="min-h-screen">
        <HeaderHero kpis={data?.kpis ?? { total: 0, vata: 0, pitta: 0, kapha: 0, akashaMsgs: 0 }} />

        {isLoading || !data ? (
          <LoadingPulse />
        ) : error ? (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
            <div className={`${card} p-8 text-center`} style={cardStyle}>
              <p style={{ color: C.muted }}>Não foi possível carregar as métricas no momento.</p>
            </div>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 md:py-14 space-y-10">
            {/* SEÇÃO 1 — DISTRIBUIÇÃO */}
            <FadeIn>
              <section className={`${card} p-6 md:p-8`} style={cardStyle}>
                <SectionTitle kicker="Seção 1" title="Quem é o Público Ayurvédico" />
                <div className="space-y-4">
                  {data.distDoshas.map((d) => {
                    const max = Math.max(...data.distDoshas.map((x) => x.pct ?? 0), 1);
                    return (
                      <HBar
                        key={d.label}
                        label={d.label}
                        pct={d.pct ?? 0}
                        n={d.n}
                        fillPct={((d.pct ?? 0) / max) * 100}
                        color={doshaColor(d.label)}
                      />
                    );
                  })}
                </div>
              </section>
            </FadeIn>

            {/* SEÇÃO 2 — AGNI */}
            <FadeIn>
              <section className={`${card} p-6 md:p-8`} style={cardStyle}>
                <SectionTitle kicker="Seção 2" title="Agni — O Fogo Digestivo da Base" />
                {(() => {
                  const desequilibrio = data.agni
                    .filter((a) => !/constante|^digestão constante|^digest..o constante|boa$/i.test(a.label))
                    .reduce((sum, a) => sum + (a.pct ?? 0), 0);
                  return (
                    <div
                      className="rounded-2xl p-5 mb-6"
                      style={{ background: `${C.pitta}14`, border: `1px solid ${C.pitta}33` }}
                    >
                      <p className="text-sm" style={{ color: C.muted, fontFamily: SANS }}>
                        Insight da base
                      </p>
                      <p
                        className="text-xl md:text-2xl font-bold mt-1"
                        style={{ color: C.primary, fontFamily: SERIF }}
                      >
                        <span style={{ color: C.pitta }}>{desequilibrio.toFixed(1)}%</span> da base tem
                        digestão irregular ou desequilibrada
                      </p>
                    </div>
                  );
                })()}
                <div className="space-y-3">
                  {data.agni.map((a) => {
                    const max = Math.max(...data.agni.map((x) => x.pct ?? 0), 1);
                    return (
                      <HBar
                        key={a.label}
                        label={a.label}
                        pct={a.pct ?? 0}
                        n={a.n}
                        fillPct={((a.pct ?? 0) / max) * 100}
                        color={agniColor(a.label)}
                      />
                    );
                  })}
                </div>
              </section>
            </FadeIn>

            {/* SEÇÃO 3 — RITMO DE TESTES */}
            <FadeIn>
              <section className={`${card} p-6 md:p-8`} style={cardStyle}>
                <SectionTitle kicker="Seção 3" title="Aderência ao Portal — últimos 30 dias" />
                {data.testesDiario.length === 0 ? (
                  <p className="text-sm" style={{ color: C.muted }}>
                    Sem dados nos últimos 30 dias.
                  </p>
                ) : (
                  <VBars
                    data={data.testesDiario.map((t) => ({
                      label: new Date(t.dia + "T00:00:00").toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                      }),
                      value: t.total,
                    }))}
                    color={C.vata}
                    height={200}
                  />
                )}
              </section>
            </FadeIn>

            {/* SEÇÃO 4 — IMC POR DOSHA */}
            <FadeIn>
              <section>
                <SectionTitle kicker="Seção 4" title="Corpo e Constituição" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {data.imcDosha.map((d) => {
                    const cor =
                      d.dosha === "Vata" ? C.vata : d.dosha === "Pitta" ? C.pitta : C.kapha;
                    const sub: Record<string, string> = {
                      Vata: "Constituição leve e delgada",
                      Pitta: "Constituição média e musculosa",
                      Kapha: "Constituição robusta e densa",
                    };
                    // escala 18–35 → 0–100%
                    const pos = Math.max(0, Math.min(100, ((d.imc - 18) / (35 - 18)) * 100));
                    return (
                      <div key={d.dosha} className={`${card} p-6`} style={cardStyle}>
                        <div className="flex items-baseline justify-between">
                          <h3 className="text-lg font-bold" style={{ color: cor, fontFamily: SERIF }}>
                            {d.dosha}
                          </h3>
                          <span className="text-xs" style={{ color: C.muted }}>
                            n = {fmt(d.n)}
                          </span>
                        </div>
                        <p className="text-xs mt-1" style={{ color: C.muted }}>
                          {sub[d.dosha]}
                        </p>
                        <div className="text-5xl font-bold mt-4 tabular-nums" style={{ color: C.primary, fontFamily: SERIF }}>
                          {d.imc.toFixed(1)}
                        </div>
                        <p className="text-[11px] uppercase tracking-wider" style={{ color: C.muted }}>
                          IMC médio
                        </p>
                        <div className="mt-5">
                          <div className="relative h-2 rounded-full" style={{ background: C.border }}>
                            <div
                              className="absolute -top-1 w-4 h-4 rounded-full border-2 border-white shadow"
                              style={{ left: `calc(${pos}% - 8px)`, background: cor }}
                            />
                          </div>
                          <div
                            className="flex justify-between text-[10px] mt-1.5"
                            style={{ color: C.muted, fontFamily: SANS }}
                          >
                            <span>18</span>
                            <span>26.5</span>
                            <span>35</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </FadeIn>

            {/* SEÇÃO 5 — IDADE × DOSHA (tabs) */}
            <FadeIn>
              <IdadeSection idadeDosha={data.idadeDosha} />
            </FadeIn>

            {/* SEÇÃO 6 — SINTOMAS */}
            <FadeIn>
              <section>
                <SectionTitle kicker="Seção 6" title="O Que Adoece Cada Dosha" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(["Vata", "Pitta", "Kapha"] as const).map((d) => {
                    const cor = d === "Vata" ? C.vata : d === "Pitta" ? C.pitta : C.kapha;
                    const items = data.sintomas[d] ?? [];
                    const max = Math.max(...items.map((x) => x.pct ?? 0), 1);
                    return (
                      <div key={d} className={`${card} p-5 md:p-6`} style={cardStyle}>
                        <h3 className="text-lg font-bold mb-4" style={{ color: cor, fontFamily: SERIF }}>
                          {d}
                        </h3>
                        <div className="space-y-3">
                          {items.length === 0 && (
                            <p className="text-xs" style={{ color: C.muted }}>
                              Sem dados.
                            </p>
                          )}
                          {items.map((s) => (
                            <HBar
                              key={s.label}
                              label={s.label}
                              pct={s.pct ?? 0}
                              fillPct={((s.pct ?? 0) / max) * 100}
                              color={cor}
                              showN={false}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </FadeIn>

            {/* SEÇÃO 7 — ALIMENTOS */}
            <FadeIn>
              <section>
                <SectionTitle kicker="Seção 7" title="O Que Mais Agrava Cada Dosha" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(["Vata", "Pitta", "Kapha"] as const).map((d) => {
                    const cor = d === "Vata" ? C.vata : d === "Pitta" ? C.pitta : C.kapha;
                    const items = data.alimentos[d] ?? [];
                    const max = Math.max(...items.map((x) => x.pct ?? 0), 1);
                    return (
                      <div key={d} className={`${card} p-5 md:p-6`} style={cardStyle}>
                        <h3 className="text-lg font-bold mb-4" style={{ color: cor, fontFamily: SERIF }}>
                          {d}
                        </h3>
                        <div className="space-y-3">
                          {items.length === 0 && (
                            <p className="text-xs" style={{ color: C.muted }}>
                              Sem dados.
                            </p>
                          )}
                          {items.map((s) => (
                            <HBar
                              key={s.label}
                              label={s.label}
                              pct={s.pct ?? 0}
                              fillPct={((s.pct ?? 0) / max) * 100}
                              color={cor}
                              showN={false}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </FadeIn>

            {/* SEÇÃO 8 — AKASHA */}
            <FadeIn>
              <section>
                <SectionTitle kicker="Seção 8" title="🤖 Akasha — Inteligência Artificial" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                  {[
                    { v: fmt(data.akashaKpi.totalMsgs), l: "Mensagens totais" },
                    { v: fmt(data.akashaKpi.usuariosUnicos), l: "Usuários únicos" },
                    { v: fmt(data.akashaKpi.mediaPorUsuario), l: "Média / usuário" },
                    { v: fmt(data.akashaKpi.picoUsuario), l: "Pico de um usuário" },
                  ].map((k) => (
                    <div key={k.l} className={`${card} p-5`} style={cardStyle}>
                      <div
                        className="text-3xl font-bold tabular-nums"
                        style={{ color: C.akasha, fontFamily: SERIF }}
                      >
                        {k.v}
                      </div>
                      <p className="text-xs mt-1" style={{ color: C.muted }}>
                        {k.l}
                      </p>
                    </div>
                  ))}
                </div>
                <div className={`${card} p-6 md:p-8`} style={cardStyle}>
                  <h3 className="text-sm font-bold uppercase tracking-wider mb-1" style={{ color: C.muted }}>
                    Atividade nos últimos 30 dias
                  </h3>
                  <p className="text-xs mb-5" style={{ color: C.muted }}>
                    Barras = mensagens humanas · Linha fina = usuários ativos
                  </p>
                  {data.akashaDiario.length === 0 ? (
                    <p className="text-sm" style={{ color: C.muted }}>
                      Sem atividade registrada.
                    </p>
                  ) : (
                    <VBars
                      data={data.akashaDiario.map((d) => ({
                        label: new Date(d.dia + "T00:00:00").toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                        }),
                        value: d.msgs,
                        sub: d.usuariosAtivos,
                      }))}
                      color={C.akasha}
                      subColor={C.primary}
                      height={220}
                    />
                  )}
                </div>
              </section>
            </FadeIn>

            {/* FOOTER da página */}
            <FadeIn>
              <div
                className="text-center text-xs py-6 border-t"
                style={{ color: C.muted, borderColor: C.border, fontFamily: SANS }}
              >
                Dados atualizados em <strong style={{ color: C.primary }}>{fmtDate(data.dataCalculo)}</strong> · Base real de diagnósticos · Portal Ayurveda
              </div>
            </FadeIn>
          </div>
        )}
      </main>
    </>
  );
};

// ─── Idade × Dosha (subcomponente com tabs) ───
const IdadeSection = ({ idadeDosha }: { idadeDosha: MetricasData["idadeDosha"] }) => {
  const [tab, setTab] = useState<"Vata" | "Pitta" | "Kapha">("Vata");
  const items = idadeDosha[tab] ?? [];
  const top = [...items].sort((a, b) => b.pct - a.pct)[0];
  const cor = tab === "Vata" ? C.vata : tab === "Pitta" ? C.pitta : C.kapha;

  return (
    <section className={`${card} p-6 md:p-8`} style={cardStyle}>
      <SectionTitle kicker="Seção 5" title="Como a Idade Distribui os Doshas" />
      <div className="flex gap-2 mb-5">
        {(["Vata", "Pitta", "Kapha"] as const).map((d) => {
          const active = tab === d;
          const c = d === "Vata" ? C.vata : d === "Pitta" ? C.pitta : C.kapha;
          return (
            <button
              key={d}
              onClick={() => setTab(d)}
              className="px-4 py-2 rounded-full text-sm font-semibold transition"
              style={{
                background: active ? c : "transparent",
                color: active ? "#fff" : c,
                border: `1px solid ${c}`,
                fontFamily: SANS,
              }}
            >
              {d}
            </button>
          );
        })}
      </div>
      <div className="overflow-hidden rounded-xl border" style={{ borderColor: C.border }}>
        <table className="w-full text-sm" style={{ fontFamily: SANS }}>
          <thead style={{ background: `${cor}10` }}>
            <tr>
              <th className="text-left px-4 py-3 font-semibold" style={{ color: C.primary }}>
                Faixa etária
              </th>
              <th className="text-right px-4 py-3 font-semibold" style={{ color: C.primary }}>
                Registros
              </th>
              <th className="text-right px-4 py-3 font-semibold" style={{ color: C.primary }}>
                % do dosha
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, i) => (
              <tr key={it.faixa} style={{ borderTop: i ? `1px solid ${C.border}` : "none" }}>
                <td className="px-4 py-3" style={{ color: C.primary }}>
                  {it.faixa}
                </td>
                <td className="px-4 py-3 text-right tabular-nums" style={{ color: C.muted }}>
                  {it.n.toLocaleString("pt-BR")}
                </td>
                <td className="px-4 py-3 text-right tabular-nums font-semibold" style={{ color: cor }}>
                  {it.pct.toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {top && (
        <p className="text-sm mt-4" style={{ color: C.muted, fontFamily: SANS }}>
          A faixa <strong style={{ color: cor }}>{top.faixa}</strong> concentra{" "}
          <strong style={{ color: C.primary }}>{top.pct.toFixed(1)}%</strong> dos {tab}s da base.
        </p>
      )}
    </section>
  );
};

export default Metricas;
