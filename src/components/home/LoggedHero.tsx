import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, FileText, Play, AlertTriangle, ChevronRight } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/contexts/UserContext";

const C = {
  primary: "#352F54",
  vata: "#4F75FF",
  pitta: "#FF5C5C",
  kapha: "#22C55E",
  surface: "#FFF8EE",
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
  { label: "Normal", min: 15, max: 24 },
  { label: "Pouco", min: 0, max: 14 },
];
const PITTA_LEVELS = [
  { label: "Fixado", min: 50, max: 999 },
  { label: "Adoecido", min: 41, max: 49 },
  { label: "Acúmulo", min: 31, max: 40 },
  { label: "Normal", min: 15, max: 30 },
  { label: "Pouco", min: 0, max: 14 },
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

const SCALE: Record<string, string[]> = {
  Vata: ["#D6E0FF", "#A3C1FF", "#709AFF", "#4F75FF", "#2A4BCC"],
  Pitta: ["#FFE0E0", "#FFB3B3", "#FF8585", "#FF5C5C", "#CC3333"],
  Kapha: ["#D1F4E0", "#9AE6B8", "#5ED58F", "#22C55E", "#15803D"],
};

const LEVEL_LABELS = ["Fixado", "Adoecido", "Acúmulo", "Normal", "Pouco"];

const getLevelInfo = (dosha: string, score: number) => {
  const levels = LEVELS_BY[dosha] || VATA_LEVELS;
  for (let i = 0; i < levels.length; i++) {
    if (score >= levels[i].min && score <= levels[i].max) {
      return { label: levels[i].label, levelNum: levels.length - i };
    }
  }
  return { label: "Normal", levelNum: 2 };
};

const LoggedHero = () => {
  const { doshaResult, profile } = useUser();
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

  // Personalized article (latest)
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

  // Personalized video
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

  return (
    <section
      className="relative overflow-hidden"
      style={{
        background: "linear-gradient(100deg, hsl(228 70% 96%) 0%, hsl(0 70% 97%) 50%, hsl(48 80% 95%) 100%)",
      }}
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 md:py-10">
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

        {/* Clinical Dashboard — espelha estrutura do /meu-dosha */}
        <Link
          to={meuDoshaBase}
          className="group relative block bg-card rounded-2xl p-4 md:p-5 pr-10 md:pr-12 border border-border shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg"
          aria-label="Continuar para meu perfil"
        >
          <div className="grid grid-cols-1 sm:grid-cols-[1.2fr_1fr] gap-4 items-center">
            {/* Pie */}
            <div className="flex flex-col items-center">
              <h2 className="font-serif font-bold text-foreground text-sm mb-1">
                Pontuação dos Doshas
              </h2>
              <div className="w-full" style={{ height: 180 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart margin={{ top: 12, right: 40, bottom: 12, left: 40 }} className="text-center">
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={58}
                      innerRadius={26}
                      dataKey="value"
                      startAngle={90}
                      endAngle={-270}
                      stroke="hsl(var(--card))"
                      strokeWidth={2}
                      label={({ name, value }: any) => `${name} ${value}`}
                      labelLine={false}
                      style={{ fontSize: 10, fontWeight: 600 }}
                    >
                      {pieData.map((entry) => (
                        <Cell key={entry.name} fill={PIE_COLORS[entry.name]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Quadro Clínico */}
            <div>
              <h2 className="font-serif font-bold text-foreground text-sm mb-2">
                Quadro Clínico
              </h2>
              <div className="grid grid-cols-[auto_1fr_1fr_1fr] gap-x-1.5 gap-y-[3px]">
                {LEVEL_LABELS.map((label, rowIdx) => {
                  const levelNum = 5 - rowIdx;
                  return (
                    <div key={label} className="contents">
                      <span className="text-[9px] font-semibold text-muted-foreground pr-1 flex items-center justify-end h-7 leading-none">
                        {label}
                      </span>
                      {doshaScores.map((d) => {
                        const info = getLevelInfo(d.name, d.score);
                        const filled = levelNum <= info.levelNum;
                        return (
                          <div
                            key={d.name}
                            className="h-7 rounded-sm"
                            style={
                              filled
                                ? { background: SCALE[d.name][levelNum - 1] }
                                : { background: "hsl(var(--muted) / 0.3)" }
                            }
                          />
                        );
                      })}
                    </div>
                  );
                })}
              </div>
              <div className="grid grid-cols-[auto_1fr_1fr_1fr] gap-x-1.5 mt-1.5">
                <div />
                {doshaScores.map((d) => (
                  <p key={d.name} className="text-[10px] font-bold text-center" style={{ color: PIE_COLORS[d.name] }}>
                    {d.name}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* Lateral arrow — "continue para seu perfil" */}
          <div
            className="absolute right-0 top-0 bottom-0 flex items-center justify-center w-8 md:w-10 rounded-r-2xl transition-all group-hover:brightness-110 text-primary bg-primary"
            aria-hidden="true"
          >
            <ChevronRight
              className="h-5 w-5 text-white transition-transform group-hover:translate-x-0.5"
            />
          </div>
          <span className="sr-only">Continue para seu perfil</span>
        </Link>

        {/* Bottom: 3 dados personalizados — métrica, artigo, vídeo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
          {/* Métrica destaque — mini barras */}
          <Link
            to={`${meuDoshaBase}&tab=metricas`}
            className="group bg-card rounded-2xl p-3 border border-border shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md flex gap-3"
          >
            {/* mini bars preview */}
            <div className="shrink-0 w-16 h-16 rounded-xl flex items-end justify-center gap-1 p-1.5"
              style={{ background: `${PIE_COLORS[primaryDosha]}14` }}
            >
              {doshaScores.map((d) => {
                const info = getLevelInfo(d.name, d.score);
                const heightPct = (info.levelNum / 5) * 100;
                return (
                  <div
                    key={d.name}
                    className="w-2.5 rounded-t-sm flex items-end"
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

          {/* Artigo personalizado — com mini foto */}
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
              <p
                className="font-serif font-bold text-sm leading-tight mt-0.5 line-clamp-2"
                style={{ color: C.primary }}
              >
                {artigo?.title || "Carregando…"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Recomendação personalizada</p>
            </div>
          </Link>

          {/* Vídeo personalizado — com thumbnail YouTube */}
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
              <p
                className="font-serif font-bold text-sm leading-tight mt-0.5 line-clamp-2"
                style={{ color: C.primary }}
              >
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
