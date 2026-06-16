import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { premiumSupabase, type ObjetivoTratamento } from "@/integrations/supabase/premium-client";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, TrendingUp } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import DoshasEvolutionChart, { type SeriesPoint } from "./metricas/DoshasEvolutionChart";
import AgniMiniChart, { type AgniPoint } from "./metricas/AgniMiniChart";
import AgniIndicator from "./metricas/AgniIndicator";
import ObjetivosPremiumBlock from "./metricas/ObjetivosPremiumBlock";
import { vataToLevel, pittaToLevel, kaphaToLevel, agniToLevel } from "./metricas/doshaScale";

function parseAgniNivel(s: string | null | undefined): number | null {
  if (!s) return null;
  const m = s.match(/nivel\s*(\d)/i);
  if (m) return Math.max(0, Math.min(3, parseInt(m[1], 10)));
  const low = s.toLowerCase();
  if (low.includes("constante") || low.includes("- boa") || low.includes("boa")) return 0;
  return null;
}

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

  const { realPoints, metaPoint, agniPoints, agniMetaPoint, tStart, tEnd } = useMemo(() => {
    const hist = historico || [];

    const monthName = (iso: string) => {
      const s = new Date(iso).toLocaleDateString("pt-BR", { month: "long" });
      return s.charAt(0).toUpperCase() + s.slice(1);
    };
    const monthKey = (iso: string) => {
      const d = new Date(iso);
      return `${d.getFullYear()}-${d.getMonth()}`;
    };

    // Apenas o teste nativo mais recente + UMA revisão por mês (a mais recente)
    const testes = hist.filter((r) => r.tipo !== "reteste");
    const retestesAll = hist.filter((r) => r.tipo === "reteste");
    const ultimoTeste = testes.length ? testes[testes.length - 1] : null;

    const byMonth = new Map<string, RegistroHist>();
    for (const r of retestesAll) {
      byMonth.set(monthKey(r.created_at), r); // sorted ASC → último vence
    }
    // Não deixa a revisão cair no mesmo mês do teste inicial
    if (ultimoTeste) byMonth.delete(monthKey(ultimoTeste.created_at));
    const retestes = Array.from(byMonth.values()).sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );

    const filtered: RegistroHist[] = [
      ...(ultimoTeste ? [ultimoTeste] : []),
      ...retestes,
    ];

    const points: SeriesPoint[] = filtered.map((r) => {
      const tipo = (r.tipo as "teste" | "reteste" | null) ?? "teste";
      return {
        t: new Date(r.created_at).getTime(),
        vata: r.vatascore != null ? vataToLevel(r.vatascore).level : undefined,
        vataRaw: r.vatascore ?? undefined,
        pitta: r.pittascore != null ? pittaToLevel(r.pittascore).level : undefined,
        pittaRaw: r.pittascore ?? undefined,
        kapha: r.kaphascore != null ? kaphaToLevel(r.kaphascore).level : undefined,
        kaphaRaw: r.kaphascore ?? undefined,
        tipo,
        label: tipo === "reteste" ? `Revisão de ${monthName(r.created_at)}` : "Diagnóstico",
      };
    });

    let meta: SeriesPoint | null = null;
    const tFim = objetivo?.data_fim ? new Date(objetivo.data_fim).getTime() : null;
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
        label: "Meta",
      };
    }

    // Agni points: mesmo recorte (teste + revisões 1/mês). Usa nivel parseado de agniPrincipal,
    // com fallback para objetivo.agni_nivel_atual no último ponto real.
    const agniPts: AgniPoint[] = [];
    for (let i = 0; i < filtered.length; i++) {
      const r = filtered[i];
      let nivel = parseAgniNivel(r.agniPrincipal);
      if (nivel == null && i === filtered.length - 1 && objetivo?.agni_nivel_atual != null) {
        nivel = objetivo.agni_nivel_atual;
      }
      if (nivel == null) continue;
      const tipo = (r.tipo as "teste" | "reteste" | null) ?? "teste";
      agniPts.push({
        t: new Date(r.created_at).getTime(),
        nivel,
        tipo,
        label: tipo === "reteste" ? `Revisão de ${monthName(r.created_at)}` : "Diagnóstico",
      });
    }
    const agniMeta: AgniPoint | null =
      objetivo && tFim != null && objetivo.agni_nivel_meta != null
        ? { t: tFim, nivel: objetivo.agni_nivel_meta, tipo: "meta", label: "Meta" }
        : null;

    const ts = [...points.map((p) => p.t), ...(meta ? [meta.t] : [])];
    return {
      realPoints: points,
      metaPoint: meta,
      agniPoints: agniPts,
      agniMetaPoint: agniMeta,
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
                  points={agniPoints}
                  metaPoint={agniMetaPoint}
                  agniTipo={objetivo.agni_tipo}
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

          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EvolucaoSheet;
