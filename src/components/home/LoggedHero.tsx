import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { TrendingUp, FileText, Play, AlertTriangle, Flame, Award, ChefHat, ArrowRight, Check } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/contexts/UserContext";
import BannerSlot from "@/components/banners/BannerSlot";
import { Button } from "@/components/ui/button";

const C = {
  primary: "#352F54",
  vata: "hsl(var(--vata))",
  pitta: "hsl(var(--pitta))",
  kapha: "hsl(var(--kapha))",
};

const PIE_COLORS: Record<string, string> = {
  Vata: C.vata,
  Pitta: C.pitta,
  Kapha: C.kapha,
};

const VATA_LEVELS = [
  { label: "Fixado", min: 50, max: 999 },
  { label: "Adoecido", min: 36, max: 49 },
  { label: "Acúmulo", min: 25, max: 35 },
  { label: "Normal", min: 17, max: 24 },
  { label: "Pouco", min: 0, max: 16 },
];
const PITTA_LEVELS = [
  { label: "Fixado", min: 50, max: 999 },
  { label: "Adoecido", min: 41, max: 49 },
  { label: "Acúmulo", min: 31, max: 40 },
  { label: "Normal", min: 20, max: 30 },
  { label: "Pouco", min: 0, max: 19 },
];
const KAPHA_LEVELS = [
  { label: "Fixado", min: 60, max: 999 },
  { label: "Adoecido", min: 51, max: 59 },
  { label: "Acúmulo", min: 36, max: 50 },
  { label: "Normal", min: 15, max: 35 },
  { label: "Pouco", min: 0, max: 14 },
];
const LEVELS_BY: Record<string, typeof VATA_LEVELS> = {
  Vata: VATA_LEVELS,
  Pitta: PITTA_LEVELS,
  Kapha: KAPHA_LEVELS,
};

const getLevelInfo = (dosha: string, score: number) => {
  const levels = LEVELS_BY[dosha] || VATA_LEVELS;
  for (let i = 0; i < levels.length; i++) {
    if (score >= levels[i].min && score <= levels[i].max) {
      return { label: levels[i].label, levelNum: levels.length - i };
    }
  }
  return { label: "Normal", levelNum: 2 };
};

interface EvolucaoData {
  ok?: boolean;
  pontos?: number;
  classe?: string | null;
  streak?: number;
  streak_recorde?: number;
  proxima_classe?: string | null;
  pontos_para_proxima?: number | null;
  selo_terapeuta?: boolean;
  retorno_feito_hoje?: boolean;
  receita_feita_hoje?: boolean;
}

const LoggedHero = () => {
  const { doshaResult, profile, user } = useUser();
  const queryClient = useQueryClient();
  const id = doshaResult?.idPublico;
  const meuDoshaBase = id ? `/meu-dosha?id=${id}` : "/meu-dosha";

  const vata = doshaResult?.vatascore ?? 0;
  const pitta = doshaResult?.pittascore ?? 0;
  const kapha = doshaResult?.kaphascore ?? 0;
  const total = vata + pitta + kapha;

  const doshaScores = [
    { name: "Vata", score: vata },
    { name: "Pitta", score: pitta },
    { name: "Kapha", score: kapha },
  ];
  const pieData = doshaScores.map((d) => ({ name: d.name, value: d.score }));

  const primaryDosha = doshaResult?.doshaprincipal?.split("-")[0] || "Vata";
  const primaryScore = doshaScores.find((d) => d.name === primaryDosha)?.score ?? 0;
  const topInfo = getLevelInfo(primaryDosha, primaryScore);

  const temAcessoRotina =
    profile?.is_premium === true ||
    (profile?.subscription_status === "active" &&
      ["rotina", "mensal", "anual"].includes(profile?.plano ?? "") &&
      (!profile?.premium_until || new Date(profile.premium_until) > new Date()));

  // Evolução
  const { data: evolucao } = useQuery({
    queryKey: ["minha-evolucao", user?.id],
    queryFn: async () => {
      const { data } = await (supabase.rpc as any)("get_minha_evolucao");
      return (data ?? {}) as EvolucaoData;
    },
    enabled: !!user,
    staleTime: 60 * 1000,
  });

  // Receita do dia
  const { data: receita } = useQuery({
    queryKey: ["logged-hero-receita-dia"],
    queryFn: async () => {
      const { data } = await supabase.rpc("receita_do_dia");
      return (Array.isArray(data) ? data[0] : data) ?? null;
    },
    staleTime: 60 * 60 * 1000,
  });

  // Artigo & vídeo personalizado (mantidos)
  const { data: artigo } = useQuery({
    queryKey: ["logged-hero-artigo", primaryDosha],
    queryFn: async () => {
      const { data } = await supabase
        .from("portal_conteudo")
        .select("id, title, link_do_artigo, image_url, tags")
        .ilike("tags", `%${primaryDosha}%`)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data) return data;
      const { data: fb } = await supabase
        .from("portal_conteudo")
        .select("id, title, link_do_artigo, image_url, tags")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return fb;
    },
    enabled: !!primaryDosha,
    staleTime: 30 * 60 * 1000,
  });

  const { data: video } = useQuery({
    queryKey: ["logged-hero-video", primaryDosha],
    queryFn: async () => {
      const table = (
        primaryDosha === "Pitta" ? "portal_pitta" : primaryDosha === "Kapha" ? "portal_kapha" : "portal_vata"
      ) as "portal_pitta" | "portal_kapha" | "portal_vata";
      const { data } = await supabase
        .from(table)
        .select("video_id, novo_titulo")
        .not("novo_titulo", "is", null)
        .order("criado_em", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
    enabled: !!primaryDosha,
    staleTime: 30 * 60 * 1000,
  });

  const rawFirst = doshaResult?.nome?.split(" ")[0] || profile?.nome?.split(" ")[0] || "";
  const firstName = rawFirst ? rawFirst.charAt(0).toUpperCase() + rawFirst.slice(1).toLowerCase() : "";

  const pontos = evolucao?.pontos ?? 0;
  const classe = evolucao?.classe ?? "Iniciante";
  const proximaClasse = evolucao?.proxima_classe;
  const pontosParaProxima = evolucao?.pontos_para_proxima ?? null;
  const streak = evolucao?.streak ?? 0;
  const streakRecorde = evolucao?.streak_recorde ?? 0;
  const retornoFeitoHoje = evolucao?.retorno_feito_hoje === true;
  const receitaFeitaHoje = evolucao?.receita_feita_hoje === true;
  const seloTerapeuta = evolucao?.selo_terapeuta === true;

  const progressoPct =
    pontosParaProxima !== null && pontosParaProxima !== undefined && pontosParaProxima > 0
      ? Math.max(0, Math.min(100, (pontos / (pontos + pontosParaProxima)) * 100))
      : 100;

  const receitaSlug = (receita as any)?.video_id ?? (receita as any)?.url ?? "receita";
  const marcarReceita = async () => {
    if (receitaFeitaHoje) return;
    const { data, error } = await (supabase.rpc as any)("evolucao_registrar", {
      p_tipo: "receita_feita",
      p_ref: String(receitaSlug),
    });
    if (error) return;
    if (data?.ok) {
      toast.success(`+${data.pontos_ganhos ?? 2} pts! 🔥 streak de ${data.streak ?? streak} dias`);
      queryClient.invalidateQueries({ queryKey: ["minha-evolucao", user?.id] });
    } else if (data?.erro) {
      toast(data.erro);
    }
  };

  const receitaTitulo = (receita as any)?.novo_titulo ?? (receita as any)?.titulo_original ?? "Receita do dia";
  const receitaResumo = (receita as any)?.mini_resumo ?? (receita as any)?.legenda ?? "";

  return (
    <section
      className="relative overflow-hidden min-h-[560px]"
      style={{
        background: "linear-gradient(100deg, hsl(228 70% 96%) 0%, hsl(0 70% 97%) 50%, hsl(48 80% 95%) 100%)",
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-10">
        <div className="text-center mb-5">
          <h1
            className="font-serif font-bold text-xl md:text-2xl lg:text-[26px] leading-tight"
            style={{ color: C.primary }}
          >
            Bem-vindo de volta{firstName ? `, ${firstName}` : ""}.
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            Seu mapa biológico, em tempo real.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* ESQUERDA: Slot A + Slot B */}
          <div className="lg:col-span-3 flex flex-col gap-4 order-2 lg:order-1">
            {/* SLOT A */}
            <div className="group/slotA contents">
              <BannerSlot slot="loggedhero" />
              <div className="group-has-[div]/slotA:hidden bg-card rounded-2xl p-5 md:p-6 border border-border shadow-md">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Próximo passo da sua jornada
                </p>
                {temAcessoRotina ? (
                  <>
                    <h3 className="font-serif font-bold text-lg md:text-xl mt-1" style={{ color: C.primary }}>
                      Sua rotina de hoje
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Os cuidados personalizados desenhados para o seu momento.
                    </p>
                    <Link
                      to="/minha-rotina"
                      className="inline-flex items-center gap-1.5 mt-3 text-sm font-semibold"
                      style={{ color: C.primary }}
                    >
                      Sua rotina de hoje <ArrowRight className="h-4 w-4" />
                    </Link>
                  </>
                ) : (
                  <>
                    <h3 className="font-serif font-bold text-lg md:text-xl mt-1" style={{ color: C.primary }}>
                      Monte sua rotina personalizada
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Alimentação, sono e cuidados diários baseados no seu dosha.
                    </p>
                    <Button asChild size="lg" variant="secondary" className="mt-3">
                      <Link to="/minha-rotina">Começar agora</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* SLOT B */}
            <div className="group/slotB contents">
              <BannerSlot slot="loggedhero_b" />
              <div className="group-has-[div]/slotB:hidden bg-card rounded-2xl p-4 md:p-5 border border-border shadow-sm flex gap-4 items-center">
                <div
                  className="shrink-0 w-14 h-14 rounded-xl flex items-center justify-center"
                  style={{ background: `${C.pitta}22` }}
                >
                  <ChefHat className="h-7 w-7" style={{ color: C.pitta }} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Receita do dia
                  </p>
                  <p className="font-serif font-bold text-sm md:text-base leading-tight mt-0.5 line-clamp-1" style={{ color: C.primary }}>
                    {receitaTitulo}
                  </p>
                  {receitaResumo && (
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{receitaResumo}</p>
                  )}
                </div>
                <Button
                  size="sm"
                  variant={receitaFeitaHoje ? "outline" : "secondary"}
                  disabled={receitaFeitaHoje || !user}
                  onClick={marcarReceita}
                  className="shrink-0"
                >
                  {receitaFeitaHoje ? (
                    <>
                      <Check className="h-4 w-4 mr-1" /> Feita hoje
                    </>
                  ) : (
                    "Fiz (+2 pts)"
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* DIREITA: SEU HOJE — forma de folha */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            <div
              className="bg-card border border-border shadow-md p-4 md:p-5 h-full"
              style={{
                borderTopLeftRadius: "1.5rem",
                borderBottomRightRadius: "1.5rem",
                borderTopRightRadius: "0.125rem",
                borderBottomLeftRadius: "0.125rem",
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Seu Hoje</p>
                {seloTerapeuta && (
                  <span
                    className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: `${C.primary}14`, color: C.primary }}
                  >
                    <Award className="h-3 w-3" /> Terapeuta
                  </span>
                )}
              </div>

              {/* Pie + link */}
              <div className="flex items-center gap-3">
                <div className="shrink-0" style={{ width: 96, height: 96 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        outerRadius={44}
                        innerRadius={26}
                        dataKey="value"
                        startAngle={90}
                        endAngle={-270}
                        stroke="hsl(var(--card))"
                        strokeWidth={2}
                      >
                        {pieData.map((entry) => (
                          <Cell key={entry.name} fill={PIE_COLORS[entry.name]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-serif font-bold text-sm leading-tight" style={{ color: C.primary }}>
                    {primaryDosha} — {topInfo.label}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {primaryScore} pts{total > 0 ? ` (${Math.round((primaryScore / total) * 100)}%)` : ""}
                  </p>
                  <Link
                    to={meuDoshaBase}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold mt-1"
                    style={{ color: C.primary }}
                  >
                    ver mapa completo <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>

              {/* Classe + progresso */}
              <div className="mt-3 pt-3 border-t border-border">
                <div className="flex items-baseline justify-between">
                  <p className="font-serif font-bold text-base" style={{ color: C.primary }}>
                    {classe}
                  </p>
                  <p className="text-xs text-muted-foreground">{pontos} pts</p>
                </div>
                <div className="mt-1.5 h-1.5 rounded-full overflow-hidden" style={{ background: `${C.primary}14` }}>
                  <div
                    className="h-full transition-all"
                    style={{ width: `${progressoPct}%`, background: C.primary }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {proximaClasse
                    ? `faltam ${pontosParaProxima} pts para ${proximaClasse}`
                    : "classe máxima"}
                </p>
              </div>

              {/* Streak */}
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Flame className="h-4 w-4" style={{ color: C.pitta }} />
                  <span className="text-sm font-semibold" style={{ color: C.primary }}>
                    {streak > 0 ? `${streak} dias seguidos` : "Comece seu streak hoje"}
                  </span>
                </div>
                {streakRecorde > 0 && (
                  <span className="text-[10px] text-muted-foreground">recorde {streakRecorde}</span>
                )}
              </div>

              {/* Gesto de hoje */}
              <div className="mt-3 pt-3 border-t border-border">
                {retornoFeitoHoje ? (
                  <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: C.kapha.replace("hsl(var(--kapha))", "hsl(var(--kapha))") }}>
                    <Check className="h-4 w-4" /> Ponto de hoje garantido
                  </div>
                ) : (
                  <Link
                    to="/biblioteca"
                    className="flex items-center justify-between gap-2 text-xs font-semibold group"
                    style={{ color: C.primary }}
                  >
                    <span>Ganhe seu ponto de hoje: curta um conteúdo</span>
                    <ArrowRight className="h-4 w-4 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: 3 dados personalizados */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 min-h-[280px] md:min-h-[96px]">
          <Link
            to={`${meuDoshaBase}&tab=metricas`}
            className="group bg-card rounded-2xl p-3 border border-border shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md flex gap-3"
          >
            <div className="shrink-0 w-16 h-16 rounded-xl flex items-end justify-center gap-1 p-1.5"
              style={{ background: `${PIE_COLORS[primaryDosha]}14` }}
            >
              {doshaScores.map((d) => {
                const info = getLevelInfo(d.name, d.score);
                const heightPct = (info.levelNum / 5) * 100;
                return (
                  <div
                    key={d.name}
                    className="w-2.5 rounded-t-sm"
                    style={{
                      height: `${heightPct}%`,
                      background: PIE_COLORS[d.name],
                      minHeight: 4,
                    }}
                  />
                );
              })}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                {topInfo.label === "Fixado" || topInfo.label === "Adoecido" ? (
                  <AlertTriangle className="h-3 w-3" style={{ color: PIE_COLORS[primaryDosha] }} />
                ) : (
                  <TrendingUp className="h-3 w-3" style={{ color: PIE_COLORS[primaryDosha] }} />
                )}
                Métrica em destaque
              </p>
              <p className="font-serif font-bold text-sm leading-tight mt-0.5" style={{ color: C.primary }}>
                {primaryDosha} — {topInfo.label}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {primaryScore} pts
                {total > 0 ? ` (${Math.round((primaryScore / total) * 100)}%)` : ""}
              </p>
            </div>
          </Link>

          <Link
            to={`${meuDoshaBase}&tab=artigos&mode=personalizado`}
            className="group bg-card rounded-2xl p-3 border border-border shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md flex gap-3"
          >
            <div className="shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-muted flex items-center justify-center"
              style={{ background: `${C.primary}14` }}
            >
              {artigo?.image_url ? (
                <img
                  src={artigo.image_url}
                  alt={artigo.title || "Artigo"}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                <FileText className="h-6 w-6" style={{ color: C.primary }} />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <FileText className="h-3 w-3" style={{ color: C.primary }} />
                Artigo pra você
              </p>
              <p className="font-serif font-bold text-sm leading-tight mt-0.5 line-clamp-2" style={{ color: C.primary }}>
                {artigo?.title || "Carregando…"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Recomendação personalizada</p>
            </div>
          </Link>

          <Link
            to={`${meuDoshaBase}&tab=videos&mode=personalizado`}
            className="group bg-card rounded-2xl p-3 border border-border shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md flex gap-3"
          >
            <div className="shrink-0 relative w-16 h-16 rounded-xl overflow-hidden bg-muted flex items-center justify-center"
              style={{ background: `${C.pitta}14` }}
            >
              {video?.video_id ? (
                <>
                  <img
                    src={`https://img.youtube.com/vi/${video.video_id}/mqdefault.jpg`}
                    alt={video.novo_titulo || "Vídeo"}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = "none";
                    }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <Play className="h-5 w-5 text-white drop-shadow" fill="white" />
                  </span>
                </>
              ) : (
                <Play className="h-6 w-6" style={{ color: C.pitta }} fill="currentColor" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <Play className="h-3 w-3" style={{ color: C.pitta }} fill="currentColor" />
                Vídeo pra você
              </p>
              <p className="font-serif font-bold text-sm leading-tight mt-0.5 line-clamp-2" style={{ color: C.primary }}>
                {video?.novo_titulo || "Carregando…"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Recomendação personalizada</p>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default LoggedHero;
