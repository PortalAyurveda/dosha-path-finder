import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Users,
  Activity,
  Scale,
  Sparkles,
  PieChart,
  Brain,
  Calendar,
  MapPin,
  type LucideIcon,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const C = {
  primary: "#352F54",
  vata: "#6B8AFF",
  pitta: "#FF7676",
  kapha: "#9ED88B",
  bg: "#FFFFFF",
  border: "#EDE8F5",
  muted: "#7C7189",
};

const SERIF = "'Roboto Serif', serif";
const SANS = "'DM Sans', sans-serif";
const LEAF = "4px 20px 4px 20px";

type Row = {
  testes_7d: number | null;
  var_vata: number | null;
  var_pitta: number | null;
  var_kapha: number | null;
  imc_vata: number | null;
  imc_pitta: number | null;
  imc_kapha: number | null;
  akasha_hoje: number | null;
  pct_vata_dom: number | null;
  pct_pitta_dom: number | null;
  pct_kapha_dom: number | null;
  sintoma_vata: string | null;
  sintoma_pitta: string | null;
  sintoma_kapha: string | null;
  idade_vata: number | null;
  idade_pitta: number | null;
  idade_kapha: number | null;
  terapeutas: number | null;
  frase_nugget: string | null;
};

const fmtNum = (n: number | null | undefined) =>
  n == null ? "—" : Number(n).toLocaleString("pt-BR");
const fmtPctSigned = (n: number | null | undefined) => {
  if (n == null) return "—";
  const v = Number(n);
  const s = `${v > 0 ? "+" : ""}${v.toFixed(1).replace(".", ",")}%`;
  return s;
};
const fmtDec = (n: number | null | undefined) =>
  n == null ? "—" : Number(n).toFixed(1).replace(".", ",");

const CardShell = ({
  children,
  tint,
}: {
  children: React.ReactNode;
  tint?: string;
}) => (
  <div
    className="p-2.5 flex flex-col gap-0.5 border items-center text-center"
    style={{
      borderRadius: LEAF,
      borderColor: C.border,
      background: tint ?? "#FFFFFF",
      fontFamily: SANS,
    }}
  >
    {children}
  </div>
);

const CardHeader = ({
  icon: Icon,
  label,
}: {
  icon: LucideIcon;
  label: string;
}) => (
  <div className="flex items-center justify-center gap-1.5 w-full">
    <Icon size={16} color={C.primary} />
    <span
      className="text-[10px] font-bold uppercase tracking-wider truncate"
      style={{ color: C.muted }}
    >
      {label}
    </span>
  </div>
);

const BigNumber = ({ value, sub }: { value: string; sub: string }) => (
  <div className="flex flex-col items-center text-center">
    <span
      className="text-[26px] leading-none font-bold"
      style={{ color: C.primary, fontFamily: SERIF }}
    >
      {value}
    </span>
    <span className="text-[11px] mt-0.5 leading-tight" style={{ color: C.muted }}>
      {sub}
    </span>
  </div>
);

const DoshaLine = ({
  color,
  name,
  value,
  valueColor,
}: {
  color: string;
  name: string;
  value: React.ReactNode;
  valueColor?: string;
}) => (
  <div className="flex items-center justify-center gap-1.5">
    <span
      className="w-2 h-2 rounded-full shrink-0"
      style={{ background: color }}
    />
    <span
      className="text-[11px] font-medium"
      style={{ color: C.primary }}
    >
      {name}
    </span>
    <span
      className="text-[11px] font-bold truncate"
      style={{ color: valueColor ?? C.primary }}
    >
      {value}
    </span>
  </div>
);

const DoshaPie = ({
  vata,
  pitta,
  kapha,
}: {
  vata: number;
  pitta: number;
  kapha: number;
}) => {
  const total = Math.max(0.0001, vata + pitta + kapha);
  const v = (vata / total) * 100;
  const p = (pitta / total) * 100;
  return (
    <div
      className="relative w-9 h-9 rounded-full shrink-0"
      style={{
        background: `conic-gradient(${C.vata} 0 ${v}%, ${C.pitta} ${v}% ${v + p}%, ${C.kapha} ${v + p}% 100%)`,
      }}
    >
      <div
        className="absolute inset-1 rounded-full bg-white"
        style={{ border: `1px solid ${C.border}` }}
      />
    </div>
  );
};

const TINTS = ["#EEF2FF", "#FFF1F1", "#FFFBEB", "#F4EEFA"];

const SetA = ({ d }: { d: Row }) => (
  <div className="grid grid-cols-4 gap-2">
    <CardShell tint={TINTS[0]}>
      <CardHeader icon={Users} label="Testes da semana" />
      <BigNumber value={fmtNum(d.testes_7d)} sub="testes 7d" />
    </CardShell>
    <CardShell tint={TINTS[1]}>
      <CardHeader icon={Activity} label="Tendência sazonal" />
      <div className="flex flex-col gap-0.5">
        <DoshaLine
          color={C.vata}
          name="V"
          value={fmtPctSigned(d.var_vata)}
          valueColor={(d.var_vata ?? 0) >= 0 ? "#16a34a" : "#dc2626"}
        />
        <DoshaLine
          color={C.pitta}
          name="P"
          value={fmtPctSigned(d.var_pitta)}
          valueColor={(d.var_pitta ?? 0) >= 0 ? "#16a34a" : "#dc2626"}
        />
        <DoshaLine
          color={C.kapha}
          name="K"
          value={fmtPctSigned(d.var_kapha)}
          valueColor={(d.var_kapha ?? 0) >= 0 ? "#16a34a" : "#dc2626"}
        />
      </div>
    </CardShell>
    <CardShell tint={TINTS[2]}>
      <CardHeader icon={Scale} label="Biometria do Dosha" />
      <div className="flex flex-col gap-0.5">
        <DoshaLine color={C.vata} name="V" value={fmtDec(d.imc_vata)} />
        <DoshaLine color={C.pitta} name="P" value={fmtDec(d.imc_pitta)} />
        <DoshaLine color={C.kapha} name="K" value={fmtDec(d.imc_kapha)} />
      </div>
    </CardShell>
    <CardShell tint={TINTS[3]}>
      <CardHeader icon={Sparkles} label="Consultas Akasha" />
      <BigNumber value={fmtNum(d.akasha_hoje)} sub="consultas hoje" />
    </CardShell>
  </div>
);


const SetB = ({ d }: { d: Row }) => (
  <div className="grid grid-cols-4 gap-2">
    <CardShell tint={TINTS[0]}>
      <CardHeader icon={PieChart} label="Perfil predominante" />
      <div className="flex flex-col gap-0.5">
        <DoshaLine color={C.vata} name="V" value={`${fmtDec(d.pct_vata_dom)}%`} />
        <DoshaLine color={C.pitta} name="P" value={`${fmtDec(d.pct_pitta_dom)}%`} />
        <DoshaLine color={C.kapha} name="K" value={`${fmtDec(d.pct_kapha_dom)}%`} />
      </div>
    </CardShell>
    <CardShell tint={TINTS[1]}>
      <CardHeader icon={Brain} label="Sintomas principais" />
      <div className="flex flex-col gap-0.5">
        <DoshaLine color={C.vata} name="V" value={d.sintoma_vata ?? "—"} />
        <DoshaLine color={C.pitta} name="P" value={d.sintoma_pitta ?? "—"} />
        <DoshaLine color={C.kapha} name="K" value={d.sintoma_kapha ?? "—"} />
      </div>
    </CardShell>
    <CardShell tint={TINTS[2]}>
      <CardHeader icon={Calendar} label="Perfil etário" />
      <div className="flex flex-col gap-0.5">
        <DoshaLine color={C.vata} name="V" value={`${fmtNum(d.idade_vata)}a`} />
        <DoshaLine color={C.pitta} name="P" value={`${fmtNum(d.idade_pitta)}a`} />
        <DoshaLine color={C.kapha} name="K" value={`${fmtNum(d.idade_kapha)}a`} />
      </div>
    </CardShell>
    <CardShell tint={TINTS[3]}>
      <CardHeader icon={MapPin} label="Terapeutas no Portal" />

      <BigNumber value={fmtNum(d.terapeutas)} sub="no portal" />
    </CardShell>
  </div>
);

const MetricasMiniBanner = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["home-metricas-index"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("metricas_index")
        .select(
          "testes_7d, var_vata, var_pitta, var_kapha, imc_vata, imc_pitta, imc_kapha, akasha_hoje, pct_vata_dom, pct_pitta_dom, pct_kapha_dom, sintoma_vata, sintoma_pitta, sintoma_kapha, idade_vata, idade_pitta, idade_kapha, terapeutas, frase_nugget",
        )
        .eq("id", 1)
        .maybeSingle();
      if (error) throw error;
      return data as Row | null;
    },
    staleTime: 5 * 60 * 1000,
  });

  const initialSet = useMemo<0 | 1>(() => (Math.random() < 0.5 ? 0 : 1), []);
  const [active, setActive] = useState<0 | 1>(initialSet);
  useEffect(() => setActive(initialSet), [initialSet]);

  if (error) return null;

  return (
    <div
      className="w-full max-w-xl mx-auto bg-card/80 backdrop-blur-sm rounded-3xl border border-border shadow-lg p-4 flex flex-col"
      style={{ overflow: "hidden" }}
    >
      {isLoading || !data ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-4 w-3/4 mx-auto" />
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" style={{ borderRadius: LEAF }} />
            ))}
          </div>
      ) : (
        <>
          <p
            className="text-center text-[13px] leading-snug mb-2 px-2 font-semibold"
            style={{ color: C.primary, fontFamily: SERIF }}
          >
            {data.frase_nugget ?? "Métricas do Portal Ayurveda"}
          </p>
          {active === 0 ? <SetA d={data} /> : <SetB d={data} />}
          <p
            className="text-center italic text-[10px] mt-2 px-2"
            style={{ color: C.muted, fontFamily: SANS }}
          >
            Métricas calculadas diariamente com base no nosso banco de dados.
          </p>
        </>
      )}

    </div>
  );
};

export default MetricasMiniBanner;
