import { useMemo, useState } from "react";
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
} from "lucide-react";

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

type Periodo = "Manhã" | "Tarde" | "Noite";

const SLOT_DEFS: { slot: SlotKey; label: string; periodo: Periodo }[] = [
  { slot: "rotina_manha", label: "ritual da manhã", periodo: "Manhã" },
  { slot: "cafe_manha", label: "café da manhã", periodo: "Manhã" },
  { slot: "lanche_manha", label: "lanche da manhã", periodo: "Manhã" },
  { slot: "almoco", label: "almoço", periodo: "Tarde" },
  { slot: "lanche_tarde", label: "lanche da tarde", periodo: "Tarde" },
  { slot: "bonus_diario", label: "bônus do dia", periodo: "Tarde" },
  { slot: "jantar", label: "jantar", periodo: "Noite" },
  { slot: "tonico_noite", label: "tônico da noite", periodo: "Noite" },
];

const PERIODOS: Periodo[] = ["Manhã", "Tarde", "Noite"];

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

  // Agni do usuário (fraco/irregular?) — busca a partir do idPublico ativo
  const { data: agniInfo } = useQuery({
    queryKey: ["minha-rotina-agni", doshaResult?.idPublico],
    enabled: !!doshaResult?.idPublico,
    queryFn: async () => {
      const { data } = await supabase
        .from("doshas_registros")
        .select("agniPrincipal")
        .eq("idPublico", doshaResult!.idPublico)
        .maybeSingle();
      return (data?.agniPrincipal as string | null) ?? null;
    },
  });

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

  const feitosCount = rowsDoDia.filter((r) => r.praticado === true).length;
  const totalSlots = SLOT_DEFS.length;
  const progressoPct = (feitosCount / totalSlots) * 100;

  // Mutations otimistas


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
    } catch (e) {
      queryClient.setQueryData(key, prev);
      toast({ title: "Não consegui salvar", variant: "destructive" });
    }
  };

  return (
    <PageContainer
      title="Minha rotina"
      description="Seu planner ayurvédico diário, slot a slot."
    >
      {/* Moldura: cabeçalho de contexto da semana */}
      <SemanaHeader
        doshaPrincipal={doshaResult?.doshaprincipal ?? null}
        agniPrincipal={agniInfo ?? null}
        analise={analise ?? null}
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

      {/* Progresso */}
      <div className="mb-6">
        <div className="flex items-baseline justify-between mb-1.5">
          <span className="text-sm text-foreground font-medium">
            {feitosCount} de {totalSlots} feitos
          </span>
          <span className="text-xs text-muted-foreground">hoje</span>
        </div>
        <Progress value={progressoPct} className="h-2" />
      </div>

      {/* Slots agrupados */}
      <div className="space-y-7">
        {PERIODOS.map((periodo) => {
          const slotsDoPeriodo = SLOT_DEFS.filter((s) => s.periodo === periodo);
          return (
            <section key={periodo}>
              <h2 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
                {periodo}
              </h2>
              <div className="space-y-3">
                {slotsDoPeriodo.map((s) => {
                  const row = rowBySlot.get(s.slot);
                  const nugget = row?.nugget_id
                    ? nuggetsById.get(row.nugget_id)
                    : undefined;
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
          );
        })}
      </div>
    </PageContainer>
  );
};

// ===== Moldura da semana =====
interface SemanaHeaderProps {
  doshaPrincipal: string | null;
  agniPrincipal: string | null;
  analise: ObjetivoTratamento | null;
}

const SemanaHeader = ({ doshaPrincipal, agniPrincipal, analise }: SemanaHeaderProps) => {
  // Foco: tenta usar o bloco 3 da narrativa (caminhos); fallback para objetivos[0]
  const focoTexto = (() => {
    const cam = analise?.narrativa_clinica?.bloco_3_caminhos;
    if (cam) {
      // pega a primeira frase
      const primeira = cam.split(/(?<=[.!?])\s+/)[0];
      return primeira?.trim() || null;
    }
    if (analise?.objetivos && analise.objetivos.length > 0) {
      return `Esta semana sua rotina foca em ${analise.objetivos.slice(0, 2).join(" e ")}.`;
    }
    return null;
  })();

  // Meta: encontra o dosha com maior diferença atual → meta
  const metaTexto = (() => {
    if (!analise) return null;
    const partes: string[] = [];
    const doshas = [
      { nome: "Vata", atual: analise.vata_atual, meta: analise.vata_meta },
      { nome: "Pitta", atual: analise.pitta_atual, meta: analise.pitta_meta },
      { nome: "Kapha", atual: analise.kapha_atual, meta: analise.kapha_meta },
    ].filter((d) => d.atual != null && d.meta != null && d.atual !== d.meta);

    doshas.sort((a, b) => Math.abs((b.atual! - b.meta!)) - Math.abs((a.atual! - a.meta!)));
    const top = doshas[0];
    if (top) {
      const verbo = top.atual! > top.meta! ? "reduzir" : "elevar";
      partes.push(`${verbo} ${top.nome} ${top.atual} → ${top.meta}`);
    }
    if (analise.agni_nivel_atual != null && analise.agni_nivel_meta != null && analise.agni_nivel_atual !== analise.agni_nivel_meta) {
      partes.push("regularizar o agni");
    }
    if (partes.length === 0) return null;
    return `Meta: ${partes.join(" · ")}`;
  })();

  const temAnalise = !!analise && (focoTexto || metaTexto);

  return (
    <Card className="mb-5 p-5 bg-primary/5 border-primary/20">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
        sua semana
      </div>
      {doshaPrincipal && (
        <p className="font-serif text-xl text-foreground leading-tight">
          {doshaPrincipal} em desequilíbrio
        </p>
      )}
      {agniPrincipal && (
        <p className="text-sm text-muted-foreground mt-0.5">
          Agni {agniPrincipal.toLowerCase()}
        </p>
      )}

      {temAnalise && (
        <div className="mt-4 pt-4 border-t border-primary/15 space-y-1.5">
          <div className="text-[11px] uppercase tracking-wider text-secondary font-semibold">
            foco da semana
          </div>
          {focoTexto && (
            <p className="text-sm text-foreground leading-relaxed">{focoTexto}</p>
          )}
          {metaTexto && (
            <p className="text-xs text-muted-foreground">{metaTexto}</p>
          )}
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

export default MinhaRotina;
