import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldCheck, AlertOctagon, AlertTriangle, Info, Diamond, Circle, CircleDot } from "lucide-react";
import {
  buildContext,
  buildMetricasCards,
  CATEGORY_LABELS,
  type CategoriaMetrica,
  type SnapshotEntry,
  type MetricaCardData,
} from "@/data/metricasRules";
import MetricasCard from "./MetricasCard";

// Legacy export (kept for type compatibility with existing imports)
export interface InsightAyurvedico {
  tipo: "vermelho" | "laranja" | "amarelo";
  titulo: string;
  porcentagem: number;
  mensagem: string;
}

interface MetricasTabProps {
  registroUuid: string | null;
  // Legacy props — no longer used internally, kept so MeuDosha.tsx doesn't break.
  insights?: InsightAyurvedico[];
  isLoading?: boolean;
}

interface RegistroFull {
  vatascore: number | null;
  pittascore: number | null;
  kaphascore: number | null;
  agniPrincipal: string | null;
  imc: number | null;
  idade: number | null;
  agravVataTags: string | null;
  agravPittaTags: string | null;
  agravKaphaTags: string | null;
  alimVata: string | null;
  alimPitta: string | null;
  alimKapha: string | null;
}

const CACHE_STALE = 30 * 60 * 1000;
const CACHE_GC = 60 * 60 * 1000;

const SECTION_ICONS: Record<CategoriaMetrica, { Icon: any; color: string }> = {
  Diagnostico: { Icon: Diamond, color: "text-[#352F54]" },
  Critico: { Icon: AlertOctagon, color: "text-[#DC2626]" },
  Alerta: { Icon: AlertTriangle, color: "text-[#D97706]" },
  Atencao: { Icon: Info, color: "text-[#65A30D]" },
  Paradoxo: { Icon: CircleDot, color: "text-[#6B8AFF]" },
  Estrutural: { Icon: Circle, color: "text-[#059669]" },
};

const CATEGORY_ORDER: CategoriaMetrica[] = [
  "Diagnostico",
  "Critico",
  "Alerta",
  "Atencao",
  "Paradoxo",
  "Estrutural",
];

const MetricasTab = ({ registroUuid }: MetricasTabProps) => {
  // 1. Buscar perfil completo do usuário (campos extras: imc, idade, alim*)
  const { data: registro, isLoading: registroLoading } = useQuery({
    queryKey: ["metricas-registro-full", registroUuid],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("doshas_registros")
        .select(
          "vatascore, pittascore, kaphascore, agniPrincipal, imc, idade, agravVataTags, agravPittaTags, agravKaphaTags, alimVata, alimPitta, alimKapha",
        )
        .eq("id", registroUuid!)
        .maybeSingle();
      if (error) return null;
      return data as RegistroFull | null;
    },
    enabled: !!registroUuid,
    staleTime: CACHE_STALE,
    gcTime: CACHE_GC,
    refetchOnWindowFocus: false,
  });

  // 2. Construir contexto + IDs aplicáveis
  const ctx = useMemo(() => (registro ? buildContext(registro) : null), [registro]);

  // 3. Buscar snapshots — usar a data mais recente disponível
  const { data: snapshots, isLoading: snapshotsLoading } = useQuery({
    queryKey: ["metricas-snapshot-latest"],
    queryFn: async () => {
      // Pega a data mais recente
      const { data: latest } = await supabase
        .from("metricas_snapshot")
        .select("data_calculo")
        .order("data_calculo", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!latest?.data_calculo) return [] as SnapshotEntry[];

      const { data } = await supabase
        .from("metricas_snapshot")
        .select("metrica_id, categoria, percentual, n_base")
        .eq("data_calculo", latest.data_calculo);

      return (data || []) as SnapshotEntry[];
    },
    staleTime: CACHE_STALE,
    gcTime: CACHE_GC,
    refetchOnWindowFocus: false,
  });

  // 4. Buscar total de registros para o subtítulo
  const { data: totalRegistros } = useQuery({
    queryKey: ["metricas-total-registros"],
    queryFn: async () => {
      const { count } = await supabase
        .from("doshas_registros")
        .select("*", { count: "exact", head: true });
      return count || 0;
    },
    staleTime: 60 * 60 * 1000,
    gcTime: 2 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // 5. Montar cards
  const cards: MetricaCardData[] = useMemo(() => {
    if (!ctx || !snapshots) return [];
    return buildMetricasCards(ctx, snapshots, 6);
  }, [ctx, snapshots]);

  const isLoading = registroLoading || snapshotsLoading;

  if (isLoading) {
    return (
      <div className="space-y-6 py-4">
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="w-12 h-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
          </div>
          <p className="text-sm text-muted-foreground animate-pulse">
            Cruzando seus dados com nossa base de pacientes...
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-44 rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm" />
          ))}
        </div>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
        <ShieldCheck className="w-12 h-12 text-muted-foreground/40" />
        <p className="font-bold text-lg" style={{ color: "#352F54", fontFamily: "'Roboto Serif', serif" }}>
          Perfil em equilíbrio
        </p>
        <p className="text-sm text-muted-foreground max-w-md">
          Seu perfil está equilibrado. Nenhum padrão crítico ou de alerta foi identificado na
          comparação com nossa base. Continue acompanhando.
        </p>
      </div>
    );
  }

  // Group cards by category
  const grouped = new Map<CategoriaMetrica, MetricaCardData[]>();
  for (const card of cards) {
    const arr = grouped.get(card.categoria) || [];
    arr.push(card);
    grouped.set(card.categoria, arr);
  }

  return (
    <div className="space-y-6 py-4">
      <div className="text-center space-y-1">
        <h2
          className="font-bold"
          style={{ color: "#352F54", fontFamily: "'Roboto Serif', serif", fontSize: "20px" }}
        >
          Métricas Preditivas
        </h2>
        <p className="text-sm text-muted-foreground" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          Cruzamentos personalizados entre seus dados e nossa base de{" "}
          {totalRegistros ? totalRegistros.toLocaleString("pt-BR") : "..."} registros
        </p>
      </div>

      {CATEGORY_ORDER.map((cat) => {
        const items = grouped.get(cat);
        if (!items || items.length === 0) return null;
        const { Icon, color } = SECTION_ICONS[cat];
        const sectionLabel = CATEGORY_LABELS[cat].toUpperCase();

        return (
          <div key={cat} className="space-y-3">
            <h3
              className={`text-xs font-bold uppercase tracking-wider ${color} flex items-center gap-1.5`}
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              <Icon className="w-3.5 h-3.5" />
              {sectionLabel} ({items.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {items.map((card, i) => (
                <MetricasCard key={card.id} card={card} index={i} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MetricasTab;
