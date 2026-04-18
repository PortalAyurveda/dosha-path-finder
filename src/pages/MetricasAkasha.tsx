import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { MessageCircle, Users, Repeat, BarChart3, Trophy } from "lucide-react";
import { C, SERIF, SANS, LEAF, fmtN } from "@/components/metricas/theme";
import {
  useLatestDate,
  useSnapshot,
  useAkashaEvolucaoDiaria,
  useAkashaDistribuicaoHoras,
  type Snapshot,
} from "@/components/metricas/useMetricasData";
import MetricasShell from "@/components/metricas/MetricasShell";

const tooltipStyle: React.CSSProperties = {
  background: C.card,
  border: `1px solid ${C.border}`,
  borderRadius: 12,
  fontFamily: SANS,
  fontSize: 12,
  color: C.primary,
};

const KpiCard = ({
  label,
  value,
  unit,
  detail,
  icon,
}: {
  label: string;
  value: string;
  unit?: string;
  detail?: string;
  icon: React.ReactNode;
}) => (
  <div
    className="p-5 flex flex-col gap-2.5"
    style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: LEAF }}
  >
    <div className="flex items-center justify-between">
      <span
        className="text-[11px] font-bold uppercase tracking-wider"
        style={{ color: C.akasha, fontFamily: SANS }}
      >
        {label}
      </span>
      <span style={{ color: C.akasha }}>{icon}</span>
    </div>

    <div className="flex items-baseline gap-1.5 flex-wrap">
      <span
        className="font-bold tabular-nums leading-none"
        style={{ fontFamily: SERIF, color: C.primary, fontSize: "32px" }}
      >
        {value}
      </span>
      {unit && (
        <span
          className="text-[11px] font-semibold"
          style={{ color: C.muted, fontFamily: SANS }}
        >
          {unit}
        </span>
      )}
    </div>

    {detail && (
      <span className="text-[12px] leading-snug" style={{ color: C.muted, fontFamily: SANS }}>
        {detail}
      </span>
    )}
  </div>
);

const ChartShell = ({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) => (
  <section
    className="p-5 md:p-7 space-y-4"
    style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: LEAF }}
  >
    <header>
      <h2 className="font-bold mb-1" style={{ fontFamily: SERIF, color: C.primary, fontSize: "20px" }}>
        {title}
      </h2>
      {subtitle && (
        <p className="text-sm" style={{ color: C.muted, fontFamily: SANS }}>
          {subtitle}
        </p>
      )}
    </header>
    {children}
  </section>
);



const MetricasAkasha = () => {
  const { data: date } = useLatestDate();
  const { data: snaps, isLoading } = useSnapshot(date ?? null, "akasha");
  const { data: diasFull, isLoading: loadingDias } = useAkashaEvolucaoDiaria();
  const { data: horasFull, isLoading: loadingHoras } = useAkashaDistribuicaoHoras();

  const get = (id: string): Snapshot | undefined =>
    snaps?.find((s) => s.metrica_id === id);

  // Formata dias em "DD/MM"
  const dias = useMemo(
    () =>
      (diasFull ?? []).map((d) => {
        // d.dia vem como "YYYY-MM-DD"
        const parts = d.dia.split("-");
        const diaLabel = parts.length === 3 ? `${parts[2]}/${parts[1]}` : d.dia;
        return { ...d, diaLabel };
      }),
    [diasFull],
  );

  const horas = useMemo(
    () =>
      (horasFull ?? []).map((h) => ({
        ...h,
        horaLabel: `${h.hora}h`,
      })),
    [horasFull],
  );

  const horaPico = useMemo(() => {
    if (horas.length === 0) return null;
    return horas.reduce((a, b) => (b.percentual > a.percentual ? b : a));
  }, [horas]);

  const horaPicoText = horaPico ? `${horaPico.hora}h` : (get("AKASHA_HORA_PICO")?.descricao ?? null);
  const totalMsgs = get("AKASHA_TOTAL_MSGS")?.descricao ?? null;
  const totalUsers = get("AKASHA_USUARIOS_UNICOS")?.descricao ?? null;
  const retencao = get("AKASHA_RETENCAO_PCT");
  const mediaUso = get("AKASHA_MEDIA_POR_USUARIO")?.descricao ?? null;
  const picoUser = get("AKASHA_PICO_USUARIO")?.descricao ?? null;

  if (isLoading) {
    return (
      <MetricasShell
        title="Akasha IA | Estatísticas | Portal Ayurveda"
        description="Métricas da nossa IA Akasha: volume, retenção, engajamento e horários de pico."
        canonicalPath="/metricas/akasha"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-32 animate-pulse"
                style={{ background: `${C.border}80`, borderRadius: LEAF }}
              />
            ))}
          </div>
          <div className="h-80 animate-pulse" style={{ background: `${C.border}80`, borderRadius: LEAF }} />
          <div className="h-80 animate-pulse" style={{ background: `${C.border}80`, borderRadius: LEAF }} />
        </div>
      </MetricasShell>
    );
  }

  return (
    <MetricasShell
      title="Akasha IA | Estatísticas | Portal Ayurveda"
      description="Métricas da nossa IA Akasha: volume, retenção, engajamento e horários de pico."
      canonicalPath="/metricas/akasha"
    >
      <div className="space-y-6 animate-fade-in">
        {/* Cabeçalho da seção */}
        <div className="space-y-1">
          <h2 className="font-bold" style={{ fontFamily: SERIF, color: C.primary, fontSize: "24px" }}>
            Akasha — Métricas da nossa IA
          </h2>
          <p className="text-sm" style={{ color: C.muted, fontFamily: SANS }}>
            Comportamento, Retenção e Volume de Interações
          </p>
        </div>

        {/* Bloco 1: KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <KpiCard
            label="Volume Total"
            value={fmtN(totalMsgs ? Number(totalMsgs) : null)}
            unit="mensagens"
            detail="Carga processada pela Akasha"
            icon={<MessageCircle className="w-5 h-5" />}
          />
          <KpiCard
            label="Usuários Atendidos"
            value={fmtN(totalUsers ? Number(totalUsers) : null)}
            unit="únicos"
            detail="Usuários distintos"
            icon={<Users className="w-5 h-5" />}
          />
          <KpiCard
            label="Retenção (>7 dias)"
            value={
              retencao?.percentual != null
                ? `${retencao.percentual.toFixed(1).replace(".", ",")}%`
                : retencao?.descricao
                  ? `${retencao.descricao}%`
                  : "—"
            }
            detail="Retornaram após a 1ª semana"
            icon={<Repeat className="w-5 h-5" />}
          />
          <KpiCard
            label="Média de Uso"
            value={mediaUso ?? "—"}
            unit="msgs/usuário"
            icon={<BarChart3 className="w-5 h-5" />}
          />
          <KpiCard
            label="Engajamento Máximo"
            value={fmtN(picoUser ? Number(picoUser) : null)}
            unit="msgs de 1 usuário"
            detail="Pico de confiança clínica no chatbot"
            icon={<Trophy className="w-5 h-5" />}
          />
        </div>

        {/* Bloco 2: Evolução diária */}
        <ChartShell
          title="Evolução Diária — Últimos 30 dias"
          subtitle="Mensagens processadas e usuários ativos por dia"
        >
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dias} margin={{ top: 8, right: 16, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="diaLabel" tick={{ fontSize: 11, fill: C.muted, fontFamily: SANS }} />
              <YAxis yAxisId="left" tick={{ fontSize: 11, fill: C.muted, fontFamily: SANS }} />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 11, fill: C.muted, fontFamily: SANS }}
              />
              <Tooltip contentStyle={tooltipStyle} />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="msgs"
                name="Mensagens"
                stroke={C.akasha}
                strokeWidth={2.5}
                dot={{ r: 3, fill: C.akasha }}
                activeDot={{ r: 6 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="usuarios"
                name="Usuários ativos"
                stroke={C.accent}
                strokeWidth={2.5}
                dot={{ r: 3, fill: C.accent }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-center gap-5 text-xs" style={{ color: C.muted, fontFamily: SANS }}>
            <span className="inline-flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ background: C.akasha }} /> Mensagens
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ background: C.accent }} /> Usuários ativos
            </span>
          </div>
        </ChartShell>

        {/* Bloco 3: Horários de pico */}
        <ChartShell
          title="Distribuição por Horário do Dia"
          subtitle={
            horaPicoText
              ? `Hora de pico: ${horaPicoText} — concentração máxima de conversas`
              : "Concentração das conversas ao longo das 24h"
          }
        >
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={horas} margin={{ top: 8, right: 16, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="picoGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={C.akasha} stopOpacity={0.45} />
                  <stop offset="100%" stopColor={C.akasha} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="horaLabel" tick={{ fontSize: 11, fill: C.muted, fontFamily: SANS }} />
              <YAxis
                tick={{ fontSize: 11, fill: C.muted, fontFamily: SANS }}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(v: number) => [`${v}%`, "Mensagens"]}
              />
              <Area
                type="monotone"
                dataKey="percentual"
                name="% das mensagens"
                stroke={C.akasha}
                strokeWidth={2.5}
                fill="url(#picoGrad)"
              />
              {horaPico && (
                <ReferenceDot
                  x={horaPico.horaLabel}
                  y={horaPico.percentual}
                  r={7}
                  fill={C.accent}
                  stroke={C.primary}
                  strokeWidth={2}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </ChartShell>
      </div>
    </MetricasShell>
  );
};

export default MetricasAkasha;
