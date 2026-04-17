import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, FileText, Play, AlertTriangle } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/contexts/UserContext";
import { slugify } from "@/lib/slugify";

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
  const topInfo = getLevelInfo(primaryDosha, doshaScores.find((d) => d.name === primaryDosha)?.score ?? 0);

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
      // fallback
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

  const firstName = doshaResult?.nome?.split(" ")[0] || profile?.nome?.split(" ")[0] || "";

  return (
    <section
      className="relative overflow-hidden"
      style={{ background: `linear-gradient(180deg, ${C.surface} 0%, #ffffff 100%)` }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-14">
        <div className="text-center mb-6">
          <h1
            className="font-serif font-bold text-2xl md:text-3xl lg:text-[32px] leading-tight"
            style={{ color: C.primary }}
          >
            Bem-vindo de volta{firstName ? `, ${firstName}` : ""}.
          </h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            Seu mapa biológico, em tempo real.
          </p>
        </div>

        {/* Top: Pie + Quadro Clínico (clickable → /meu-dosha) */}
        <Link
          to={meuDoshaBase}
          className="block bg-card rounded-3xl p-5 md:p-7 border border-border shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
          aria-label="Ver meu perfil completo"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Pie */}
            <div className="flex flex-col items-center">
              <h2 className="font-serif font-bold text-base mb-2" style={{ color: C.primary }}>
                Pontuação dos Doshas
              </h2>
              <div className="w-full" style={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart margin={{ top: 10, right: 50, bottom: 10, left: 50 }}>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={62}
                      innerRadius={28}
                      dataKey="value"
                      stroke="hsl(var(--card))"
                      strokeWidth={2}
                      label={({ name, value }: any) => `${name} ${value}`}
                      labelLine={false}
                      style={{ fontSize: 11, fontWeight: 600 }}
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
              <h2 className="font-serif font-bold text-base mb-3 text-center" style={{ color: C.primary }}>
                Quadro Clínico
              </h2>
              <div className="grid grid-cols-[auto_1fr_1fr_1fr] gap-x-1.5 gap-y-[3px]">
                {LEVEL_LABELS.map((label, rowIdx) => {
                  const levelNum = 5 - rowIdx;
                  return (
                    <div key={label} className="contents">
                      <span className="text-[10px] font-semibold text-muted-foreground pr-1 flex items-center justify-end h-7 leading-none">
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
        </Link>

        {/* Bottom: 3 columns — métrica / artigo / vídeo personalizados */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mt-4">
          {/* Métrica destaque */}
          <Link
            to={`${meuDoshaBase}&tab=metricas`}
            className="group bg-card rounded-2xl p-4 border border-border shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md flex items-start gap-3"
          >
            <div
              className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: `${PIE_COLORS[primaryDosha]}1A`, color: PIE_COLORS[primaryDosha] }}
            >
              {topInfo.label === "Fixado" || topInfo.label === "Adoecido" ? (
                <AlertTriangle className="h-5 w-5" />
              ) : (
                <TrendingUp className="h-5 w-5" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Métrica em destaque
              </p>
              <p className="font-serif font-bold text-sm leading-tight mt-0.5" style={{ color: C.primary }}>
                {primaryDosha} — {topInfo.label}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {doshaScores.find((d) => d.name === primaryDosha)?.score ?? 0} pts
                {total > 0 ? ` (${Math.round(((doshaScores.find((d) => d.name === primaryDosha)?.score ?? 0) / total) * 100)}%)` : ""}
              </p>
            </div>
          </Link>

          {/* Artigo personalizado */}
          <Link
            to={`${meuDoshaBase}&tab=artigos&mode=personalizado`}
            className="group bg-card rounded-2xl p-4 border border-border shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md flex items-start gap-3"
          >
            <div
              className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: `${C.primary}14`, color: C.primary }}
            >
              <FileText className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
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

          {/* Vídeo personalizado */}
          <Link
            to={`${meuDoshaBase}&tab=videos&mode=personalizado`}
            className="group bg-card rounded-2xl p-4 border border-border shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md flex items-start gap-3"
          >
            <div
              className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: `${C.pitta}1A`, color: C.pitta }}
            >
              <Play className="h-5 w-5" fill="currentColor" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
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
