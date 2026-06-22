import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { premiumSupabase, type ObjetivoTratamento } from "@/integrations/supabase/premium-client";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import DoshasEvolutionChart from "./metricas/DoshasEvolutionChart";
import AgniMiniChart from "./metricas/AgniMiniChart";
import AgniIndicator from "./metricas/AgniIndicator";
import { buildSixMonthWindow, type HistRecord } from "./metricas/window6m";

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
      return (data || []) as HistRecord[];
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

  const win = useMemo(() => {
    const hist = (historico || []) as HistRecord[];
    return buildSixMonthWindow(
      hist,
      objetivo
        ? {
            vata_meta: objetivo.vata_meta,
            pitta_meta: objetivo.pitta_meta,
            kapha_meta: objetivo.kapha_meta,
            agni_nivel_meta: objetivo.agni_nivel_meta,
            agni_nivel_atual: objetivo.agni_nivel_atual,
          }
        : null,
    );
  }, [historico, objetivo]);

  const hasData = win.points.length > 0;

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
                <DoshasEvolutionChart window={win} />
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
                <AgniMiniChart window={win} agniTipo={objetivo.agni_tipo} />
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
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EvolucaoSheet;
