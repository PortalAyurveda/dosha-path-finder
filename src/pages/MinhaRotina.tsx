import { useEffect, useMemo, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as LucideIcons from "lucide-react";
import {
  Star,
  Circle,
  Flame,
  Play,
  ChevronDown,
  ArrowRight,
  AlertTriangle,
  Leaf,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

import PageContainer from "@/components/PageContainer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useUser } from "@/contexts/UserContext";
import { supabase } from "@/integrations/supabase/client";
import { premiumSupabase, type ObjetivoTratamento } from "@/integrations/supabase/premium-client";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import VideoPlayerDialog from "@/components/biblioteca/VideoPlayerDialog";

// ===== Slots =====
type SlotKey =
  | "rotina_manha"
  | "cafe_manha"
  | "lanche_manha"
  | "almoco"
  | "lanche_tarde"
  | "bonus_diario"
  | "jantar"
  | "tonico_noite";

const MEAL_SLOTS: { slot: SlotKey; label: string }[] = [
  { slot: "cafe_manha", label: "café da manhã" },
  { slot: "lanche_manha", label: "lanche da manhã" },
  { slot: "almoco", label: "almoço" },
  { slot: "lanche_tarde", label: "lanche da tarde" },
  { slot: "jantar", label: "jantar" },
  { slot: "tonico_noite", label: "tônico da noite" },
];

const PRACTICE_SLOTS: { slot: SlotKey; label: string }[] = [
  { slot: "rotina_manha", label: "ritual da manhã" },
  { slot: "bonus_diario", label: "bônus do dia" },
];

interface HabitoGloss { habito: string; periodo?: string }
interface GlossarioRotina {
  habitos_diarios: HabitoGloss[] | null;
  alertas_cotidianos: string[] | null;
}

// ===== Types =====
interface RotinaRow {
  id: string;
  dia: number;
  slot: string;
  nugget_id: string | null;
  praticado: boolean | null;
}

interface NuggetJson {
  resumo?: string;
  ingredientes?: { qtd?: string; item?: string }[];
  modo_preparo?: string[];
  dicas?: string;
  efeito_esperado?: string;
  bom_para_agni?: boolean;
  tags?: string[];
  dravya_guna?: {
    rasa?: string[];
    virya?: string;
    gunas?: string[];
    karma?: string[];
    efeito_tecidos?: string;
  };
}

interface Nugget {
  id: string;
  titulo: string;
  icone_lucide: string | null;
  video_id: string | null;
  video_timestamp: string | null;
  vata: number | null;
  pitta: number | null;
  kapha: number | null;
  nugget_json: NuggetJson | null;
}

// ===== Helpers =====
const formatScore = (n: number | null | undefined) => {
  if (n === null || n === undefined) return "0";
  if (n > 0) return `+${n}`;
  if (n < 0) return `−${Math.abs(n)}`;
  return "0";
};

const parseTimestamp = (ts: string | null): number | undefined => {
  if (!ts) return undefined;
  const n = Number(ts);
  if (!Number.isNaN(n)) return n;
  // formato HH:MM:SS ou MM:SS
  const parts = ts.split(":").map(Number);
  if (parts.some(Number.isNaN)) return undefined;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return undefined;
};

// ===== Page =====
const MinhaRotina = () => {
  const { user, loading, doshaResult } = useUser();
  const queryClient = useQueryClient();
  const [diaSelecionado, setDiaSelecionado] = useState<number>(1);

  // Scores + agni do usuário — busca a partir do idPublico ativo
  const { data: doshaInfo } = useQuery({
    queryKey: ["minha-rotina-dosha-info", doshaResult?.idPublico],
    enabled: !!doshaResult?.idPublico,
    queryFn: async () => {
      const { data } = await supabase
        .from("doshas_registros")
        .select("agniPrincipal, vatascore, pittascore, kaphascore")
        .eq("idPublico", doshaResult!.idPublico)
        .maybeSingle();
      return data ?? null;
    },
  });

  const agniInfo = (doshaInfo?.agniPrincipal as string | null) ?? null;

  const agniFracoOuIrregular = useMemo(() => {
    if (!agniInfo) return false;
    return /fraca|irregular/i.test(agniInfo);
  }, [agniInfo]);

  // Análise clínica (objetivos_tratamento) — mesma query usada por DiagnosticoCompleto
  const { data: analise } = useQuery({
    queryKey: ["minha-rotina-analise", user?.email],
    enabled: !!user?.email,
    queryFn: async () => {
      const { data, error } = await premiumSupabase
        .from("objetivos_tratamento")
        .select("*")
        .eq("user_email", user!.email!)
        .eq("status", "ativo")
        .maybeSingle();
      if (error) return null;
      return (data as unknown as ObjetivoTratamento) || null;
    },
    staleTime: 30_000,
  });

  const { data: testeId } = useQuery({
    queryKey: ["rotina-teste-id", doshaResult?.idPublico],
    enabled: !!doshaResult?.idPublico,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("doshas_registros")
        .select("id")
        .eq("idPublico", doshaResult!.idPublico)
        .maybeSingle();
      if (error) throw error;
      return (data?.id as string | undefined) ?? null;
    },
  });

  const { data: rotinaRows } = useQuery({
    queryKey: ["rotina-user", testeId],
    enabled: !!testeId,
    queryFn: async () => {
      const { data, error } = await (supabase
        .from("rotinas_usuario") as any)
        .select("id, dia, slot, nugget_id, praticado")
        .eq("user_id", testeId!);
      if (error) throw error;
      return (data ?? []) as RotinaRow[];
    },
  });

  const { data: nuggets } = useQuery({
    queryKey: ["rotina-nuggets-all"],
    staleTime: 30 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rotina_nuggets")
        .select(
          "id, titulo, icone_lucide, video_id, video_timestamp, vata, pitta, kapha, nugget_json"
        );
      if (error) throw error;
      return (data ?? []) as Nugget[];
    },
  });


  const nuggetsById = useMemo(() => {
    const m = new Map<string, Nugget>();
    (nuggets ?? []).forEach((n) => m.set(n.id, n));
    return m;
  }, [nuggets]);

  // Glossário do dosha do usuário (habitos_diarios + alertas_cotidianos)
  const doshaNome = doshaResult?.doshaprincipal ?? null;
  const { data: glossario } = useQuery<GlossarioRotina | null>({
    queryKey: ["rotina-glossario", doshaNome],
    enabled: !!doshaNome,
    staleTime: 30 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("portal_glossario")
        .select("habitos_diarios, alertas_cotidianos")
        .eq("doshanome", doshaNome!)
        .maybeSingle();
      if (error) return null;
      return (data as unknown as GlossarioRotina) ?? null;
    },
  });

  // Estado local do dia: hábitos do glossário marcados, e alertas "escorreguei"
  const [habitosFeitos, setHabitosFeitos] = useState<Set<string>>(new Set());
  const [alertasEscorregados, setAlertasEscorregados] = useState<Set<string>>(new Set());

  // Reseta o estado local ao trocar de dia
  useEffect(() => {
    setHabitosFeitos(new Set());
    setAlertasEscorregados(new Set());
  }, [diaSelecionado]);

  // Gate de login
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/entrar" replace />;
  }

  // Rotina filtrada do dia
  const rowsDoDia = (rotinaRows ?? []).filter((r) => r.dia === diaSelecionado);
  const rowBySlot = new Map<string, RotinaRow>();
  rowsDoDia.forEach((r) => rowBySlot.set(r.slot, r));

  // Cuidados do glossário em destaque (2-3)
  const habitosGloss = (glossario?.habitos_diarios ?? []).slice(0, 3);
  const alertasGloss = (glossario?.alertas_cotidianos ?? []).slice(0, 3);

  // Contagens
  const praticadosRotina = rowsDoDia.filter((r) => r.praticado === true).length;
  const habitosCount = habitosFeitos.size;
  const totalPossivel =
    MEAL_SLOTS.length + PRACTICE_SLOTS.length + habitosGloss.length;
  const feitosCount = praticadosRotina + habitosCount;
  const progressoPct = totalPossivel > 0 ? (feitosCount / totalPossivel) * 100 : 0;
  const equilibrioDia = feitosCount - alertasEscorregados.size;

  // Toggle de praticado: grava em rotinas_usuario + grava preferência em rotina_favoritos
  const toggleFeito = async (row: RotinaRow) => {
    if (!user) return;
    const key = ["rotina-user", testeId];
    const prev = queryClient.getQueryData<RotinaRow[]>(key) ?? [];
    const novoValor = !row.praticado;
    const next = prev.map((r) => (r.id === row.id ? { ...r, praticado: novoValor } : r));
    queryClient.setQueryData(key, next);

    try {
      const { error } = await (supabase
        .from("rotinas_usuario") as any)
        .update({ praticado: novoValor })
        .eq("id", row.id);
      if (error) throw error;

      // Preferência (estrela-fixa): só grava, não lê.
      if (row.nugget_id) {
        if (novoValor) {
          await (supabase.from("rotina_favoritos") as any)
            .upsert(
              { user_id: user.id, nugget_id: row.nugget_id },
              { onConflict: "user_id,nugget_id", ignoreDuplicates: true }
            );
        } else {
          await (supabase.from("rotina_favoritos") as any)
            .delete()
            .eq("user_id", user.id)
            .eq("nugget_id", row.nugget_id);
        }
      }
    } catch (e) {
      queryClient.setQueryData(key, prev);
      toast({ title: "Não consegui salvar", variant: "destructive" });
    }
  };

  const toggleHabito = (habito: string) => {
    setHabitosFeitos((prev) => {
      const next = new Set(prev);
      if (next.has(habito)) next.delete(habito);
      else next.add(habito);
      return next;
    });
  };

  const toggleAlerta = (alerta: string) => {
    setAlertasEscorregados((prev) => {
      const next = new Set(prev);
      if (next.has(alerta)) next.delete(alerta);
      else next.add(alerta);
      return next;
    });
  };

  return (
    <PageContainer
      title="Minha rotina"
      description="Seu planner ayurvédico diário, slot a slot."
    >
      {/* Moldura: cabeçalho de contexto da semana */}
      <SemanaHeader
        agniPrincipal={agniInfo ?? null}
        analise={analise ?? null}
        vata={(doshaInfo?.vatascore as number | null) ?? null}
        pitta={(doshaInfo?.pittascore as number | null) ?? null}
        kapha={(doshaInfo?.kaphascore as number | null) ?? null}
      />

      {/* Topo */}
      <header className="mb-6">
        <h1 className="font-serif text-3xl md:text-4xl text-foreground">
          Sua rotina
        </h1>
        <p className="text-muted-foreground mt-1">
          Dia {diaSelecionado} da sua semana
        </p>
        <span className="inline-flex items-center gap-1 mt-3 px-3 py-1 rounded-full bg-secondary/15 text-secondary text-xs font-medium border border-secondary/30">
          Praticante
        </span>
      </header>

      {/* Pílulas de dias */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 mb-5">
        {Array.from({ length: 7 }, (_, i) => i + 1).map((d) => {
          const active = d === diaSelecionado;
          return (
            <button
              key={d}
              onClick={() => setDiaSelecionado(d)}
              className={cn(
                "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors border",
                active
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted text-muted-foreground border-transparent hover:bg-muted/80"
              )}
            >
              Dia {d}
            </button>
          );
        })}
      </div>

      {/* Indicadores do dia */}
      <div className="mb-6">
        <div className="flex items-baseline justify-between mb-1.5">
          <span className="text-sm text-foreground font-medium">
            Progresso do dia · {feitosCount} de {totalPossivel}
          </span>
          <span className="text-xs text-muted-foreground">
            Equilíbrio:{" "}
            <span
              className={cn(
                "font-medium",
                equilibrioDia < 0 ? "text-muted-foreground" : "text-foreground"
              )}
            >
              {equilibrioDia > 0 ? `+${equilibrioDia}` : equilibrioDia}
            </span>
          </span>
        </div>
        <Progress value={progressoPct} className="h-2" />
      </div>

      <div className="space-y-8">
        {/* ===== Sua rotina (refeições) ===== */}
        <section>
          <h2 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
            Sua rotina
          </h2>
          <div className="space-y-3">
            {MEAL_SLOTS.map((s) => {
              const row = rowBySlot.get(s.slot);
              const nugget = row?.nugget_id ? nuggetsById.get(row.nugget_id) : undefined;
              return (
                <RotinaSlotCard
                  key={s.slot}
                  slotLabel={s.label}
                  row={row}
                  nugget={nugget}
                  agniFracoOuIrregular={agniFracoOuIrregular}
                  onToggleFeito={() => row && toggleFeito(row)}
                />
              );
            })}
          </div>
        </section>

        {/* ===== Seus cuidados de hoje (práticas + hábitos do glossário) ===== */}
        <section>
          <h2 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
            Seus cuidados de hoje
          </h2>
          <div className="space-y-3">
            {PRACTICE_SLOTS.map((s) => {
              const row = rowBySlot.get(s.slot);
              const nugget = row?.nugget_id ? nuggetsById.get(row.nugget_id) : undefined;
              return (
                <RotinaSlotCard
                  key={s.slot}
                  slotLabel={s.label}
                  row={row}
                  nugget={nugget}
                  agniFracoOuIrregular={agniFracoOuIrregular}
                  onToggleFeito={() => row && toggleFeito(row)}
                />
              );
            })}
            {habitosGloss.map((h, idx) => (
              <HabitoCard
                key={`hab-${idx}`}
                habito={h.habito}
                periodo={h.periodo}
                feito={habitosFeitos.has(h.habito)}
                onToggle={() => toggleHabito(h.habito)}
              />
            ))}
          </div>
        </section>

        {/* ===== Evitar hoje ===== */}
        {alertasGloss.length > 0 && (
          <section>
            <h2 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
              Evitar hoje
            </h2>
            <p className="text-xs text-muted-foreground mb-3">
              espelho do dia — sem culpa, só consciência.
            </p>
            <div className="space-y-3">
              {alertasGloss.map((a, idx) => (
                <AlertaCard
                  key={`al-${idx}`}
                  alerta={a}
                  escorregou={alertasEscorregados.has(a)}
                  onToggle={() => toggleAlerta(a)}
                />
              ))}
            </div>
          </section>
        )}

        {/* ===== Sempre Faz Bem (suplementos personalizados) ===== */}
        <SuplementosSection
          vata={(doshaInfo?.vatascore as number | null) ?? null}
          pitta={(doshaInfo?.pittascore as number | null) ?? null}
          kapha={(doshaInfo?.kaphascore as number | null) ?? null}
        />
      </div>
    </PageContainer>
  );
};

// ===== Moldura da semana =====
interface SemanaHeaderProps {
  agniPrincipal: string | null;
  analise: ObjetivoTratamento | null;
  vata: number | null;
  pitta: number | null;
  kapha: number | null;
}

const PIE_COLORS: Record<string, string> = {
  Vata: "#4F75FF",
  Pitta: "#FF5C5C",
  Kapha: "#22C55E",
};

const DOSHA_BADGE: Record<"Vata" | "Pitta" | "Kapha", string> = {
  Vata: "bg-blue-100 text-blue-700 border-blue-300",
  Pitta: "bg-red-100 text-red-700 border-red-300",
  Kapha: "bg-green-100 text-green-700 border-green-300",
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

const SemanaHeader = ({ agniPrincipal, analise, vata, pitta, kapha }: SemanaHeaderProps) => {
  // Foco: tenta usar o bloco 3 da narrativa (caminhos); fallback para objetivos[0]
  const focoTexto = (() => {
    const cam = analise?.narrativa_clinica?.bloco_3_caminhos;
    if (cam) {
      const primeira = cam.split(/(?<=[.!?])\s+/)[0];
      return primeira?.trim() || null;
    }
    if (analise?.objetivos && analise.objetivos.length > 0) {
      return `Esta semana sua rotina foca em ${analise.objetivos.slice(0, 2).join(" e ")}.`;
    }
    return null;
  })();

  const v = vata ?? 0;
  const p = pitta ?? 0;
  const k = kapha ?? 0;
  const pieData = [
    { name: "Vata", value: v },
    { name: "Pitta", value: p },
    { name: "Kapha", value: k },
  ].filter((d) => d.value > 0);

  const metas: Record<"Vata" | "Pitta" | "Kapha", number | null> = {
    Vata: analise?.vata_meta ?? null,
    Pitta: analise?.pitta_meta ?? null,
    Kapha: analise?.kapha_meta ?? null,
  };
  const scores: Record<"Vata" | "Pitta" | "Kapha", number> = { Vata: v, Pitta: p, Kapha: k };

  return (
    <Card className="mb-5 p-5 bg-primary/5 border-primary/20">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-3">
        sua semana
      </div>

      <div className="rounded-xl border border-border bg-card p-3 flex items-center gap-3">
        <div className="w-20 h-20 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
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
                {pieData.map((d) => (
                  <Cell key={d.name} fill={PIE_COLORS[d.name]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
            Seu diagnóstico
          </p>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {(["Vata", "Pitta", "Kapha"] as const).map((name) => {
              const score = scores[name];
              const meta = metas[name];
              const nivel = getNivel(score, name);
              const label =
                meta != null && meta !== score
                  ? `${name} ${score} → ${meta} · ${nivel}`
                  : `${name} ${score} · ${nivel}`;
              return (
                <span
                  key={name}
                  className={cn(
                    "text-[10px] px-2 py-0.5 rounded-full border font-semibold",
                    DOSHA_BADGE[name]
                  )}
                >
                  {label}
                </span>
              );
            })}
          </div>
          {agniPrincipal && (
            <p className="text-[11px] text-muted-foreground mt-1 truncate">
              Agni: <span className="text-foreground font-medium">{agniPrincipal}</span>
            </p>
          )}
        </div>
      </div>


      {focoTexto && (
        <div className="mt-4 pt-4 border-t border-primary/15 space-y-1.5">
          <div className="text-[11px] uppercase tracking-wider text-secondary font-semibold">
            foco da semana
          </div>
          <p className="text-sm text-foreground leading-relaxed">{focoTexto}</p>
        </div>
      )}

      <Link
        to="/meu-dosha"
        className="inline-flex items-center gap-1 mt-4 text-sm font-medium text-primary hover:underline"
      >
        ver meu diagnóstico completo
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </Card>
  );
};

// ===== Card =====

interface SlotCardProps {
  slotLabel: string;
  row: RotinaRow | undefined;
  nugget: Nugget | undefined;
  agniFracoOuIrregular: boolean;
  onToggleFeito: () => void;
}

const RotinaSlotCard = ({
  slotLabel,
  row,
  nugget,
  agniFracoOuIrregular,
  onToggleFeito,
}: SlotCardProps) => {
  const [open, setOpen] = useState(false);
  const [porqueOpen, setPorqueOpen] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);

  const iconName = nugget?.icone_lucide || "Circle";
  const IconCmp =
    ((LucideIcons as unknown) as Record<string, React.ComponentType<{ className?: string }>>)[
      iconName
    ] ?? Circle;

  const feito = row?.praticado === true;
  const mostrarChama =
    !!nugget?.nugget_json?.bom_para_agni && agniFracoOuIrregular;

  const nj = nugget?.nugget_json ?? {};
  const dg = nj.dravya_guna ?? {};
  const tsSec = parseTimestamp(nugget?.video_timestamp ?? null);

  return (
    <Card className="overflow-hidden">
      <Collapsible open={open} onOpenChange={setOpen}>
        <div className="flex items-center gap-3 p-4">
          <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <IconCmp className="h-5 w-5" />
          </div>

          <CollapsibleTrigger asChild>
            <button className="flex-1 text-left min-w-0">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                {slotLabel}
              </div>
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="font-medium text-foreground truncate">
                  {nugget?.titulo ?? "—"}
                </span>
                {mostrarChama && (
                  <Flame
                    className="h-4 w-4 text-secondary shrink-0"
                    aria-label="bom para o seu agni"
                  />
                )}
              </div>
            </button>
          </CollapsibleTrigger>

          <button
            onClick={onToggleFeito}
            disabled={!row}
            className="p-2 rounded-full hover:bg-muted disabled:opacity-40"
            aria-label="marcar como praticado"
          >
            <Star
              className={cn(
                "h-7 w-7",
                feito
                  ? "fill-secondary text-secondary"
                  : "text-muted-foreground"
              )}
            />
          </button>
        </div>

        <CollapsibleContent>
          {nugget && (
            <div className="px-4 pb-4 border-t border-border pt-4 space-y-4 text-sm text-foreground">
              {nj.resumo && (
                <p className="text-muted-foreground leading-relaxed">
                  {nj.resumo}
                </p>
              )}

              {nj.ingredientes && nj.ingredientes.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-1">Ingredientes</h4>
                  <ul className="list-disc pl-5 space-y-0.5 text-muted-foreground">
                    {nj.ingredientes.map((i, idx) => (
                      <li key={idx}>
                        {[i.qtd, i.item].filter(Boolean).join(" ")}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {nj.modo_preparo && nj.modo_preparo.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-1">Modo de preparo</h4>
                  <ol className="list-decimal pl-5 space-y-1 text-muted-foreground">
                    {nj.modo_preparo.map((p, idx) => (
                      <li key={idx}>{p}</li>
                    ))}
                  </ol>
                </div>
              )}

              {nj.dicas && (
                <div>
                  <h4 className="font-semibold mb-1">Dicas</h4>
                  <p className="text-muted-foreground">{nj.dicas}</p>
                </div>
              )}

              {nj.efeito_esperado && (
                <div>
                  <h4 className="font-semibold mb-1">Efeito esperado</h4>
                  <p className="text-muted-foreground">{nj.efeito_esperado}</p>
                </div>
              )}

              {nugget.video_id && (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setVideoOpen(true)}
                  className="gap-2"
                >
                  <Play className="h-4 w-4" />
                  ver o prof. ensinar
                </Button>
              )}

              {/* Camada 2 */}
              <Collapsible open={porqueOpen} onOpenChange={setPorqueOpen}>
                <CollapsibleTrigger asChild>
                  <button className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
                    por que funciona
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform",
                        porqueOpen && "rotate-180"
                      )}
                    />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-3 space-y-2 text-sm text-muted-foreground">
                  {dg.rasa && dg.rasa.length > 0 && (
                    <p>
                      <span className="font-medium text-foreground">
                        Sabores:
                      </span>{" "}
                      {dg.rasa.join(", ")}
                    </p>
                  )}
                  <p className="leading-relaxed">
                    {dg.virya && (
                      <>
                        <span className="font-medium text-foreground">
                          Potência:
                        </span>{" "}
                        {dg.virya}
                        {" · "}
                      </>
                    )}
                    {dg.gunas && dg.gunas.length > 0 && (
                      <>
                        <span className="font-medium text-foreground">
                          Qualidades:
                        </span>{" "}
                        {dg.gunas.join("/")}
                        {" · "}
                      </>
                    )}
                    {dg.karma && dg.karma.length > 0 && (
                      <>
                        <span className="font-medium text-foreground">
                          Ações:
                        </span>{" "}
                        {dg.karma.join("/")}
                        {" · "}
                      </>
                    )}
                    {dg.efeito_tecidos && (
                      <>
                        <span className="font-medium text-foreground">
                          Efeito nos tecidos:
                        </span>{" "}
                        {dg.efeito_tecidos}
                      </>
                    )}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">
                      Efeito nos doshas:
                    </span>{" "}
                    Vata {formatScore(nugget.vata)} · Pitta{" "}
                    {formatScore(nugget.pitta)} · Kapha{" "}
                    {formatScore(nugget.kapha)}
                  </p>
                </CollapsibleContent>
              </Collapsible>
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>

      {nugget?.video_id && (
        <VideoPlayerDialog
          open={videoOpen}
          onOpenChange={setVideoOpen}
          videoId={nugget.video_id}
          title={nugget.titulo}
          description={nj.resumo ?? ""}
          initialSeconds={tsSec}
        />
      )}
    </Card>
  );
};

// ===== Hábito do glossário (estado local) =====
interface HabitoCardProps {
  habito: string;
  periodo?: string;
  feito: boolean;
  onToggle: () => void;
}
const HabitoCard = ({ habito, periodo, feito, onToggle }: HabitoCardProps) => (
  <Card className="p-4 flex items-center gap-3">
    <div className="h-10 w-10 rounded-full bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
      <Leaf className="h-5 w-5" />
    </div>
    <div className="flex-1 min-w-0">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
        {periodo ? `cuidado · ${periodo}` : "cuidado do dia"}
      </div>
      <p className="text-sm text-foreground leading-snug">{habito}</p>
    </div>
    <button
      onClick={onToggle}
      className="p-2 rounded-full hover:bg-muted"
      aria-label="marcar como praticado"
    >
      <Star
        className={cn(
          "h-7 w-7",
          feito ? "fill-secondary text-secondary" : "text-muted-foreground"
        )}
      />
    </button>
  </Card>
);

// ===== Alerta do glossário (escorregão) =====
interface AlertaCardProps {
  alerta: string;
  escorregou: boolean;
  onToggle: () => void;
}
const AlertaCard = ({ alerta, escorregou, onToggle }: AlertaCardProps) => (
  <Card
    className={cn(
      "p-4 flex items-center gap-3 border-dashed transition-colors",
      escorregou ? "bg-muted/60 border-muted-foreground/30" : "bg-card"
    )}
  >
    <div className="h-9 w-9 rounded-full bg-muted text-muted-foreground flex items-center justify-center shrink-0">
      <AlertTriangle className="h-4 w-4" />
    </div>
    <p
      className={cn(
        "flex-1 text-sm leading-snug",
        escorregou ? "text-foreground font-medium" : "text-muted-foreground"
      )}
    >
      {alerta}
    </p>
    <Button
      type="button"
      size="sm"
      variant={escorregou ? "secondary" : "outline"}
      onClick={onToggle}
      className="shrink-0 text-xs h-8"
    >
      {escorregou ? "anotado" : "registrar"}
    </Button>
  </Card>
);

// ===== Sempre Faz Bem (suplementos) =====
interface ProdutoNugget {
  id: string;
  titulo: string;
  vata: number | null;
  pitta: number | null;
  kapha: number | null;
  nugget_json: {
    resumo?: string;
    produto?: { nome?: string; link?: string };
  } | null;
}

const isAgravado = (score: number, dosha: "Vata" | "Pitta" | "Kapha") => {
  const nivel = getNivel(score, dosha);
  return nivel === "Acúmulo" || nivel === "Adoecido" || nivel === "Fixado";
};

interface SuplementosSectionProps {
  vata: number | null;
  pitta: number | null;
  kapha: number | null;
}

const SuplementosSection = ({ vata, pitta, kapha }: SuplementosSectionProps) => {
  const { data: produtos } = useQuery({
    queryKey: ["rotina-produtos"],
    staleTime: 30 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rotina_nuggets")
        .select("id, titulo, vata, pitta, kapha, nugget_json")
        .eq("subcategoria", "produto");
      if (error) throw error;
      return (data ?? []) as unknown as ProdutoNugget[];
    },
  });

  const v = vata ?? 0;
  const p = pitta ?? 0;
  const k = kapha ?? 0;

  // Doshas agravados, ordenados do mais alto para o mais baixo
  const doshasAgravadosOrdenados = (
    [
      ["Vata", v] as const,
      ["Pitta", p] as const,
      ["Kapha", k] as const,
    ]
      .filter(([d, s]) => isAgravado(s, d))
      .sort((a, b) => b[1] - a[1])
      .map(([d]) => d as "Vata" | "Pitta" | "Kapha")
  );

  const recomendados = useMemo(() => {
    if (!produtos || doshasAgravadosOrdenados.length === 0) return [];
    const seen = new Set<string>();
    const out: ProdutoNugget[] = [];
    for (const d of doshasAgravadosOrdenados) {
      const key = d.toLowerCase() as "vata" | "pitta" | "kapha";
      const matches = produtos
        .filter((pr) => (pr[key] ?? 0) < 0)
        .sort((a, b) => (a[key] ?? 0) - (b[key] ?? 0));
      for (const m of matches) {
        if (!seen.has(m.id)) {
          seen.add(m.id);
          out.push(m);
        }
      }
    }
    return out;
  }, [produtos, doshasAgravadosOrdenados]);

  if (recomendados.length === 0) return null;

  return (
    <section className="mt-10 pt-8 border-t border-border">
      <div className="mb-3">
        <h2 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
          Sempre Faz Bem
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          suplementos que pacificam o que está mais agravado em você.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {recomendados.map((pr) => {
          const nome = pr.nugget_json?.produto?.nome ?? pr.titulo;
          const link = pr.nugget_json?.produto?.link;
          const resumo = pr.nugget_json?.resumo;
          return (
            <Card key={pr.id} className="p-4 flex flex-col gap-3 bg-muted/30">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                  <LucideIcons.Package className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    suplemento
                  </div>
                  <p className="font-medium text-foreground leading-snug">
                    {nome}
                  </p>
                </div>
              </div>
              {resumo && (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {resumo}
                </p>
              )}
              {link && (
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 self-start text-sm font-medium text-primary hover:underline"
                >
                  ver na loja
                  <LucideIcons.ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </Card>
          );
        })}
      </div>
    </section>
  );
};

export default MinhaRotina;
