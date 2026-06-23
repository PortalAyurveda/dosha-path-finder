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
  Lock,
  Check,
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
import { lojaSupabase } from "@/integrations/supabase/loja-client";
import { premiumSupabase, type ObjetivoTratamento } from "@/integrations/supabase/premium-client";
import { cn } from "@/lib/utils";
import { normalizarDosha } from "@/lib/dosha";
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
  const { user, loading, doshaResult, profile, refreshProfile } = useUser();
  const queryClient = useQueryClient();
  const [diaSelecionado, setDiaSelecionado] = useState<number>(1);

  // Retorno do Stripe: /minha-rotina?assinatura=ok
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("assinatura") === "ok") {
      toast({ title: "Bem-vindo à sua rotina! ✨", description: "Sua assinatura está ativa." });
      const t = setTimeout(() => { refreshProfile(); }, 2000);
      window.history.replaceState({}, "", "/minha-rotina");
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Scores + agni do usuário — busca a partir do idPublico ativo
  const { data: doshaInfo } = useQuery({
    queryKey: ["minha-rotina-dosha-info", doshaResult?.idPublico],
    enabled: !!doshaResult?.idPublico,
    queryFn: async () => {
      const { data } = await supabase
        .from("doshas_registros")
        .select("agniPrincipal, vatascore, pittascore, kaphascore, created_at")
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
        .eq("doshanome", normalizarDosha(doshaNome) ?? "")
        .maybeSingle();
      if (error) return null;
      return (data as unknown as GlossarioRotina) ?? null;
    },
  });

  // Data de hoje (YYYY-MM-DD, fuso local) — referência única para gravação/leitura
  const todayISO = (() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  })();

  interface PontoRow {
    id?: string;
    data: string;
    tipo: string;
    pontos: number;
    referencia: string | null;
    nugget_id: string | null;
  }

  // Pontos de HOJE — fonte da verdade das marcações (estrelas e deslizes)
  const pontosHojeKey = ["rotina-pontos-hoje", user?.id, todayISO] as const;
  const { data: pontosHoje } = useQuery({
    queryKey: pontosHojeKey,
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await (supabase.from("rotina_pontos") as any)
        .select("id, data, tipo, pontos, referencia, nugget_id")
        .eq("user_id", user!.id)
        .eq("data", todayISO);
      if (error) throw error;
      return (data ?? []) as PontoRow[];
    },
  });

  // Placar total da conta — soma de todas as datas
  const pontosTotalKey = ["rotina-pontos-total", user?.id] as const;
  const { data: pontosTotal } = useQuery({
    queryKey: pontosTotalKey,
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await (supabase.from("rotina_pontos") as any)
        .select("pontos")
        .eq("user_id", user!.id);
      if (error) throw error;
      return ((data ?? []) as { pontos: number }[]).reduce((acc, r) => acc + (r.pontos ?? 0), 0);
    },
  });

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

  // Gate de assinatura
  const temAcessoRotina = (() => {
    if (!profile) return false;
    if (profile.is_premium === true) return true;
    const planosValidos = ["rotina", "mensal", "anual"];
    const ativo = profile.subscription_status === "active";
    const planoOk = !!profile.plano && planosValidos.includes(profile.plano);
    const dataOk = !profile.premium_until || new Date(profile.premium_until) > new Date();
    return ativo && planoOk && dataOk;
  })();

  if (!temAcessoRotina) {
    return (
      <PageContainer title="Minha rotina" description="Sua rotina ayurvédica personalizada.">
        <PaywallRotina
          email={user.email ?? ""}
          userId={user.id}
          doshaPrincipal={doshaResult?.doshaprincipal ?? null}
        />
      </PageContainer>
    );
  }


  // Rotina filtrada do dia
  const rowsDoDia = (rotinaRows ?? []).filter((r) => r.dia === diaSelecionado);
  const rowBySlot = new Map<string, RotinaRow>();
  rowsDoDia.forEach((r) => rowBySlot.set(r.slot, r));

  // Cuidados do glossário em destaque (2-3)
  const habitosGloss = (glossario?.habitos_diarios ?? []).slice(0, 3);
  const alertasGloss = (glossario?.alertas_cotidianos ?? []).slice(0, 3);

  // Sets derivados de rotina_pontos de hoje — filtrados pelo dia do planner
  // referencia agora vem como "diaN:resto" (ex.: "dia1:cafe_manha").
  // Marcações antigas sem prefixo são ignoradas (não casam com nenhum dia).
  const acertoRotinaSlots = new Set<string>();
  const acertoHabitos = new Set<string>();
  const deslizes = new Set<string>();
  (pontosHoje ?? []).forEach((p) => {
    if (!p.referencia) return;
    const m = p.referencia.match(/^dia(\d+):(.*)$/s);
    if (!m) return;
    const diaRef = Number(m[1]);
    const resto = m[2];
    if (diaRef !== diaSelecionado) return;
    if (p.tipo === "acerto_rotina") acertoRotinaSlots.add(resto);
    else if (p.tipo === "acerto_habito") acertoHabitos.add(resto);
    else if (p.tipo === "deslize") deslizes.add(resto);
  });

  // Contagens do dia (apenas marcações do dia selecionado)
  const totalPossivel =
    MEAL_SLOTS.length + PRACTICE_SLOTS.length + habitosGloss.length;
  const feitosCount = acertoRotinaSlots.size + acertoHabitos.size;
  const progressoPct = totalPossivel > 0 ? (feitosCount / totalPossivel) * 100 : 0;
  const equilibrioDia = (pontosHoje ?? []).reduce((acc, r) => {
    const m = r.referencia?.match(/^dia(\d+):/);
    if (!m || Number(m[1]) !== diaSelecionado) return acc;
    return acc + (r.pontos ?? 0);
  }, 0);

  // Nível do DIA (reseta a cada dia)
  const nivelDia = (() => {
    if (progressoPct < 33) return "Iniciante";
    if (progressoPct < 66) return "Praticante";
    return "Avançado";
  })();

  // Helpers de mutação otimista em rotina_pontos
  const optimisticAdd = (linha: PontoRow) => {
    queryClient.setQueryData<PontoRow[]>(pontosHojeKey as any, (prev) => [
      ...(prev ?? []),
      linha,
    ]);
    queryClient.setQueryData<number>(pontosTotalKey as any, (prev) => (prev ?? 0) + linha.pontos);
  };
  const optimisticRemove = (match: { tipo: string; referencia: string }) => {
    let removidoPontos = 0;
    queryClient.setQueryData<PontoRow[]>(pontosHojeKey as any, (prev) => {
      const arr = prev ?? [];
      const out: PontoRow[] = [];
      for (const r of arr) {
        if (r.tipo === match.tipo && r.referencia === match.referencia) {
          removidoPontos += r.pontos ?? 0;
        } else {
          out.push(r);
        }
      }
      return out;
    });
    queryClient.setQueryData<number>(pontosTotalKey as any, (prev) => (prev ?? 0) - removidoPontos);
  };
  const revertPontos = () => {
    queryClient.invalidateQueries({ queryKey: pontosHojeKey as any });
    queryClient.invalidateQueries({ queryKey: pontosTotalKey as any });
  };

  // Toggle de praticado (refeição/prática): grava em rotina_pontos com prefixo do dia
  const toggleFeito = async (row: RotinaRow) => {
    if (!user) return;
    const slot = row.slot;
    const ref = `dia${diaSelecionado}:${slot}`;
    const jaFeito = acertoRotinaSlots.has(slot);

    if (!jaFeito) {
      optimisticAdd({
        data: todayISO,
        tipo: "acerto_rotina",
        pontos: 1,
        referencia: ref,
        nugget_id: row.nugget_id,
      });
      try {
        const { error } = await (supabase.from("rotina_pontos") as any).insert({
          user_id: user.id,
          data: todayISO,
          tipo: "acerto_rotina",
          pontos: 1,
          referencia: ref,
          nugget_id: row.nugget_id,
        });
        if (error && (error as any).code !== "23505") throw error;
        if (row.nugget_id) {
          await (supabase.from("rotina_favoritos") as any).upsert(
            { user_id: user.id, nugget_id: row.nugget_id },
            { onConflict: "user_id,nugget_id", ignoreDuplicates: true }
          );
        }
      } catch {
        revertPontos();
        toast({ title: "Não consegui salvar", variant: "destructive" });
      }
    } else {
      optimisticRemove({ tipo: "acerto_rotina", referencia: ref });
      try {
        const { error } = await (supabase.from("rotina_pontos") as any)
          .delete()
          .eq("user_id", user.id)
          .eq("data", todayISO)
          .eq("tipo", "acerto_rotina")
          .eq("referencia", ref);
        if (error) throw error;
        if (row.nugget_id) {
          await (supabase.from("rotina_favoritos") as any)
            .delete()
            .eq("user_id", user.id)
            .eq("nugget_id", row.nugget_id);
        }
      } catch {
        revertPontos();
        toast({ title: "Não consegui salvar", variant: "destructive" });
      }
    }
  };

  const toggleHabito = async (habito: string) => {
    if (!user) return;
    const ref = `dia${diaSelecionado}:${habito}`;
    const jaFeito = acertoHabitos.has(habito);
    if (!jaFeito) {
      optimisticAdd({ data: todayISO, tipo: "acerto_habito", pontos: 1, referencia: ref, nugget_id: null });
      const { error } = await (supabase.from("rotina_pontos") as any).insert({
        user_id: user.id, data: todayISO, tipo: "acerto_habito", pontos: 1, referencia: ref,
      });
      if (error && (error as any).code !== "23505") {
        revertPontos();
        toast({ title: "Não consegui salvar", variant: "destructive" });
      }
    } else {
      optimisticRemove({ tipo: "acerto_habito", referencia: ref });
      const { error } = await (supabase.from("rotina_pontos") as any)
        .delete()
        .eq("user_id", user.id)
        .eq("data", todayISO)
        .eq("tipo", "acerto_habito")
        .eq("referencia", ref);
      if (error) { revertPontos(); toast({ title: "Não consegui salvar", variant: "destructive" }); }
    }
  };

  const toggleAlerta = async (alerta: string) => {
    if (!user) return;
    const ref = `dia${diaSelecionado}:${alerta}`;
    const jaEscorregou = deslizes.has(alerta);
    if (!jaEscorregou) {
      optimisticAdd({ data: todayISO, tipo: "deslize", pontos: -1, referencia: ref, nugget_id: null });
      const { error } = await (supabase.from("rotina_pontos") as any).insert({
        user_id: user.id, data: todayISO, tipo: "deslize", pontos: -1, referencia: ref,
      });
      if (error && (error as any).code !== "23505") {
        revertPontos();
        toast({ title: "Não consegui salvar", variant: "destructive" });
      }
    } else {
      optimisticRemove({ tipo: "deslize", referencia: ref });
      const { error } = await (supabase.from("rotina_pontos") as any)
        .delete()
        .eq("user_id", user.id)
        .eq("data", todayISO)
        .eq("tipo", "deslize")
        .eq("referencia", ref);
      if (error) { revertPontos(); toast({ title: "Não consegui salvar", variant: "destructive" }); }
    }
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
        ultimaRevisao={(doshaInfo?.created_at as string | null) ?? null}
      />

      {/* Topo */}
      <header className="mb-6">
        <h1 className="font-serif text-3xl md:text-4xl text-foreground">
          Sua rotina
        </h1>
        <p className="text-muted-foreground mt-1">
          Dia {diaSelecionado} da sua semana
        </p>
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-secondary/15 text-secondary text-xs font-medium border border-secondary/30">
            {nivelDia}
          </span>
          <span className="text-xs text-muted-foreground">
            Seus pontos: <span className="font-semibold text-foreground">{pontosTotal ?? 0}</span>
          </span>
        </div>
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
                  feito={acertoRotinaSlots.has(s.slot)}
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
                  feito={acertoRotinaSlots.has(s.slot)}
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
                feito={acertoHabitos.has(h.habito)}
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
                  escorregou={deslizes.has(a)}
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
  ultimaRevisao: string | null;
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
  const v = vata ?? 0;
  const p = pitta ?? 0;
  const k = kapha ?? 0;
  const pieData = [
    { name: "Vata", value: v },
    { name: "Pitta", value: p },
    { name: "Kapha", value: k },
  ].filter((d) => d.value > 0);

  const scores: Record<"Vata" | "Pitta" | "Kapha", number> = { Vata: v, Pitta: p, Kapha: k };
  const metas: Record<"Vata" | "Pitta" | "Kapha", number | null> = {
    Vata: analise?.vata_meta ?? null,
    Pitta: analise?.pitta_meta ?? null,
    Kapha: analise?.kapha_meta ?? null,
  };

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

  const metaRows = (["Vata", "Pitta", "Kapha"] as const)
    .map((name) => {
      const atual = scores[name];
      const meta = metas[name];
      if (meta == null || meta === atual) return null;
      const direction = meta < atual ? "reduzir" : "fortalecer";
      const arrow = meta < atual ? "↓" : "↑";
      return { name, atual, meta, direction, arrow };
    })
    .filter((r): r is NonNullable<typeof r> => r != null);

  const hasPlano = !!analise && (metaRows.length > 0 || !!focoTexto);

  return (
    <Card className="mb-5 p-5 bg-primary/5 border-primary/20 space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Bloco 1 — situação atual */}
        <div
          className={cn(
            "rounded-xl border border-border bg-card p-3 flex items-center gap-3",
            hasPlano ? "md:w-2/5" : "md:w-full"
          )}
        >
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
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">
              sua situação agora
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(["Vata", "Pitta", "Kapha"] as const).map((name) => {
                const score = scores[name];
                const nivel = getNivel(score, name);
                return (
                  <span
                    key={name}
                    className={cn(
                      "text-[10px] px-2 py-0.5 rounded-full border font-semibold",
                      DOSHA_BADGE[name]
                    )}
                  >
                    {name} {score} · {nivel}
                  </span>
                );
              })}
            </div>
            {agniPrincipal && (
              <p className="text-[11px] text-muted-foreground mt-1.5 truncate">
                Agni: <span className="text-foreground font-medium">{agniPrincipal}</span>
              </p>
            )}
          </div>
        </div>

        {/* Bloco 2 — plano da semana */}
        {hasPlano && (
          <div className="rounded-xl border border-secondary/30 bg-secondary/5 p-4 space-y-3 md:flex-1">
            <div className="text-[11px] uppercase tracking-wider text-secondary font-semibold">
              seu plano desta semana
            </div>

            {focoTexto && (
              <p className="text-sm text-foreground leading-relaxed">
                <span className="font-semibold">Seu foco:</span>{" "}
                {focoTexto}{" "}
                <span className="text-muted-foreground">— é o que a rotina abaixo faz por você.</span>
              </p>
            )}

            {metaRows.length > 0 && (
              <div className="space-y-1.5">
                {metaRows.map((row) => (
                  <div key={row.name} className="flex flex-wrap items-center gap-1.5 text-sm">
                    <span
                      className="font-bold"
                      style={{ color: "#2E8B57" }}
                    >
                      {row.arrow} {row.direction} {row.name}
                    </span>
                    <span className="text-xs text-muted-foreground">{row.atual}</span>
                    <span className="text-xs text-muted-foreground/60">→</span>
                    <span className="text-xs font-semibold text-foreground">{row.meta}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <Link
        to="/meu-dosha"
        className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
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
  feito: boolean;
  agniFracoOuIrregular: boolean;
  onToggleFeito: () => void;
}

const RotinaSlotCard = ({
  slotLabel,
  row,
  nugget,
  feito,
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

const extractSlug = (link?: string): string | null => {
  if (!link) return null;
  try {
    const url = new URL(link);
    const segs = url.pathname.split("/").filter(Boolean);
    return segs[segs.length - 1] ?? null;
  } catch {
    const segs = link.split("/").filter(Boolean);
    return segs[segs.length - 1] ?? null;
  }
};

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

  const slugs = useMemo(
    () =>
      Array.from(
        new Set(
          recomendados
            .map((pr) => extractSlug(pr.nugget_json?.produto?.link))
            .filter((s): s is string => !!s)
        )
      ),
    [recomendados]
  );

  const { data: lojaMap } = useQuery({
    queryKey: ["rotina-suplementos-loja", slugs],
    enabled: slugs.length > 0,
    staleTime: 30 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await lojaSupabase
        .from("produtos")
        .select("slug, nome_display, imagem_url")
        .in("slug", slugs);
      if (error) throw error;
      const map: Record<string, { nome_display: string; imagem_url: string | null }> = {};
      for (const row of (data ?? []) as Array<{ slug: string; nome_display: string; imagem_url: string | null }>) {
        map[row.slug] = { nome_display: row.nome_display, imagem_url: row.imagem_url };
      }
      return map;
    },
  });

  if (recomendados.length === 0) return null;

  return (
    <section className="mt-10 pt-8 border-t border-border">
      <div className="mb-3">
        <h2 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
          Suplementos ayurvédicos
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          suplementos que pacificam o que está mais agravado em você.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {recomendados.map((pr) => {
          const link = pr.nugget_json?.produto?.link;
          const slug = extractSlug(link);
          const lojaInfo = slug ? lojaMap?.[slug] : undefined;
          const nomeFallback = (pr.nugget_json?.produto?.nome ?? pr.titulo).replace(/\s*[—-]\s*Samkhya\s*$/i, "").trim();
          const nome = lojaInfo?.nome_display ?? nomeFallback;
          const imagem = lojaInfo?.imagem_url;
          const resumo = pr.nugget_json?.resumo;
          return (
            <Card key={pr.id} className="p-4 flex flex-col gap-3 bg-muted/30">
              <div className="flex items-start gap-3">
                {imagem ? (
                  <img
                    src={imagem}
                    alt={nome}
                    className="h-16 w-16 rounded-lg object-cover shrink-0 bg-muted"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                    <LucideIcons.Package className="h-6 w-6" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
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

// ===== Paywall (gate de assinatura) =====
interface PaywallRotinaProps {
  email: string;
  userId: string;
  doshaPrincipal: string | null;
}

const PaywallRotina = ({ email, userId, doshaPrincipal }: PaywallRotinaProps) => {
  const [carregando, setCarregando] = useState(false);

  const desbloquear = async () => {
    setCarregando(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-subscription-checkout", {
        body: { plano: "rotina", email, user_id: userId },
      });
      if (error) throw error;
      const url = (data as { url?: string })?.url;
      if (!url) throw new Error("sem url");
      window.location.href = url;
    } catch (e) {
      setCarregando(false);
      toast({
        title: "Não consegui abrir o checkout",
        description: "Tente de novo em instantes.",
        variant: "destructive",
      });
    }
  };

  const subtitulo = doshaPrincipal
    ? `${doshaPrincipal} · foco da semana: aquecer, untar e estabilizar`
    : "sua constituição · foco da semana: equilíbrio diário";

  const beneficios = [
    "Sua rotina dos 7 dias, refeita a cada mês",
    "Os cuidados e os suplementos certos pro seu dosha",
    "Sua revisão mensal de evolução",
    "Seu progresso e seus pontos, dia após dia",
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <Card className="relative overflow-hidden rounded-2xl">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-secondary to-primary" />
        <div className="p-6 md:p-8 space-y-6">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
              Portal Ayurveda · Seu plano
            </p>
            <h2 className="font-serif text-2xl md:text-3xl text-foreground leading-tight">
              Sua rotina personalizada está pronta
            </h2>
            <p className="text-sm text-muted-foreground">{subtitulo}</p>
          </div>

          {/* Preview borrado */}
          <div className="relative rounded-xl border border-border bg-muted/30 p-4 overflow-hidden">
            <div className="space-y-3 blur-sm select-none pointer-events-none" aria-hidden="true">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-muted-foreground/20" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-2.5 w-1/3 rounded bg-muted-foreground/20" />
                    <div className="h-2 w-3/4 rounded bg-muted-foreground/15" />
                  </div>
                </div>
              ))}
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center shadow-md">
                <Lock className="h-5 w-5 text-primary-foreground" />
              </div>
              <p className="text-sm text-foreground font-medium text-center px-4">
                7 dias · 8 momentos do dia · personalizada pra você
              </p>
            </div>
          </div>

          {/* Benefícios */}
          <ul className="space-y-2.5">
            {beneficios.map((b) => (
              <li key={b} className="flex items-start gap-2.5 text-sm text-foreground">
                <Check className="h-4 w-4 text-secondary mt-0.5 shrink-0" />
                <span>{b}</span>
              </li>
            ))}
          </ul>

          <div className="border-t border-border pt-5 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-semibold text-foreground">R$30</span>
                <span className="text-sm text-muted-foreground">· sua rotina mensal</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                1 revisão inclusa
              </p>
            </div>
            <div className="flex flex-col items-start sm:items-end gap-1.5">
              <Button
                onClick={desbloquear}
                disabled={carregando}
                size="lg"
                className="bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-full px-6"
              >
                {carregando ? "Abrindo checkout…" : (
                  <>Desbloquear minha rotina <ArrowRight className="h-4 w-4" /></>
                )}
              </Button>
              <p className="text-[11px] text-muted-foreground">cancele quando quiser · sem burocracia</p>
            </div>
          </div>
        </div>
      </Card>

      {/* ===== Landing — conteúdo de apoio ===== */}
      <PaywallLanding doshaPrincipal={doshaPrincipal} onDesbloquear={desbloquear} carregando={carregando} />
    </div>
  );
};

// ===== Landing de apoio (abaixo do card-resumo) =====
interface PaywallLandingProps {
  doshaPrincipal: string | null;
  onDesbloquear: () => void;
  carregando: boolean;
}

const PaywallLanding = ({ doshaPrincipal, onDesbloquear, carregando }: PaywallLandingProps) => {
  const dosha = doshaPrincipal ?? "seu dosha";

  const recebe = [
    { Icon: LucideIcons.Sunrise, titulo: "Café da manhã", desc: "Receita completa: ingredientes, modo de preparo, vídeo do professor e por que funciona pro seu dosha." },
    { Icon: LucideIcons.Coffee, titulo: "Lanche da manhã", desc: "Um lanche leve, certo pro seu agni nesse momento do dia." },
    { Icon: LucideIcons.Soup, titulo: "Almoço", desc: `Prato completo (cereal, proteína, legume, acompanhamento) pra equilibrar seu ${dosha}.` },
    { Icon: LucideIcons.Leaf, titulo: "Lanche da tarde", desc: "Um chá funcional pro seu estado atual." },
    { Icon: LucideIcons.Soup, titulo: "Jantar", desc: "Sopa ou caldo, sempre quente, no horário certo." },
    { Icon: LucideIcons.Moon, titulo: "Tônico da noite", desc: "30 min antes de dormir: o elixir certo pro seu dosha. Mingau, leite vegetal ou chá calmante, varia a cada dia." },
    { Icon: LucideIcons.Sun, titulo: "Rotina da manhã", desc: "A prática do dia (abhyanga, pranayama, meditação) com instrução completa." },
    { Icon: LucideIcons.Sparkles, titulo: "Prática do dia", desc: "Yoga, meditação ou respiração. Diferente a cada dia." },
  ];

  const paraQuemE = [
    "Cansado de conviver com intestino preso, inflamação, pele irritada e cansaço sem motivo — e suspeita que a causa está na rotina, não em mais um remédio.",
    "Já tentou dietas e suplementos que funcionam na teoria mas não no seu corpo — feitos pra uma média, não pra você.",
    "Quer parar de apagar incêndio e cuidar da causa.",
    "Entende que saúde se constrói no dia a dia e quer saber exatamente o que fazer, sem adivinhar.",
  ];

  const paraQuemNao = [
    "Prefere tomar um remédio pro sintoma e seguir em frente.",
    "Acredita que adoecer é inevitável.",
    "Não está disposto a mudar nada da rotina.",
  ];

  return (
    <div className="mt-12 space-y-14">
      {/* E agora? */}
      <section className="space-y-3">
        <h3 className="font-serif text-2xl text-primary">E agora?</h3>
        <p className="text-foreground/85 leading-relaxed">
          Você fez o teste. Descobriu seu dosha. E agora? A maioria das pessoas para aqui.
          Sabe que é {dosha}. Sabe que deveria comer mais quente, dormir cedo, evitar o frio.
          Mas na hora de montar o dia, trava. O que como no café? Qual chá tomo à tarde?
          O que faço antes de dormir? Ayurveda sem rotina é teoria. E teoria não muda nada.
        </p>
      </section>

      {/* O que você recebe */}
      <section className="space-y-5">
        <h3 className="font-serif text-2xl text-primary">O que você recebe</h3>
        <p className="text-foreground/85 leading-relaxed">
          Baseado no seu dosha — e só no seu — um plano completo pros próximos 7 dias.
          Não é genérico, não é "dicas pra {dosha}". É o seu plano, calculado com seus scores reais.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {recebe.map((r) => (
            <div key={r.titulo} className="rounded-xl border border-border bg-card p-4 flex gap-3">
              <div className="h-10 w-10 rounded-full bg-secondary/15 text-secondary flex items-center justify-center shrink-0">
                <r.Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-foreground leading-tight">{r.titulo}</p>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{r.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-xl bg-secondary/10 border border-secondary/20 p-4">
          <p className="text-foreground font-medium leading-relaxed">
            56 itens personalizados por semana. Cada um com receita, ingredientes, vídeo e a explicação de por que funciona pra você.
          </p>
        </div>
      </section>

      {/* Revisão mensal */}
      <section className="space-y-3">
        <h3 className="font-serif text-2xl text-primary">Uma revisão por mês — inclusa</h3>
        <p className="text-foreground/85 leading-relaxed">
          Todo mês, seu plano é revisado. Seu dosha muda com as estações, o estresse, a fase da vida.
          A revisão ajusta o plano pra onde você está agora — não pra onde estava há três meses.
          É um acompanhamento mensal do seu equilíbrio. Por R$30.
        </p>
      </section>

      {/* Para quem é / não é */}
      <section className="space-y-4">
        <h3 className="font-serif text-2xl text-primary">Para quem é. Para quem não é.</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-border bg-secondary/5 p-5">
            <p className="font-medium text-foreground mb-3">Para quem é</p>
            <ul className="space-y-2.5">
              {paraQuemE.map((t) => (
                <li key={t} className="flex items-start gap-2.5 text-sm text-foreground/85">
                  <Check className="h-4 w-4 text-secondary mt-0.5 shrink-0" />
                  <span className="leading-relaxed">{t}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-border bg-muted/40 p-5">
            <p className="font-medium text-muted-foreground mb-3">Para quem não é</p>
            <ul className="space-y-2.5">
              {paraQuemNao.map((t) => (
                <li key={t} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                  <LucideIcons.X className="h-4 w-4 mt-0.5 shrink-0" />
                  <span className="leading-relaxed">{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section className="space-y-4">
        <h3 className="font-serif text-2xl text-primary">Como funciona</h3>
        <ol className="space-y-3">
          {[
            "Você assina por R$30.",
            "Acessa sua rotina personalizada na hora — 7 dias completos, 8 momentos do dia.",
            "Todo mês, seu plano é revisado pra onde você está agora.",
          ].map((t, i) => (
            <li key={t} className="flex items-start gap-3">
              <span className="h-7 w-7 rounded-full bg-secondary text-secondary-foreground text-sm font-semibold flex items-center justify-center shrink-0">{i + 1}</span>
              <span className="text-foreground/85 leading-relaxed pt-0.5">{t}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* Fechamento */}
      <section className="space-y-4 border-t border-border pt-10">
        <p className="text-foreground/85 leading-relaxed">
          R$30, sua rotina mensal. Menos que um jantar fora. Menos que um suplemento que você não sabe se funciona pra você.
          E você tem um plano completo, todo mês, feito pro seu corpo.
        </p>
        <div className="flex flex-col items-center gap-2 pt-2">
          <Button
            onClick={onDesbloquear}
            disabled={carregando}
            size="lg"
            className="bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-full px-8 h-12 text-base"
          >
            {carregando ? "Abrindo checkout…" : (
              <>Quero minha rotina agora <ArrowRight className="h-4 w-4" /></>
            )}
          </Button>
          <p className="text-[11px] text-muted-foreground">cancele quando quiser · sem burocracia</p>
        </div>
      </section>
    </div>
  );
};
