import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { premiumSupabase, type ObjetivoTratamento } from "@/integrations/supabase/premium-client";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, TrendingUp } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import DoshasEvolutionChart, { type SeriesPoint } from "./metricas/DoshasEvolutionChart";
import AgniMiniChart from "./metricas/AgniMiniChart";
import AgniIndicator from "./metricas/AgniIndicator";
import ObjetivosPremiumBlock from "./metricas/ObjetivosPremiumBlock";
import { vataToLevel, pittaToLevel, kaphaToLevel, agniToLevel } from "./metricas/doshaScale";

interface RegistroHist {
  vatascore: number | null;
  pittascore: number | null;
  kaphascore: number | null;
  agniPrincipal: string | null;
  created_at: string;
  email: string | null;
  tipo: string | null;
}

const STALE = 30 * 60 * 1000;

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  registroUuid: string | null;
}

const EvolucaoSheet = ({ open, onOpenChange, registroUuid }: Props) => {
  const { data: regBase, isLoading: loadingBase } = useQuery({
    queryKey: ["evolucao-base", registroUuid],
    enabled: !!registroUuid && open,
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

  const { data: historico, isLoading: loadingHist } = useQuery({
    queryKey: ["evolucao-hist", email],
    enabled: !!email && open,
    staleTime: STALE,
    queryFn: async () => {
      const { data } = await supabase
        .from("doshas_registros")
        .select('vatascore, pittascore, kaphascore, "agniPrincipal", created_at, email, tipo')
        .eq("email", email!)
        .order("created_at", { ascending: true });
      return (data || []) as RegistroHist[];
    },
  });

  const { data: objetivo, isLoading: loadingObj } = useQuery({
    queryKey: ["evolucao-objetivo", email],
    enabled: !!email && open,
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

  const { realPoints, metaPoint, tStart, tEnd } = useMemo(() => {
    const hist = historico || [];
    const dataInicioISO = objetivo?.data_inicio || hist[hist.length - 1]?.created_at || null;
    const dataFimISO = objetivo?.data_fim || null;
    const tInicio = dataInicioISO ? new Date(dataInicioISO).getTime() : null;
    const tFim = dataFimISO ? new Date(dataFimISO).getTime() : null;
    const points: SeriesPoint[] = [];

    if (tInicio != null && objetivo) {
      points.push({
        t: tInicio,
        vata: objetivo.vata_atual != null ? vataToLevel(objetivo.vata_atual).level : undefined,
        vataRaw: objetivo.vata_atual ?? undefined,
        pitta: objetivo.pitta_atual != null ? pittaToLevel(objetivo.pitta_atual).level : undefined,
        pittaRaw: objetivo.pitta_atual ?? undefined,
        kapha: objetivo.kapha_atual != null ? kaphaToLevel(objetivo.kapha_atual).level : undefined,
        kaphaRaw: objetivo.kapha_atual ?? undefined,
        agni: objetivo.agni_nivel_atual != null ? agniToLevel(objetivo.agni_nivel_atual).level : undefined,
        agniRaw: objetivo.agni_nivel_atual,
      });
    }

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
      meta = {
        t: tFim,
        vata: objetivo.vata_meta != null ? vataToLevel(objetivo.vata_meta).level : undefined,
        vataRaw: objetivo.vata_meta ?? undefined,
        pitta: objetivo.pitta_meta != null ? pittaToLevel(objetivo.pitta_meta).level : undefined,
        pittaRaw: objetivo.pitta_meta ?? undefined,
        kapha: objetivo.kapha_meta != null ? kaphaToLevel(objetivo.kapha_meta).level : undefined,
        kaphaRaw: objetivo.kapha_meta ?? undefined,
        agni: objetivo.agni_nivel_meta != null ? agniToLevel(objetivo.agni_nivel_meta).level : undefined,
        agniRaw: objetivo.agni_nivel_meta,
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

  const hasData = realPoints.length > 0 || metaPoint;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2" style={{ fontFamily: "'Roboto Serif', serif", color: "hsl(var(--primary))" }}>
            <TrendingUp className="w-5 h-5" />
            Sua evolução
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4 py-2">
            <Skeleton className="h-[420px] rounded-2xl" />
            <Skeleton className="h-[140px] rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
          </div>
        ) : (
          <div className="space-y-6 py-2">
            <p className="text-sm text-muted-foreground text-center" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              Doshas e Agni ao longo do tempo, com sua meta clínica
            </p>

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

            {objetivo && (
              <AgniIndicator
                agniTipo={objetivo.agni_tipo}
                agniAtual={objetivo.agni_nivel_atual}
                agniMeta={objetivo.agni_nivel_meta}
                fraseClinica={objetivo.frase_clinica}
              />
            )}

            {objetivo ? (
              <ObjetivosPremiumBlock objetivo={objetivo} isPremium={true} />
            ) : (
              <div className="rounded-2xl border bg-card p-6 text-center space-y-2">
                <Sparkles className="w-6 h-6 mx-auto text-muted-foreground/60" />
                <p className="text-sm text-muted-foreground">
                  Seu plano de acompanhamento ainda está sendo preparado.
                </p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EvolucaoSheet;
