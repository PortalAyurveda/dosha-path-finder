import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import * as LucideIcons from "lucide-react";
import { Flame, Award, ChefHat, ArrowRight, Check, Leaf } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

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

const DOSHA_HSL: Record<string, string> = {
  Vata: "var(--vata)",
  Pitta: "var(--pitta)",
  Kapha: "var(--kapha)",
};

// Forma de folha: dois cantos opostos arredondados
const LEAF_RADIUS = {
  borderTopLeftRadius: "1rem",
  borderBottomRightRadius: "1rem",
  borderTopRightRadius: "0.125rem",
  borderBottomLeftRadius: "0.125rem",
} as const;

const LEAF_RADIUS_SM = {
  borderTopLeftRadius: "0.625rem",
  borderBottomRightRadius: "0.625rem",
  borderTopRightRadius: "0.125rem",
  borderBottomLeftRadius: "0.125rem",
} as const;

type Objetivo = { verbo: "Acalmar" | "Nutrir"; dosha: "Vata" | "Pitta" | "Kapha" };

function calcObjetivos(v: number, p: number, k: number): Objetivo[] {
  const arr = [
    { dosha: "Vata" as const, score: v },
    { dosha: "Pitta" as const, score: p },
    { dosha: "Kapha" as const, score: k },
  ].sort((a, b) => b.score - a.score);
  const [top, mid, low] = arr;
  const out: Objetivo[] = [{ verbo: "Acalmar", dosha: top.dosha }];
  if (top.score > 0 && mid.score >= 0.8 * top.score) {
    out.push({ verbo: "Acalmar", dosha: mid.dosha });
  }
  out.push({ verbo: "Nutrir", dosha: low.dosha });
  return out;
}

const ObjetivoChip = ({ verbo, dosha }: Objetivo) => {
  const token = DOSHA_HSL[dosha];
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold"
      style={{
        ...LEAF_RADIUS_SM,
        background: `hsl(${token} / 0.14)`,
        color: `hsl(${token})`,
        boxShadow: `0 0 10px hsl(${token} / 0.28)`,
      }}
    >
      <Leaf className="h-2.5 w-2.5" />
      {verbo} {dosha}
    </span>
  );
};

const ScoreMiniChip = ({ dosha, score }: { dosha: "Vata" | "Pitta" | "Kapha"; score: number }) => {
  const token = DOSHA_HSL[dosha];
  const sign = score > 0 ? "+" : "−";
  return (
    <span
      className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold rounded-md"
      style={{
        background: `hsl(${token} / 0.14)`,
        color: `hsl(${token})`,
        boxShadow: `0 0 6px hsl(${token} / 0.25)`,
      }}
    >
      {dosha.charAt(0)} {sign}{Math.abs(score)}
    </span>
  );
};

const ObjetivosRow = ({ objetivos }: { objetivos: Objetivo[] }) => (
  <div>
    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
      Seu objetivo
    </p>
    <div className="flex flex-wrap gap-1.5 mt-1.5">
      {objetivos.map((o, i) => (
        <ObjetivoChip key={`${o.verbo}-${o.dosha}-${i}`} {...o} />
      ))}
    </div>
  </div>
);

// Uma carta "ficha de receita" — usada na frente e nas cartas de trás do baralho
const RecipeCard = ({
  nug,
  IconEl,
  variant = "front",
}: {
  nug: any;
  IconEl: React.ComponentType<{ className?: string; style?: React.CSSProperties }> | null;
  variant?: "front" | "back";
}) => {
  const isBack = variant === "back";
  const ingredientes: { qtd?: string; item?: string }[] =
    Array.isArray(nug?.nugget_json?.ingredientes) ? nug.nugget_json.ingredientes : [];
  const primeiros = ingredientes.slice(0, 3);

  return (
    <div
      className="relative overflow-hidden select-none"
      style={{
        width: 130,
        height: 150,
        background: "#FDFBF5",
        border: "1px solid rgba(53,47,84,0.08)",
        ...LEAF_RADIUS_SM,
      }}
    >
      {nug?.imagem_url && !isBack ? (
        <div className="h-full w-full flex flex-col">
          <div className="w-full overflow-hidden" style={{ aspectRatio: "4 / 3" }}>
            <img
              src={nug.imagem_url}
              alt={nug?.titulo || ""}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="px-2 py-1.5 flex-1 flex items-center">
            <p
              className="font-serif font-bold leading-tight line-clamp-2"
              style={{ color: C.primary, fontSize: 10 }}
            >
              {nug?.titulo || "Receita"}
            </p>
          </div>
        </div>
      ) : (
        <div className="p-2.5 h-full flex flex-col">
          <div className="flex items-center gap-1.5 mb-1">
            {IconEl ? (
              <IconEl className="h-3 w-3" style={{ color: C.primary }} />
            ) : (
              <Leaf className="h-3 w-3" style={{ color: C.primary }} />
            )}
            <div
              className="h-px flex-1"
              style={{ background: "rgba(53,47,84,0.15)" }}
            />
          </div>
          <p
            className="font-serif font-bold leading-tight line-clamp-2"
            style={{
              color: C.primary,
              fontSize: 10,
              minHeight: 26,
            }}
          >
            {nug?.titulo || "Receita"}
          </p>
          {!isBack && (
            <ul
              className="mt-1.5 space-y-0.5 flex-1"
              style={{ color: "rgba(53,47,84,0.75)", fontSize: 8, lineHeight: 1.35 }}
            >
              {primeiros.length > 0 ? (
                primeiros.slice(0, 2).map((i, idx) => (
                  <li key={idx} className="line-clamp-1">
                    • {i.qtd ? `${i.qtd} ` : ""}{i.item || ""}
                  </li>
                ))
              ) : (
                <>
                  <li className="line-clamp-1">• ingrediente 1</li>
                  <li className="line-clamp-1">• ingrediente 2</li>
                </>
              )}
            </ul>
          )}
          {!isBack && (
            <div
              className="absolute left-0 right-0 bottom-0 h-10 pointer-events-none"
              style={{
                background: "linear-gradient(to bottom, rgba(253,251,245,0) 0%, #FDFBF5 90%)",
              }}
            />
          )}
        </div>
      )}
    </div>
  );
};

// Baralho decorativo — frente + até 2 cartas atrás. Só desktop (lg+).
const RecipeDeck = ({
  front,
  back,
  IconEl,
}: {
  front: any;
  back: any[];
  IconEl: React.ComponentType<{ className?: string; style?: React.CSSProperties }> | null;
}) => {
  const backCards = back.slice(0, 2);
  const rotations = [-6, 5];
  const offsetsX = [-10, 12];
  const offsetsY = [6, 10];

  return (
    <div
      className="hidden lg:block shrink-0 self-center relative"
      style={{
        width: 156,
        height: 172,
        filter:
          "drop-shadow(0 4px 8px rgba(53,47,84,0.18)) drop-shadow(0 18px 30px rgba(53,47,84,0.12))",
      }}
    >
      {backCards.map((nug, i) => (
        <div
          key={nug?.id ?? i}
          aria-hidden
          className="absolute pointer-events-none"
          style={{
            top: "50%",
            left: "50%",
            transform: `translate(-50%, -50%) translate(${offsetsX[i]}px, ${offsetsY[i]}px) rotate(${rotations[i]}deg) scale(0.92)`,
            opacity: 0.85,
            zIndex: i + 1,
          }}
        >
          <RecipeCard nug={nug} IconEl={IconEl} variant="back" />
        </div>
      ))}
      <div
        className="absolute"
        style={{
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%) rotate(-2deg)",
          zIndex: 10,
        }}
      >
        <RecipeCard nug={front} IconEl={IconEl} variant="front" />
      </div>
    </div>
  );
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

  // Preview da rotina de hoje (só quando o usuário tem acesso)
  const { data: testeId } = useQuery({
    queryKey: ["logged-hero-teste-id", doshaResult?.idPublico],
    enabled: !!doshaResult?.idPublico && !!temAcessoRotina,
    queryFn: async () => {
      const { data } = await supabase
        .from("doshas_registros")
        .select("id")
        .eq("idPublico", doshaResult!.idPublico)
        .maybeSingle();
      return (data?.id as string | undefined) ?? null;
    },
  });

  const { data: rotinaPreview } = useQuery({
    queryKey: ["logged-hero-rotina-preview", testeId],
    enabled: !!testeId,
    queryFn: async () => {
      const { data: rows } = await (supabase.from("rotinas_usuario") as any)
        .select("dia, slot, nugget_id")
        .eq("user_id", testeId!);
      const list = (rows ?? []) as { dia: number; slot: string; nugget_id: string | null }[];
      if (!list.length) return null;
      const menorDia = Math.min(...list.map((r) => r.dia));
      const doDia = list.filter((r) => r.dia === menorDia && !!r.nugget_id);
      if (!doDia.length) return null;
      const ids = Array.from(new Set(doDia.map((r) => r.nugget_id!).filter(Boolean)));
      const { data: nugs } = await supabase
        .from("rotina_nuggets")
        .select("id, titulo, icone_lucide, imagem_url, vata, pitta, kapha, periodo, nugget_json")
        .in("id", ids);
      const byId = new Map<string, any>();
      (nugs ?? []).forEach((n: any) => byId.set(n.id, n));

      const enriched = doDia
        .map((r) => ({ row: r, nug: byId.get(r.nugget_id!) }))
        .filter((x) => x.nug);

      const hora = new Date().getHours();
      const periodoAtual = hora < 12 ? "manha" : hora < 18 ? "tarde" : "noite";
      const norm = (s?: string | null) => (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const bucketFor = (p?: string | null): "manha" | "tarde" | "noite" | "outro" => {
        const n = norm(p);
        if (!n) return "outro";
        if (n.startsWith("manh") || n === "amanhecer" || n === "cafe") return "manha";
        if (n.startsWith("tarde") || n.includes("almoc") || n === "meio-dia" || n === "meio dia") return "tarde";
        if (n.startsWith("noit") || n === "jantar") return "noite";
        return "outro";
      };
      const buckets: Record<string, any[]> = { manha: [], tarde: [], noite: [], outro: [] };
      enriched.forEach((x) => buckets[bucketFor(x.nug.periodo)].push(x));

      const ordem =
        periodoAtual === "manha"
          ? (["manha", "tarde", "noite"] as const)
          : periodoAtual === "tarde"
          ? (["tarde", "noite", "manha"] as const)
          : (["noite", "manha", "tarde"] as const);
      const pick = (b: string) => buckets[b]?.[0] || null;
      const front = pick(ordem[0]) || pick("outro") || enriched[0] || null;
      const back = [pick(ordem[1]), pick(ordem[2])].filter((x) => x && x !== front);
      return { front, back };
    },
  });

  const rotinaPreviewTop = (rotinaPreview as any)?.front ?? null;
  const rotinaPreviewBack = (rotinaPreview as any)?.back ?? [];



  const rawFirst = doshaResult?.nome?.split(" ")[0] || profile?.nome?.split(" ")[0] || "";
  const firstName = rawFirst ? rawFirst.charAt(0).toUpperCase() + rawFirst.slice(1).toLowerCase() : "";

  const pontos = evolucao?.pontos ?? 0;
  const classe = evolucao?.classe ?? "Iniciante";
  const proximaClasse = evolucao?.proxima_classe;
  const pontosParaProxima = evolucao?.pontos_para_proxima ?? null;
  const streak = evolucao?.streak ?? 0;
  const streakRecorde = evolucao?.streak_recorde ?? 0;
  const retornoFeitoHoje = evolucao?.retorno_feito_hoje === true;
  
  const seloTerapeuta = evolucao?.selo_terapeuta === true;

  const progressoPct =
    pontosParaProxima !== null && pontosParaProxima !== undefined && pontosParaProxima > 0
      ? Math.max(0, Math.min(100, (pontos / (pontos + pontosParaProxima)) * 100))
      : 100;

  const receitaVideoId = (receita as any)?.video_id ?? null;
  const receitaSlugPath = receitaVideoId
    ? `/video/${encodeURIComponent(String(receitaVideoId))}?receita_do_dia=1`
    : "/biblioteca";

  const receitaTitulo = (receita as any)?.novo_titulo ?? (receita as any)?.titulo_original ?? "Receita do dia";
  const receitaResumo = (receita as any)?.mini_resumo ?? (receita as any)?.legenda ?? "";

  const pluralPts = (n: number | null | undefined) =>
    n === 1 ? "falta 1 pt" : `faltam ${n ?? 0} pts`;


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
            <div className="flex-1 flex">
              <BannerSlot
                slot="loggedhero"
                className="w-full flex"
                fallback={(() => {
                  const objetivos = total > 0 ? calcObjetivos(vata, pitta, kapha) : [];
                  const nug = (rotinaPreviewTop as any)?.nug;
                  const backNugs = rotinaPreviewBack.map((r: any) => r.nug).filter(Boolean);
                  const IconEl = nug?.icone_lucide
                    ? (LucideIcons as any)[nug.icone_lucide]
                    : null;
                  const ingredientes: { qtd?: string; item?: string }[] =
                    Array.isArray(nug?.nugget_json?.ingredientes) ? nug.nugget_json.ingredientes : [];
                  const ingredPreview = ingredientes
                    .slice(0, 3)
                    .map((i) => [i.qtd, i.item].filter(Boolean).join(" ").trim())
                    .filter(Boolean)
                    .join(" • ");
                  return (
                    <div className="relative bg-card rounded-2xl p-5 md:p-6 border border-border shadow-md w-full h-full flex flex-col gap-4">
                      {objetivos.length > 0 && <ObjetivosRow objetivos={objetivos} />}

                      {temAcessoRotina ? (
                        <>
                          {nug ? (
                            <div className="flex-1 min-w-0 pr-0 lg:pr-[170px]">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                Sua rotina agora
                              </p>
                              <Link
                                to={`/minha-rotina?item=${encodeURIComponent(nug.id)}`}
                                className="block hover:opacity-95 transition-opacity"
                              >
                                <p
                                  className="font-serif font-bold text-base leading-tight mt-0.5 line-clamp-2"
                                  style={{ color: C.primary }}
                                >
                                  {nug.titulo}
                                </p>
                              </Link>
                              {ingredPreview && (
                                <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1 leading-snug">
                                  {ingredPreview}
                                </p>
                              )}
                              <div className="flex flex-wrap gap-1 mt-1.5">
                                {(["Vata", "Pitta", "Kapha"] as const).map((d) => {
                                  const key = d.toLowerCase() as "vata" | "pitta" | "kapha";
                                  const s = Number(nug[key] ?? 0);
                                  if (!s) return null;
                                  return <ScoreMiniChip key={d} dosha={d} score={s} />;
                                })}
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              Os cuidados personalizados desenhados para o seu momento.
                            </p>
                          )}

                          {/* Selo — mockup no canto superior direito */}
                          {nug && (
                            <div className="absolute top-3 right-3 hidden lg:block">
                              <RecipeDeck front={nug} back={backNugs} IconEl={IconEl} />
                            </div>
                          )}

                          <div className="mt-auto flex justify-end">
                            <Link
                              to={nug ? `/minha-rotina?item=${encodeURIComponent(nug.id)}` : "/minha-rotina"}
                              className="inline-flex items-center gap-1.5 text-sm font-semibold"
                              style={{ color: C.primary }}
                            >
                              abrir minha rotina <ArrowRight className="h-4 w-4" />
                            </Link>
                          </div>
                        </>
                      ) : (
                        <>
                          {objetivos.length > 0 && (
                            <p className="text-sm text-muted-foreground -mt-1">
                              Sua rotina seria desenhada exatamente para isso.
                            </p>
                          )}
                          <div>
                            <h3
                              className="font-serif font-bold text-lg md:text-xl"
                              style={{ color: C.primary }}
                            >
                              Monte sua rotina personalizada
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              Alimentação, sono e cuidados diários baseados no seu dosha.
                            </p>
                          </div>
                          <Button asChild size="lg" variant="secondary" className="w-fit">
                            <Link to="/minha-rotina">Começar agora</Link>
                          </Button>
                        </>
                      )}
                    </div>
                  );
                })()}
              />
            </div>

            {/* SLOT B — receita do dia, card inteiro clicável */}
            <BannerSlot
              slot="loggedhero_b"
              fallback={
                <Link
                  to={receitaSlugPath}
                  className="group bg-card rounded-2xl p-4 md:p-5 border border-border shadow-sm flex gap-4 items-center transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
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
                  <span
                    className="shrink-0 inline-flex items-center gap-1 text-xs font-semibold"
                    style={{ color: C.primary }}
                  >
                    ver receita <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </Link>
              }
            />
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
                    ? `${pluralPts(pontosParaProxima)} para ${proximaClasse}`
                    : "classe máxima"}
                </p>
              </div>

              {/* Constância */}
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Flame className="h-4 w-4" style={{ color: C.pitta }} />
                  <span className="text-sm font-semibold" style={{ color: C.primary }}>
                    {streak > 0 ? `Constância: ${streak} ${streak === 1 ? "dia" : "dias"}` : "Sua constância começa hoje"}
                  </span>
                </div>
                {streakRecorde > 0 && (
                  <span className="text-[10px] text-muted-foreground">recorde {streakRecorde}</span>
                )}
              </div>

              {/* Seu cuidado de hoje */}
              <div className="mt-3 pt-3 border-t border-border">
                {retornoFeitoHoje ? (
                  <div
                    className="flex items-center gap-1.5 text-xs font-semibold"
                    style={{ color: "hsl(var(--kapha))" }}
                  >
                    <Check className="h-4 w-4" /> Você já se cuidou hoje
                  </div>
                ) : artigo?.link_do_artigo ? (
                  <Link
                    to={`/blog/${artigo.link_do_artigo}`}
                    className="flex items-start justify-between gap-2 text-xs font-semibold group"
                    style={{ color: C.primary }}
                  >
                    <span className="line-clamp-2">
                      <span className="text-muted-foreground font-normal">Seu cuidado de hoje: </span>
                      {artigo.title}
                    </span>
                    <ArrowRight className="h-4 w-4 shrink-0 mt-0.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                ) : (
                  <Link
                    to="/blog"
                    className="flex items-center justify-between gap-2 text-xs font-semibold group"
                    style={{ color: C.primary }}
                  >
                    <span>Seu cuidado de hoje</span>
                    <ArrowRight className="h-4 w-4 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* Bottom: 3 dados personalizados */}
      </div>
    </section>
  );
};

export default LoggedHero;
