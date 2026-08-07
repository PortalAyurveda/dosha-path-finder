import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Flame, Lock, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/contexts/UserContext";
import DoshaPieChart from "@/components/charts/DoshaPieChart";
import { ClinicalThermometer } from "@/pages/MeuDosha";
import { getTransformedImageUrl } from "@/lib/imageTransform";
import { buildSymptomList, matchArtigos, type ArtigoBase } from "@/lib/matchArtigos";

const PRIMARY = "#352F54";
const PAPER = "#FDFBF5";

interface Props {
  /** Mockup estático mostrado para quem ainda não fez o teste */
  fallback: React.ReactNode;
}

const PreviaPersonalizada = ({ fallback }: Props) => {
  const { doshaResult } = useUser();
  const [searchParams] = useSearchParams();
  const [storedId, setStoredId] = useState<string | null>(null);

  useEffect(() => {
    setStoredId(localStorage.getItem("activeDoshaId"));
  }, []);

  const idPublico =
    searchParams.get("id") || doshaResult?.idPublico || storedId || null;

  const { data: registro } = useQuery({
    queryKey: ["assinar-previa-registro", idPublico],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("resultado_teste" as any, {
        p_idpublico: idPublico!,
      });
      if (error || !data) return null;
      const row = Array.isArray(data) ? data[0] : data;
      return (row as any) ?? null;
    },
    enabled: !!idPublico,
    staleTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const sintomas = useMemo(
    () =>
      registro
        ? buildSymptomList(
            registro.agravVataTags,
            registro.agravPittaTags,
            registro.agravKaphaTags
          )
        : [],
    [registro]
  );

  // Performance: só artigos (portal_conteudo) nesta landing.
  const { data: artigos = [] } = useQuery({
    queryKey: ["assinar-previa-artigos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("portal_conteudo")
        .select("id, title, summary, link_do_artigo, meta_description, tags, image_url")
        .order("created_at", { ascending: false })
        .limit(400);
      if (error) throw error;
      return (data || []) as ArtigoBase[];
    },
    enabled: sintomas.length > 0,
    staleTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const selecionados = useMemo(
    () => matchArtigos(artigos, sintomas, 3),
    [artigos, sintomas]
  );

  if (!registro) return <>{fallback}</>;

  const vata = Number(registro.vatascore ?? 0);
  const pitta = Number(registro.pittascore ?? 0);
  const kapha = Number(registro.kaphascore ?? 0);
  const scores = [
    { name: "Vata", score: vata },
    { name: "Pitta", score: pitta },
    { name: "Kapha", score: kapha },
  ];

  const aberto = selecionados[0];
  const borrados = selecionados.slice(1, 3);

  const CardArtigo = ({
    item,
    comContexto,
  }: {
    item: (typeof selecionados)[number];
    comContexto: boolean;
  }) => {
    const a = item.artigo;
    const href = `/blog/${a.link_do_artigo || a.id}`;
    const doshaColor =
      item.matchedDosha === "Vata"
        ? "#6B8AFF"
        : item.matchedDosha === "Pitta"
        ? "#C93F3F"
        : "#4B9E4B";
    return (
      <div
        className="rounded-xl border bg-card overflow-hidden"
        style={{ borderColor: "rgba(53,47,84,0.14)" }}
      >
        {comContexto && (
          <div className="px-3 py-2 border-b flex items-start gap-2" style={{ borderColor: "rgba(53,47,84,0.10)", background: "hsl(var(--akasha) / 0.10)" }}>
            <Sparkles className="h-3.5 w-3.5 shrink-0 mt-0.5" style={{ color: "hsl(var(--akasha))" }} />
            <p className="text-[11px] leading-snug" style={{ color: PRIMARY, fontFamily: "'DM Sans', sans-serif" }}>
              Como você relatou{" "}
              <strong style={{ color: doshaColor }}>{item.matchedSymptom}</strong> e possui
              agravamento em <strong style={{ color: doshaColor }}>{item.matchedDosha}</strong>,
              selecionamos este vídeo:
            </p>
          </div>
        )}
        <Link to={href} className="flex gap-3 p-3 min-w-0">
          {a.image_url && (
            <img
              src={getTransformedImageUrl(a.image_url)}
              alt={a.title}
              loading="lazy"
              className="w-24 h-20 sm:w-32 sm:h-24 object-cover rounded-lg shrink-0"
            />
          )}
          <span className="min-w-0 flex-1">
            <span className="block font-serif font-bold text-[13px] sm:text-sm leading-snug line-clamp-2" style={{ color: PRIMARY }}>
              {a.title}
            </span>
            <span
              className="block text-[11px] sm:text-xs leading-snug line-clamp-3 mt-1"
              style={{ color: PRIMARY, opacity: 0.72, fontFamily: "'DM Sans', sans-serif" }}
            >
              {a.meta_description || a.summary || ""}
            </span>
          </span>
        </Link>
      </div>
    );
  };

  return (
    <>
      {/* Retrato real */}
      <div
        className="relative rounded-2xl border bg-card shadow-sm overflow-hidden max-w-[680px] mx-auto"
        style={{ borderColor: "rgba(53,47,84,0.14)" }}
      >
        <div className="px-3 md:px-4 py-2 border-b" style={{ borderColor: "rgba(53,47,84,0.10)", background: PAPER }}>
          <p
            className="text-[9px] uppercase tracking-wider font-bold mb-0.5"
            style={{ color: PRIMARY, opacity: 0.55, fontFamily: "'DM Sans', sans-serif" }}
          >
            {registro.nome ? `Retrato de ${registro.nome}` : "Seu perfil clínico"}
          </p>
          <h3 className="font-serif font-bold text-sm md:text-[15px]" style={{ color: PRIMARY }}>
            Seu dosha agravado:{" "}
            <span style={{ color: PRIMARY }}>{registro.doshaprincipal ?? "—"}</span>
          </h3>
        </div>

        <div
          className="grid grid-cols-1 md:grid-cols-[180px_1fr] divide-y md:divide-y-0 md:divide-x"
          style={{ borderColor: "rgba(53,47,84,0.10)" }}
        >
          <div className="p-3 flex flex-col items-center">
            <div className="w-[108px] h-[108px]">
              <DoshaPieChart vata={vata} pitta={pitta} kapha={kapha} variant="compact" />
            </div>
            <div
              className="mt-1.5 flex items-center gap-1.5 text-[10px] font-semibold"
              style={{ color: PRIMARY, fontFamily: "'DM Sans', sans-serif" }}
            >
              <span style={{ color: "#6B8AFF" }}>V {vata}</span>
              <span style={{ opacity: 0.35 }}>·</span>
              <span style={{ color: "#FF7676" }}>P {pitta}</span>
              <span style={{ opacity: 0.35 }}>·</span>
              <span style={{ color: "#4B9E4B" }}>K {kapha}</span>
            </div>
            {registro.agniPrincipal && (
              <div
                className="mt-2 w-full rounded-md border p-2 flex items-start gap-1.5"
                style={{ background: "hsl(var(--surface-sun))", borderColor: "rgba(53,47,84,0.10)" }}
              >
                <Flame className="w-3 h-3 shrink-0 mt-0.5" style={{ color: "#C87E3B" }} />
                <p className="text-[10px] leading-snug" style={{ color: PRIMARY, fontFamily: "'DM Sans', sans-serif" }}>
                  <strong className="font-bold">Agni:</strong> {String(registro.agniPrincipal)}
                </p>
              </div>
            )}
          </div>

          <div className="p-3">
            <p
              className="text-[9px] uppercase tracking-wider font-bold mb-1.5"
              style={{ color: PRIMARY, opacity: 0.55, fontFamily: "'DM Sans', sans-serif" }}
            >
              Quadro clínico
            </p>
            <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
              <ClinicalThermometer doshaScores={scores} variant="compact" />
            </div>
          </div>
        </div>
      </div>

      {/* Escolhido para o seu corpo */}
      {aberto && (
        <div className="max-w-[680px] mx-auto mt-6">
          <h3 className="font-serif italic font-bold text-lg md:text-xl text-center mb-3" style={{ color: PRIMARY }}>
            Escolhido para o seu corpo
          </h3>

          <div className="space-y-3">
            <CardArtigo item={aberto} comContexto />

            {borrados.length > 0 && (
              <div className="relative">
                <div aria-hidden className="pointer-events-none select-none blur-sm opacity-60 space-y-3">
                  {borrados.map((item) => (
                    <CardArtigo key={item.artigo.id} item={item} comContexto />
                  ))}
                </div>
                <div className="absolute inset-0 flex items-center justify-center p-4">
                  <div className="bg-card/95 backdrop-blur-md border border-border rounded-2xl shadow-lg p-5 max-w-sm w-full text-center space-y-3">
                    <div className="mx-auto w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "rgba(53,47,84,0.08)" }}>
                      <Lock className="h-5 w-5" style={{ color: PRIMARY }} />
                    </div>
                    <p className="text-sm font-medium" style={{ color: PRIMARY, fontFamily: "'DM Sans', sans-serif" }}>
                      Mais {borrados.length} selecionados para o seu quadro
                    </p>
                    <button
                      type="button"
                      onClick={() => document.getElementById("planos")?.scrollIntoView({ behavior: "smooth" })}
                      className="w-full py-2.5 rounded-full font-semibold text-sm text-white"
                      style={{ backgroundColor: "#E8806A" }}
                    >
                      Desbloquear no plano
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default PreviaPersonalizada;
