import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles } from "lucide-react";
import MetricasCard from "./MetricasCard";
import {
  buildContext,
  buildMetricasCards,
  CATEGORY_LABELS,
  type CategoriaMetrica,
  type MetricaCardData,
  type SnapshotEntry,
} from "@/data/metricasRules";

// Legacy export (some pages still import this type)
export interface InsightAyurvedico {
  tipo: "vermelho" | "laranja" | "amarelo";
  titulo: string;
  porcentagem: number;
  mensagem: string;
}

interface MetricasTabProps {
  registroUuid: string | null;
  insights?: InsightAyurvedico[];
  isLoading?: boolean;
}

interface RegistroFull {
  vatascore: number | null;
  pittascore: number | null;
  kaphascore: number | null;
  agniPrincipal: string | null;
  imc: number | string | null;
  idade: number | null;
  agravVataTags: string | null;
  agravPittaTags: string | null;
  agravKaphaTags: string | null;
  alimVata: string | null;
  alimPitta: string | null;
  alimKapha: string | null;
}

const STALE = 30 * 60 * 1000;

const MetricasTab = ({ registroUuid }: MetricasTabProps) => {
  const { data: registro, isLoading: loadingReg } = useQuery({
    queryKey: ["metricas-rules-registro", registroUuid],
    enabled: !!registroUuid,
    staleTime: STALE,
    queryFn: async () => {
      const { data } = await supabase
        .from("doshas_registros")
        .select(
          'vatascore, pittascore, kaphascore, "agniPrincipal", imc, idade, "agravVataTags", "agravPittaTags", "agravKaphaTags", "alimVata", "alimPitta", "alimKapha"',
        )
        .eq("id", registroUuid!)
        .maybeSingle();
      return data as RegistroFull | null;
    },
  });

  const { data: snapshot, isLoading: loadingSnap } = useQuery({
    queryKey: ["metricas-rules-snapshot"],
    staleTime: STALE,
    queryFn: async () => {
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
  });

  const isLoading = loadingReg || loadingSnap;

  if (isLoading) {
    return (
      <div className="space-y-4 py-4">
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
      </div>
    );
  }

  if (!registro) {
    return (
      <div className="rounded-2xl border bg-card p-8 text-center text-sm text-muted-foreground">
        Não foi possível carregar suas métricas.
      </div>
    );
  }

  const ctx = buildContext(registro);
  const cards = buildMetricasCards(ctx, snapshot || [], 6);

  if (cards.length === 0) {
    return (
      <div className="rounded-2xl border bg-card p-8 text-center space-y-2">
        <Sparkles className="w-6 h-6 mx-auto text-muted-foreground/60" />
        <p className="text-sm text-muted-foreground">
          Seu perfil está em equilíbrio — nenhum padrão crítico identificado nas regras atuais.
        </p>
      </div>
    );
  }

  // Group by category preserving order returned by buildMetricasCards
  const grouped = cards.reduce<Record<CategoriaMetrica, MetricaCardData[]>>(
    (acc, c) => {
      (acc[c.categoria] ||= []).push(c);
      return acc;
    },
    {} as Record<CategoriaMetrica, MetricaCardData[]>,
  );

  return (
    <div className="space-y-6 py-4">
      <div className="text-center space-y-1">
        <h2
          className="font-bold"
          style={{ color: "hsl(var(--primary))", fontFamily: "'Roboto Serif', serif", fontSize: "20px" }}
        >
          Suas métricas personalizadas
        </h2>
        <p className="text-sm text-muted-foreground" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          Padrões que cruzam o seu perfil com nossa base de diagnósticos
        </p>
      </div>

      {(Object.keys(grouped) as CategoriaMetrica[]).map((cat) => (
        <section key={cat} className="space-y-3">
          <h3
            className="text-xs font-bold uppercase tracking-wider px-1"
            style={{ color: "hsl(var(--muted-foreground))", fontFamily: "'DM Sans', sans-serif" }}
          >
            {CATEGORY_LABELS[cat]} · {grouped[cat].length}
          </h3>
          <div className="space-y-3">
            {grouped[cat].map((card, i) => (
              <MetricasCard key={card.id} card={card} index={i} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};

export default MetricasTab;
