import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { premiumSupabase, type ObjetivoTratamento } from "@/integrations/supabase/premium-client";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, TrendingUp } from "lucide-react";
import DoshasEvolutionChart, { type SeriesPoint } from "./metricas/DoshasEvolutionChart";
import AgniMiniChart from "./metricas/AgniMiniChart";
import AgniIndicator from "./metricas/AgniIndicator";
import ObjetivosPremiumBlock from "./metricas/ObjetivosPremiumBlock";
import { vataToLevel, pittaToLevel, kaphaToLevel, agniToLevel } from "./metricas/doshaScale";

// Legacy export (kept for type compatibility)
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

interface RegistroHist {
  vatascore: number | null;
  pittascore: number | null;
  kaphascore: number | null;
  agniirregular: number | null;
  agniforte: number | null;
  agnifraco: number | null;
  agniPrincipal: string | null;
  created_at: string;
  email: string | null;
}

const STALE = 30 * 60 * 1000;

const MetricasTab = ({ registroUuid }: MetricasTabProps) => {
  // 1. registro atual -> email
  const { data: regBase, isLoading: loadingBase } = useQuery({
    queryKey: ["metricas-base", registroUuid],
    enabled: !!registroUuid,
    staleTime: STALE,
    queryFn: async () => {
      const { data } = await supabase
        .from("doshas_registros")
        .select("email, idPublico")
        .eq("id", registroUuid!)
        .maybeSingle();
      return data;
    },
  });

  const email = regBase?.email ?? null;

  // 2. histórico
  const { data: historico, isLoading: loadingHist } = useQuery({
    queryKey: ["metricas-hist", email],
    enabled: !!email,
    staleTime: STALE,
    queryFn: async () => {
      const { data } = await supabase
        .from("doshas_registros")
        .select(
          'vatascore, pittascore, kaphascore, agniirregular, agniforte, agnifraco, "agniPrincipal", created_at, email',
        )
        .eq("email", email!)
        .order("created_at", { ascending: true });
      return (data || []) as RegistroHist[];
    },
  });

  // 3. objetivo de tratamento
  const { data: objetivo, isLoading: loadingObj } = useQuery({
    queryKey: ["metricas-objetivo", email],
    enabled: !!email,
    staleTime: STALE,
    queryFn: async () => {
      const { data, error } = await premiumSupabase
        .from("objetivos_tratamento")
        .select("*")
        .eq("user_email", email!)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) return null;
      return data as ObjetivoTratamento | null;
    },
  });

  const isLoading = loadingBase || loadingHist || loadingObj;

  // Construir série
  const { realPoints, metaPoint, tStart, tEnd } = useMemo(() => {
    const hist = historico || [];
    const dataInicioISO = objetivo?.data_inicio || hist[hist.length - 1]?.created_at || null;
    const dataFimISO = objetivo?.data_fim || null;

    const tInicio = dataInicioISO ? new Date(dataInicioISO).getTime() : null;
    const tFim = dataFimISO ? new Date(dataFimISO).getTime() : null;

    const points: SeriesPoint[] = [];

    // "Hoje" — usa scores _atual do objetivo se houver, ancorado em data_inicio.
    if (tInicio != null && objetivo) {
      const vRaw = objetivo.vata_atual;
      const pRaw = objetivo.pitta_atual;
      const kRaw = objetivo.kapha_atual;
      const aRaw = objetivo.agni_nivel_atual;
      points.push({
        t: tInicio,
        vata: vRaw != null ? vataToLevel(vRaw).level : undefined,
        vataRaw: vRaw ?? undefined,
        pitta: pRaw != null ? pittaToLevel(pRaw).level : undefined,
        pittaRaw: pRaw ?? undefined,
        kapha: kRaw != null ? kaphaToLevel(kRaw).level : undefined,
        kaphaRaw: kRaw ?? undefined,
        agni: aRaw != null ? agniToLevel(aRaw).level : undefined,
        agniRaw: aRaw,
      });
    }

    // Pontos reais posteriores a data_inicio (ou todos se não há objetivo)
    for (const r of hist) {
      const t = new Date(r.created_at).getTime();
      if (tInicio != null && t <= tInicio) continue;
      points.push({
        t,
        vata: r.vatascore != null ? vataToLevel(r.vatascore).level : undefined,
        vataRaw: r.vatascore ?? undefined,
        pitta: r.pittascore != null ? pittaToLevel(r.pittascore).level : undefined,
        pittaRaw: r.pittascore ?? undefined,
        kapha: r.kaphascore != null ? kaphaToLevel(r.kaphascore).level : undefined,
        kaphaRaw: r.kaphascore ?? undefined,
      });
    }

    // Caso não haja objetivo: usar os históricos diretos
    if (points.length === 0 && hist.length > 0) {
      for (const r of hist) {
        points.push({
          t: new Date(r.created_at).getTime(),
          vata: r.vatascore != null ? vataToLevel(r.vatascore).level : undefined,
          vataRaw: r.vatascore ?? undefined,
          pitta: r.pittascore != null ? pittaToLevel(r.pittascore).level : undefined,
          pittaRaw: r.pittascore ?? undefined,
          kapha: r.kaphascore != null ? kaphaToLevel(r.kaphascore).level : undefined,
          kaphaRaw: r.kaphascore ?? undefined,
        });
      }
    }

    let meta: SeriesPoint | null = null;
    if (objetivo && tFim != null) {
      const vRaw = objetivo.vata_meta;
      const pRaw = objetivo.pitta_meta;
      const kRaw = objetivo.kapha_meta;
      const aRaw = objetivo.agni_nivel_meta;
      meta = {
        t: tFim,
        vata: vRaw != null ? vataToLevel(vRaw).level : undefined,
        vataRaw: vRaw ?? undefined,
        pitta: pRaw != null ? pittaToLevel(pRaw).level : undefined,
        pittaRaw: pRaw ?? undefined,
        kapha: kRaw != null ? kaphaToLevel(kRaw).level : undefined,
        kaphaRaw: kRaw ?? undefined,
        agni: aRaw != null ? agniToLevel(aRaw).level : undefined,
        agniRaw: aRaw,
        isMeta: true,
      };
    }

    const ts = [...points.map((p) => p.t), ...(meta ? [meta.t] : [])];
    return {
      realPoints: points,
      metaPoint: meta,
      tStart: ts.length ? Math.min(...ts) : Date.now(),
      tEnd: ts.length ? Math.max(...ts) : Date.now(),
    };
  }, [historico, objetivo]);

  if (isLoading) {
    return (
      <div className="space-y-4 py-4">
        <Skeleton className="h-[420px] rounded-2xl" />
        <Skeleton className="h-[140px] rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-48 rounded-2xl" />
      </div>
    );
  }

  const hasData = realPoints.length > 0 || metaPoint;

  return (
    <div className="space-y-6 py-4">
      <div className="text-center space-y-1">
        <h2
          className="font-bold flex items-center justify-center gap-2"
          style={{ color: "hsl(var(--primary))", fontFamily: "'Roboto Serif', serif", fontSize: "20px" }}
        >
          <TrendingUp className="w-5 h-5" />
          Sua evolução
        </h2>
        <p className="text-sm text-muted-foreground" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          Doshas e Agni ao longo do tempo, com sua meta clínica
        </p>
      </div>

      {/* Bloco 1 */}
      {hasData ? (
        <div className="rounded-2xl border bg-card p-3 md:p-5">
          <DoshasEvolutionChart
            realPoints={realPoints}
            metaPoint={metaPoint}
            agniTipo={objetivo?.agni_tipo ?? null}
            agniNivelAtual={objetivo?.agni_nivel_atual ?? null}
            agniNivelMeta={objetivo?.agni_nivel_meta ?? null}
          />
        </div>
      ) : (
        <div className="rounded-2xl border bg-card p-8 text-center text-sm text-muted-foreground">
          Nenhum dado de evolução disponível ainda.
        </div>
      )}

      {/* Bloco 2 */}
      {objetivo && objetivo.agni_nivel_atual != null && objetivo.agni_nivel_meta != null && (
        <div className="rounded-2xl border bg-card p-3 md:p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 px-2">
            Agni — evolução
          </h3>
          <AgniMiniChart
            tStart={tStart}
            tEnd={tEnd}
            agniTipo={objetivo.agni_tipo}
            agniAtual={objetivo.agni_nivel_atual}
            agniMeta={objetivo.agni_nivel_meta}
          />
        </div>
      )}

      {/* Bloco 3 */}
      {objetivo && (
        <AgniIndicator
          agniTipo={objetivo.agni_tipo}
          agniAtual={objetivo.agni_nivel_atual}
          agniMeta={objetivo.agni_nivel_meta}
          fraseClinica={objetivo.frase_clinica}
        />
      )}

      {/* Bloco 4 */}
      {objetivo ? (
        <ObjetivosPremiumBlock objetivo={objetivo} isPremium={false} />
      ) : (
        <div className="rounded-2xl border bg-card p-6 text-center space-y-2">
          <Sparkles className="w-6 h-6 mx-auto text-muted-foreground/60" />
          <p className="text-sm text-muted-foreground">
            Seu plano de acompanhamento ainda está sendo preparado.
          </p>
        </div>
      )}
    </div>
  );
};

export default MetricasTab;
