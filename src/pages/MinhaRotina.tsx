import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
  Package,
  Sunrise,
  Coffee,
  Soup,
  Moon,
  Sun,
  Sparkles,
  X,
} from "lucide-react";
import { getIconeLucide } from "@/lib/iconesLucide";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

import PageContainer from "@/components/PageContainer";
import PrateleiraSamkhya from "@/components/samkhya/PrateleiraSamkhya";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  imagem_url: string | null;
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

  // ?item= : deep-link para abrir um nugget específico já expandido (reativo à URL)
  const [searchParams, setSearchParams] = useSearchParams();
  const itemParam = searchParams.get("item");
  const [focusNuggetId, setFocusNuggetId] = useState<string | null>(itemParam);
  const [focusHandled, setFocusHandled] = useState<boolean>(false);
  useEffect(() => {
    setFocusNuggetId(itemParam);
    setFocusHandled(false);
  }, [itemParam]);

  // Retorno do Stripe: /minha-rotina?assinatura=ok — polling do perfil até 30s
  const [confirmandoPagamento, setConfirmandoPagamento] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return new URLSearchParams(window.location.search).get("assinatura") === "ok";
  });
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("assinatura") !== "ok") return;
    toast({ title: "Confirmando seu pagamento…", description: "Estamos ativando sua rotina." });
    let cancelled = false;
    let tries = 0;
    const maxTries = 15; // 15 * 2s = 30s
    const tick = async () => {
      if (cancelled) return;
      tries++;
      await refreshProfile();
      // Deixa o React re-renderizar; o próprio efeito abaixo encerrará quando temAcessoRotina virar true.
      if (tries >= maxTries) {
        setConfirmandoPagamento(false);
        window.history.replaceState({}, "", "/minha-rotina");
        return;
      }
      setTimeout(tick, 2000);
    };
    const first = setTimeout(tick, 2000);
    return () => { cancelled = true; clearTimeout(first); };
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
      const { data, error } = await supabase.rpc("resultado_teste" as any, { p_idpublico: doshaResult!.idPublico });
      if (error) throw error;
      return Array.isArray(data) && data[0]?.id ? (data[0].id as string) : null;
    },
  });


  const { data: rotinaRows } = useQuery({
    queryKey: ["rotina-user", testeId],
    enabled: !!testeId,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("minha_rotina_por_teste" as any, { p_teste_id: testeId! });
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
          "id, titulo, icone_lucide, imagem_url, video_id, video_timestamp, vata, pitta, kapha, nugget_json"
        );
      if (error) throw error;
      return (data ?? []) as Nugget[];
    },
  });

  // Deep-link ?item= : ao carregar rotinaRows, pular pro dia do nugget-alvo
  useEffect(() => {
    if (!focusNuggetId || focusHandled || !rotinaRows) return;
    const match = rotinaRows.find((r) => r.nugget_id === focusNuggetId);
    if (!match) {
      toast({
        title: "Essa receita não está na sua rotina atual",
        variant: "destructive",
      });
      setFocusHandled(true);
      const next = new URLSearchParams(searchParams);
      next.delete("item");
      setSearchParams(next, { replace: true });
      return;
    }
    if (match.dia !== diaSelecionado) setDiaSelecionado(match.dia);
    setFocusHandled(true);
    // limpa da URL (mantém os outros params)
    const next = new URLSearchParams(searchParams);
    next.delete("item");
    setSearchParams(next, { replace: true });
  }, [focusNuggetId, focusHandled, rotinaRows, diaSelecionado, searchParams, setSearchParams]);




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
  // Visitante (deslogado) vê a página de venda completa — no clique é levado ao login
  // Gate de assinatura (para logados sem plano) usa o mesmo paywall
  const temAcessoRotina = (() => {
    if (!user || !profile) return false;
    if (profile.is_premium === true) return true;
    const planosValidos = ["rotina", "mensal", "anual"];
    const ativo = profile.subscription_status === "active";
    const planoOk = !!profile.plano && planosValidos.includes(profile.plano);
    const dataOk = !profile.premium_until || new Date(profile.premium_until) > new Date();
    return ativo && planoOk && dataOk;
  })();

  if (!user || !temAcessoRotina) {
    return (
      <PageContainer title="Minha rotina" description="Sua rotina ayurvédica personalizada.">
        <PaywallRotina
          email={user?.email ?? null}
          userId={user?.id ?? null}
          doshaPrincipal={doshaResult?.doshaprincipal ?? null}
          itemId={focusNuggetId}
        />
      </PageContainer>
    );
  }

  // Se o polling do pagamento chegou aqui com acesso liberado, encerre-o e limpe a URL.
  if (confirmandoPagamento) {
    setTimeout(() => {
      setConfirmandoPagamento(false);
      if (window.location.search.includes("assinatura=ok")) {
        window.history.replaceState({}, "", "/minha-rotina");
      }
    }, 0);
  }

  if (!doshaResult) {
    return (
      <PageContainer title="Minha rotina" description="Sua rotina ayurvédica personalizada.">
        <div className="max-w-xl mx-auto text-center py-12 px-4">
          <h1 className="font-serif text-3xl text-foreground mb-3">
            Falta um passo pra montar sua rotina
          </h1>
          <p className="text-muted-foreground mb-6">
            Faça seu teste de dosha e eu monto sua rotina personalizada na hora.
          </p>
          <Link to="/teste-de-dosha">
            <Button size="lg">Fazer meu teste de dosha</Button>
          </Link>
        </div>
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
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {MEAL_SLOTS.map((s, idx) => {
              const row = rowBySlot.get(s.slot);
              const nugget = row?.nugget_id ? nuggetsById.get(row.nugget_id) : undefined;
              const isLast = idx === MEAL_SLOTS.length - 1;
              return (
                <div key={s.slot} className="relative">
                  <RotinaSlotCard
                    slotLabel={s.label}
                    row={row}
                    nugget={nugget}
                    feito={acertoRotinaSlots.has(s.slot)}
                    agniFracoOuIrregular={agniFracoOuIrregular}
                    onToggleFeito={() => row && toggleFeito(row)}
                    focus={!!nugget && nugget.id === focusNuggetId}
                    compact
                  />
                  {!isLast && (
                    <ArrowRight
                      aria-hidden
                      className="pointer-events-none absolute top-1/2 -right-3 -translate-y-1/2 h-5 w-5 text-primary/40 z-10"
                    />
                  )}
                </div>
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
                  focus={!!nugget && nugget.id === focusNuggetId}
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
      <div className="mt-8">
        <PrateleiraSamkhya
          doshaPrincipal={doshaResult?.doshaprincipal ?? null}
          titulo="✦ Os ingredientes do seu ritual ✦"
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
  Vata: "#6B8AFF",
  Pitta: "#FF7676",
  Kapha: "#9ED88B",
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

const SemanaHeader = ({ agniPrincipal, analise, vata, pitta, kapha, ultimaRevisao }: SemanaHeaderProps) => {
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

  const dateFmt = (iso: string | null) => {
    if (!iso) return null;
    const d = new Date(iso);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }).replace(".", "");
  };
  const ultimaTxt = dateFmt(ultimaRevisao);
  const proximaDate = ultimaRevisao ? new Date(new Date(ultimaRevisao).getTime() + 30 * 86400000) : null;
  const proximaTxt = proximaDate ? dateFmt(proximaDate.toISOString()) : null;
  const diasParaProxima = proximaDate
    ? Math.max(0, Math.ceil((proximaDate.getTime() - Date.now()) / 86400000))
    : null;
  const revisaoVencida = proximaDate ? proximaDate.getTime() < Date.now() : false;

  return (
    <Card className="mb-5 p-5 bg-muted/30 border-border/60 space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Bloco 1 — situação atual */}
        <div
          className={cn(
            "rounded-xl border border-border/60 bg-card/80 p-3 flex items-center gap-3",
            hasPlano ? "md:w-[36%]" : "md:flex-1"
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
          <div className="rounded-xl border border-secondary/20 bg-secondary/10 p-4 space-y-3 md:flex-1">
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

        {/* Bloco 3 — Revisão */}
        <Link
          to="/revisao"
          className={cn(
            "group rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors p-4 flex flex-col justify-between",
            hasPlano ? "md:w-[22%]" : "md:w-[28%]"
          )}
        >
          <div>
            <div className="text-[11px] uppercase tracking-wider text-primary font-semibold mb-2">
              revisão
            </div>
            {ultimaTxt && (
              <p className="text-[11px] text-muted-foreground leading-tight">
                última: <span className="text-foreground font-medium">{ultimaTxt}</span>
              </p>
            )}
            {proximaTxt && (
              <p className="text-[11px] text-muted-foreground leading-tight mt-1">
                próxima: <span className="text-foreground font-medium">{proximaTxt}</span>
              </p>
            )}
            {diasParaProxima != null && (
              <p className={cn(
                "text-xs mt-2 font-semibold",
                revisaoVencida ? "text-secondary" : "text-primary/80"
              )}>
                {revisaoVencida
                  ? "está na hora"
                  : diasParaProxima === 0
                    ? "é hoje"
                    : `em ${diasParaProxima} ${diasParaProxima === 1 ? "dia" : "dias"}`}
              </p>
            )}
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-primary mt-3 group-hover:underline">
            revisar agora
            <ArrowRight className="h-3 w-3" />
          </span>
        </Link>
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
  focus?: boolean;
  compact?: boolean;
}

const RotinaSlotCard = ({
  slotLabel,
  row,
  nugget,
  feito,
  agniFracoOuIrregular,
  onToggleFeito,
  focus = false,
  compact = false,
}: SlotCardProps) => {
  const [open, setOpen] = useState(false);
  const [porqueOpen, setPorqueOpen] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [ringOn, setRingOn] = useState(false);

  useEffect(() => {
    if (!focus) return;
    setOpen(true);
    setRingOn(true);
    const t1 = setTimeout(() => {
      cardRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 60);
    const t2 = setTimeout(() => setRingOn(false), 2200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [focus]);

  const IconCmp = getIconeLucide(nugget?.icone_lucide);

  const mostrarChama =
    !!nugget?.nugget_json?.bom_para_agni && agniFracoOuIrregular;

  const nj = nugget?.nugget_json ?? {};
  const dg = nj.dravya_guna ?? {};
  const tsSec = parseTimestamp(nugget?.video_timestamp ?? null);

  const detalhes = nugget ? (
    <div className="space-y-4 text-sm text-foreground">
      {nugget.imagem_url && (
        <img
          src={nugget.imagem_url}
          alt={nugget.titulo}
          loading="lazy"
          className="float-right ml-4 mb-2 w-32 sm:w-40 aspect-square object-cover rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm shadow-sm"
        />
      )}
      {nj.resumo && (
        <p className="text-muted-foreground leading-relaxed">{nj.resumo}</p>
      )}

      {nj.ingredientes && nj.ingredientes.length > 0 && (
        <div>
          <h4 className="font-semibold mb-1">Ingredientes</h4>
          <ul className="list-disc pl-5 space-y-0.5 text-muted-foreground">
            {nj.ingredientes.map((i, idx) => (
              <li key={idx}>{[i.qtd, i.item].filter(Boolean).join(" ")}</li>
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

      <div className="clear-both flex flex-wrap items-center gap-2">
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
        {row && (
          <Button
            type="button"
            variant={feito ? "default" : "outline"}
            size="sm"
            onClick={onToggleFeito}
            className="gap-2"
          >
            <Star className={cn("h-4 w-4", feito && "fill-current")} />
            {feito ? "praticado hoje" : "marcar como praticado"}
          </Button>
        )}
      </div>

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
              <span className="font-medium text-foreground">Sabores:</span>{" "}
              {dg.rasa.join(", ")}
            </p>
          )}
          <p className="leading-relaxed">
            {dg.virya && (
              <>
                <span className="font-medium text-foreground">Potência:</span>{" "}
                {dg.virya}
                {" · "}
              </>
            )}
            {dg.gunas && dg.gunas.length > 0 && (
              <>
                <span className="font-medium text-foreground">Qualidades:</span>{" "}
                {dg.gunas.join("/")}
                {" · "}
              </>
            )}
            {dg.karma && dg.karma.length > 0 && (
              <>
                <span className="font-medium text-foreground">Ações:</span>{" "}
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
            <span className="font-medium text-foreground">Efeito nos doshas:</span>{" "}
            Vata {formatScore(nugget.vata)} · Pitta {formatScore(nugget.pitta)} ·
            Kapha {formatScore(nugget.kapha)}
          </p>
        </CollapsibleContent>
      </Collapsible>
    </div>
  ) : null;

  const videoDialog = nugget?.video_id ? (
    <VideoPlayerDialog
      open={videoOpen}
      onOpenChange={setVideoOpen}
      videoId={nugget.video_id}
      title={nugget.titulo}
      description={nj.resumo ?? ""}
      initialSeconds={tsSec}
    />
  ) : null;

  if (compact) {
    return (
      <>
        <Card
          ref={cardRef}
          className={cn(
            "overflow-hidden transition-shadow duration-500 relative",
            ringOn && "ring-2 ring-primary ring-offset-2 ring-offset-background"
          )}
        >
          <button
            onClick={onToggleFeito}
            disabled={!row}
            className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-background/80 backdrop-blur hover:bg-muted disabled:opacity-40"
            aria-label="marcar como praticado"
          >
            <Star
              className={cn(
                "h-5 w-5",
                feito ? "fill-secondary text-secondary" : "text-muted-foreground"
              )}
            />
          </button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <button className="w-full text-left">
                <div className="aspect-[4/3] w-full bg-muted overflow-hidden">
                  {nugget?.imagem_url ? (
                    <img
                      src={nugget.imagem_url}
                      alt={nugget.titulo}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/5">
                      <IconCmp className="h-10 w-10 text-primary/60" />
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                    {slotLabel}
                  </div>
                  <div className="flex items-start gap-1.5 mt-0.5">
                    <span className="font-medium text-foreground text-sm leading-snug line-clamp-2">
                      {nugget?.titulo ?? "—"}
                    </span>
                    {mostrarChama && (
                      <Flame className="h-3.5 w-3.5 text-secondary shrink-0 mt-0.5" aria-label="bom para o seu agni" />
                    )}
                  </div>
                  {nugget?.nugget_json?.resumo && (
                    <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2 leading-snug">
                      {nugget.nugget_json.resumo}
                    </p>
                  )}
                </div>
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                  {slotLabel}
                </div>
                <DialogTitle className="font-serif text-2xl leading-tight flex items-center gap-2">
                  {nugget?.titulo ?? "—"}
                  {mostrarChama && (
                    <Flame className="h-5 w-5 text-secondary shrink-0" aria-label="bom para o seu agni" />
                  )}
                </DialogTitle>
              </DialogHeader>
              {detalhes}
            </DialogContent>
          </Dialog>
        </Card>
        {videoDialog}
      </>
    );
  }

  return (
    <Card
      ref={cardRef}
      className={cn(
        "overflow-hidden transition-shadow duration-500",
        ringOn && "ring-2 ring-primary ring-offset-2 ring-offset-background"
      )}
    >
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
                feito ? "fill-secondary text-secondary" : "text-muted-foreground"
              )}
            />
          </button>
        </div>

        <CollapsibleContent>
          {nugget && (
            <div className="px-4 pb-4 border-t border-border pt-4">
              {detalhes}
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>

      {videoDialog}
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
                    <Package className="h-6 w-6" />
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
              {slug && (
                <Link
                  to={`/samkhya/produto/${slug}`}
                  className="inline-flex items-center gap-1.5 self-start text-sm font-medium text-primary hover:underline"
                >
                  ver na loja
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
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
  email: string | null;
  userId: string | null;
  doshaPrincipal: string | null;
  itemId?: string | null;
}

type ReceitaTeaser = {
  titulo?: string | null;
  imagem?: string | null;
  resumo?: string | null;
  ingredientes_amostra?: { qtd?: string | null; item?: string | null }[] | null;
  bom_para?: string | null;
};

const PaywallRotina = ({ email, userId, doshaPrincipal, itemId }: PaywallRotinaProps) => {
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();

  const { data: teaser } = useQuery({
    queryKey: ["receita-teaser", itemId],
    enabled: !!itemId,
    queryFn: async () => {
      const { data } = await (supabase.rpc as any)("receita_teaser", { p_item: itemId });
      const row = Array.isArray(data) ? data[0] : data;
      return (row ?? null) as ReceitaTeaser | null;
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: agravamentos } = useQuery({
    queryKey: ["meus-agravamentos", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data } = await (supabase as any).rpc("meus_agravamentos");
      return (data ?? []) as { sintoma: string; dosha: string; prioridade: number }[];
    },
  });
  const top3 = (agravamentos ?? []).slice(0, 3);

  const { data: vitrine } = useQuery({
    queryKey: ["vitrine-receitas", doshaPrincipal],
    queryFn: async () => {
      const { data } = await supabase
        .from("v_receitas" as any)
        .select("titulo, imagem_url, vata, pitta, kapha")
        .not("imagem_url", "is", null)
        .limit(24);
      const rows = (data ?? []) as any[];
      const d = (doshaPrincipal ?? "").toLowerCase();
      const pacifica = (r: any) =>
        (d.includes("vata") && r.vata < 0) ||
        (d.includes("pitta") && r.pitta < 0) ||
        (d.includes("kapha") && r.kapha < 0);
      return [...rows].sort((a, b) => Number(pacifica(b)) - Number(pacifica(a))).slice(0, 8);
    },
  });

  const desbloquear = async () => {
    navigate("/assinar");
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

  const temTeaser = !!(itemId && teaser);
  const ingredientesAmostra = (teaser?.ingredientes_amostra ?? []).slice(0, 2);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
        {/* Coluna esquerda — teaser da receita */}
        <Card className="relative overflow-hidden rounded-2xl">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-secondary to-primary" />
          <div className="p-6 md:p-8 space-y-4 h-full flex flex-col">
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
              Uma prévia da sua rotina
            </p>
            {temTeaser ? (
              <div className="rounded-xl border border-border bg-card overflow-hidden flex-1 flex flex-col">
                {teaser?.imagem && (
                  <div className="w-full aspect-[16/9] bg-muted overflow-hidden">
                    <img
                      src={teaser.imagem}
                      alt={teaser.titulo ?? "Receita da rotina"}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="p-4 md:p-5 space-y-3 flex-1 flex flex-col">
                  <h3 className="font-serif text-lg md:text-xl text-foreground leading-tight">
                    {teaser?.titulo ?? "Receita da rotina"}
                  </h3>
                  {teaser?.resumo && (
                    <p className="text-sm text-muted-foreground leading-relaxed">{teaser.resumo}</p>
                  )}
                  {ingredientesAmostra.length > 0 && (
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-1.5">
                        Ingredientes
                      </p>
                      <ul className="space-y-1 text-sm text-foreground">
                        {ingredientesAmostra.map((ing, i) => (
                          <li key={i}>
                            • {ing.qtd ? `${ing.qtd} ` : ""}{ing.item ?? ""}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="relative rounded-lg border border-border bg-muted/30 overflow-hidden mt-auto">
                    <div className="p-4 space-y-2 blur-sm select-none pointer-events-none" aria-hidden="true">
                      <div className="h-2.5 w-2/3 rounded bg-muted-foreground/30" />
                      <div className="h-2 w-4/5 rounded bg-muted-foreground/20" />
                      <div className="h-2 w-3/5 rounded bg-muted-foreground/20" />
                      <div className="h-2 w-1/2 rounded bg-muted-foreground/20" />
                      <div className="h-2 w-3/4 rounded bg-muted-foreground/20" />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center shadow-md">
                        <Lock className="h-4 w-4 text-primary-foreground" />
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-foreground font-medium">
                    Essa receita faz parte da rotina desenhada pro seu dosha.
                  </p>
                </div>
              </div>
            ) : (
              <div className="relative rounded-xl border border-border bg-muted/30 p-4 overflow-hidden flex-1 min-h-[240px]">
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
            )}
          </div>
        </Card>

        {/* Coluna direita — a oferta */}
        <Card className="relative overflow-hidden rounded-2xl">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-secondary to-primary" />
          <div className="p-6 md:p-8 space-y-6 h-full flex flex-col">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
                Portal Ayurveda · Seu plano
              </p>
              <h2 className="font-serif text-2xl md:text-3xl text-foreground leading-tight">
                Sua rotina personalizada está pronta
              </h2>
              <p className="text-sm text-muted-foreground">{subtitulo}</p>
            </div>

            <ul className="space-y-2.5">
              {beneficios.map((b) => (
                <li key={b} className="flex items-start gap-2.5 text-sm text-foreground">
                  <Check className="h-4 w-4 text-secondary mt-0.5 shrink-0" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>

            <div className="border-t border-border pt-5 mt-auto flex flex-col gap-4">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-semibold text-foreground">R$30<span className="text-base font-normal text-muted-foreground">/mês</span></span>
                  <span className="text-sm text-muted-foreground">· sua rotina mensal</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  1 revisão inclusa
                </p>
              </div>
              <div className="flex flex-col items-start gap-1.5">
                <Button
                  onClick={desbloquear}
                  disabled={carregando}
                  size="lg"
                  className="bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-full px-6 w-full sm:w-auto"
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
      </div>

      {/* ===== Landing — conteúdo de apoio ===== */}
      <PaywallLanding
        doshaPrincipal={doshaPrincipal}
        onDesbloquear={desbloquear}
        carregando={carregando}
        top3={top3}
        vitrine={vitrine ?? []}
      />
    </div>
  );
};

// ===== Landing de apoio (abaixo do card-resumo) =====
interface PaywallLandingProps {
  doshaPrincipal: string | null;
  onDesbloquear: () => void;
  carregando: boolean;
  top3: { sintoma: string; dosha: string; prioridade: number }[];
  vitrine: { titulo: string; imagem_url: string; vata: number; pitta: number; kapha: number }[];
}

const PaywallLanding = ({ doshaPrincipal, onDesbloquear, carregando, top3, vitrine }: PaywallLandingProps) => {
  const dosha = doshaPrincipal ?? "seu dosha";

  const recebe = [
    { Icon: Sunrise, titulo: "Café da manhã", desc: "Receita completa: ingredientes, modo de preparo, vídeo do professor e por que funciona pro seu dosha." },
    { Icon: Coffee, titulo: "Lanche da manhã", desc: "Um lanche leve, certo pro seu agni nesse momento do dia." },
    { Icon: Soup, titulo: "Almoço", desc: `Prato completo (cereal, proteína, legume, acompanhamento) pra equilibrar ${dosha === "seu dosha" ? "seu dosha" : `seu ${dosha}`}.` },
    { Icon: Leaf, titulo: "Lanche da tarde", desc: "Um chá funcional pro seu estado atual." },
    { Icon: Soup, titulo: "Jantar", desc: "Sopa ou caldo, sempre quente, no horário certo." },
    { Icon: Moon, titulo: "Tônico da noite", desc: "30 min antes de dormir: o elixir certo pro seu dosha. Mingau, leite vegetal ou chá calmante, varia a cada dia." },
    { Icon: Sun, titulo: "Rotina da manhã", desc: "A prática do dia (abhyanga, pranayama, meditação) com instrução completa." },
    { Icon: Sparkles, titulo: "Prática do dia", desc: "Yoga, meditação ou respiração. Diferente a cada dia." },
  ];

  const paraQuemE = [
    "Cansado de conviver com intestino preso, inflamação, pele irritada e cansaço sem motivo — e suspeita que a causa está na rotina, não em mais um remédio.",
    "Já tentou dietas e suplementos que funcionam na teoria mas não no seu corpo — feitos pra uma média, não pra você.",
    "Quer parar de apagar incêndio e cuidar da causa.",
    "Entende que saúde se constrói no dia a dia e quer saber exatamente o que fazer, sem adivinhar.",
  ];

  const paraQuemNao = [
    "Quem acha que Ayurveda é só mais uma moda do momento.",
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

      {/* O Portal te conhece — top3 agravamentos */}
      {top3.length > 0 && (
        <section className="space-y-4">
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">O Portal te conhece</p>
          <h3 className="font-serif text-2xl text-primary">
            Alimentação e rotina ayurvédica para as suas principais enfermidades.
          </h3>
          <p className="text-foreground/85 leading-relaxed">
            No teste você marcou o que sente hoje. A gente não esqueceu — a sua rotina é montada em cima disto:
          </p>
          <div className="flex flex-wrap gap-2">
            {top3.map((a, i) => (
              <div
                key={i}
                className="border border-border bg-card rounded-lg px-3 py-2"
                style={{ borderLeft: "3px solid #FF7676" }}
              >
                <p className="text-[10px] uppercase tracking-wider font-medium" style={{ color: "#FF7676" }}>
                  {a.dosha}
                </p>
                <p className="text-foreground font-medium text-sm">{a.sintoma}</p>
              </div>
            ))}
          </div>
          <p className="text-foreground/85 leading-relaxed">
            Para cada um desses, o Ayurveda tem leitura, alimento e prática. É exatamente isso que entra na sua rotina — todo dia, no seu prato.
          </p>
          <p className="text-foreground/85 leading-relaxed">
            O primeiro passo você já deu: se interessou por Ayurveda e aprendeu sobre você. Agora é a hora de pôr em prática — com as receitas do seu biotipo e a revisão de todo mês.
          </p>
          <p className="font-serif text-lg text-primary">
            Permita que o Ayurveda chegue na sua vida de forma prática. São muitas rotinas — você escolhe por qual começar.
          </p>
        </section>
      )}

      {/* O que você recebe */}
      <section className="space-y-5">
        <h3 className="font-serif text-2xl text-primary">O que você recebe</h3>
        <p className="text-foreground/85 leading-relaxed">
          Baseado no seu dosha — e só no seu — um plano completo pros próximos 7 dias.
          Não é genérico, não é "dicas pra {dosha}". É o seu plano, calculado com seus scores reais.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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

      {/* Comida de verdade — vitrine */}
      <section className="space-y-4">
        <h3 className="font-serif text-2xl text-primary">Não é uma lista de dicas. É comida de verdade.</h3>
        <p className="text-foreground/85 leading-relaxed">
          Cada item do seu dia vem com ingredientes, modo de preparo, vídeo do professor e o porquê de funcionar pro seu desequilíbrio.
        </p>
        {vitrine.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {vitrine.map((r) => {
              const tags: string[] = [];
              if (r.vata < 0) tags.push("Vata");
              if (r.pitta < 0) tags.push("Pitta");
              if (r.kapha < 0) tags.push("Kapha");
              return (
                <div key={r.titulo} className="rounded-xl overflow-hidden border border-border bg-card">
                  <img
                    src={r.imagem_url}
                    alt={r.titulo}
                    className="w-full aspect-square object-cover"
                    loading="lazy"
                  />
                  <div className="px-3 py-2 space-y-1">
                    <p className="text-xs text-foreground leading-tight">{r.titulo}</p>
                    {tags.length > 0 && (
                      <p className="text-[10px] uppercase tracking-wider" style={{ color: "#FF7676" }}>
                        pacifica {tags.join("/")}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <p className="text-sm text-muted-foreground text-center pt-1">
          56 itens personalizados por semana. Estes são só oito.
        </p>
        <div className="flex justify-center">
          <Button
            onClick={onDesbloquear}
            disabled={carregando}
            size="lg"
            className="rounded-full px-8 h-12 text-base text-white hover:opacity-90"
            style={{ backgroundColor: "#FF7676" }}
          >
            {carregando ? "Abrindo checkout…" : "Ver a minha semana · R$30/mês"}
          </Button>
        </div>
      </section>

      {/* Depoimentos */}
      <section className="space-y-4">
        <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Quem já está seguindo</p>
        <h3 className="font-serif text-2xl text-primary">O que chega pra gente</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            "Nossa, achei tudo que eu queria pra ir pra cozinha 🙏",
            "Eu vim por causa de uma constipação crônica. O Ayurveda resolveu e ainda curou meu melasma. Não largo mais esse suco, Edson! Obrigada 💛",
            "Tava sentindo falta de coisa prática. Agora nunca mais.",
            "Achei que era pouca coisa. Tô surpresa com a riqueza de cada receita.",
            "Gente, mas é tudo muito gostoso! Achei que Ayurveda não era assim 😄",
            "E eu que achei que só ia tomar chá e comer salada… tô com o intestino bom e comendo bem.",
          ].map((t, i) => (
            <div key={i} className="bg-card border border-border rounded-2xl rounded-bl-sm px-4 py-3">
              <p className="text-sm text-foreground leading-relaxed">{t}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Revisão mensal */}
      <section className="space-y-3">
        <h3 className="font-serif text-2xl text-primary">Uma rotina viva</h3>
        <p className="text-foreground/85 leading-relaxed">
          Todo mês, seu plano é revisado. Seu dosha muda com as estações, o estresse, a fase da vida.
          A revisão ajusta o plano pra onde você está agora — não pra onde estava há três meses.
          É um acompanhamento mensal do seu equilíbrio. Por R$30.
        </p>
        <p className="text-foreground/85 leading-relaxed">
          E ela cresce: o caderno de receitas e práticas do Portal aumenta o tempo todo. Toda vez que
          entra coisa nova, ela passa a valer pra sua rotina — sem você fazer nada, sem pagar de novo.
          O que você assina hoje é maior no mês que vem.
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
                  <X className="h-4 w-4 mt-0.5 shrink-0" />
                  <span className="leading-relaxed">{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Perguntas comuns */}
      <section className="space-y-4">
        <div className="border-t border-border pt-4">
          <p className="font-medium text-foreground">«Já fiz o teste de graça. Por que pagar?»</p>
          <p className="text-foreground/85 leading-relaxed mt-2">
            O teste mostra onde você está. A rotina é o que te tira de lá. Saber o diagnóstico sem o tratamento é ter o raio-x e não ter o remédio.
          </p>
        </div>
        <div className="border-t border-border pt-4">
          <p className="font-medium text-foreground">«Por que pagar todo mês e não uma vez só?»</p>
          <p className="text-foreground/85 leading-relaxed mt-2">
            Porque seu corpo não é o mesmo todo mês. O estresse muda, a estação muda, o sono muda. Uma rotina fixa envelhece — a sua é revisada pra continuar certa.
          </p>
        </div>
        <div className="border-t border-border pt-4">
          <p className="font-medium text-foreground">«E se não for pra mim?»</p>
          <p className="text-foreground/85 leading-relaxed mt-2">
            Cancele quando quiser, na hora. Sem multa, sem ligação, sem perguntas. Você arrisca R$30 de um mês.
          </p>
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
