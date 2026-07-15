import { Link } from "react-router-dom";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Play, Leaf, Sparkles, icons as LucideIcons, type LucideIcon } from "lucide-react";

type ItemBase = {
  titulo?: string | null;
  imagem?: string | null;
  rota?: string | null;
};

type ReceitaItem = ItemBase & {
  icone?: string | null;
  ingredientes?: { qtd?: string | null; item?: string | null }[] | null;
  resumo?: string | null;
};

type RotinaItem = ItemBase & {
  periodo?: string | null;
  icone_lucide?: string | null;
  resumo?: string | null;
};

type HojePayload = {
  video_novo?: ItemBase | null;
  receita_do_dia?: ReceitaItem | null;
  rotina_do_dia?: RotinaItem | null;
};

const SALMAO = "#FF7676";
const AZULEJO = "#FFF8EE";
const PAPEL = "#FDFBF5";
const NAVY = "#352F54";
const BORDER = "rgba(53,47,84,0.08)";
const HOVER_SHADOW = "hover:shadow-[0_10px_30px_-10px_rgba(255,118,118,0.45)]";
const LEAF_RADIUS = { borderRadius: "18px 4px 18px 4px" };

const toPascal = (s?: string | null) =>
  (s || "")
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((w) => w[0]?.toUpperCase() + w.slice(1).toLowerCase())
    .join("");

const getLucide = (name?: string | null): LucideIcon | null => {
  if (!name) return null;
  return ((LucideIcons as any)[toPascal(name)] as LucideIcon) || null;
};

const CardShell = ({ to, children }: { to: string; children: React.ReactNode }) => (
  <Link
    to={to}
    className={`shrink-0 w-[80%] sm:w-auto sm:flex-1 min-w-0 snap-start block transition-shadow ${HOVER_SHADOW} relative overflow-hidden h-full`}
    style={{ background: PAPEL, border: `1px solid ${BORDER}`, ...LEAF_RADIUS }}
  >
    <div className="h-full flex flex-col">{children}</div>
  </Link>
);

const Media = ({
  imagem,
  titulo,
  FallbackIcon,
  overlay,
}: {
  imagem?: string | null;
  titulo?: string | null;
  FallbackIcon: LucideIcon;
  overlay?: React.ReactNode;
}) => {
  const [ok, setOk] = useState<boolean>(!!imagem);
  const showImage = !!imagem && ok;
  return (
    <div
      className="relative w-full aspect-[16/9] overflow-hidden"
      style={{ background: AZULEJO }}
    >
      {showImage ? (
        <img
          src={imagem!}
          alt={titulo || ""}
          loading="lazy"
          className="w-full h-full object-cover"
          onError={() => setOk(false)}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <FallbackIcon className="h-14 w-14" style={{ color: SALMAO }} strokeWidth={1.6} />
        </div>
      )}
      {overlay}
    </div>
  );
};

const Selo = ({ label }: { label: string }) => (
  <div
    className="text-[10px] uppercase tracking-wider font-medium mb-1.5"
    style={{ color: SALMAO }}
  >
    {label}
  </div>
);

const Body = ({
  selo,
  titulo,
  preview,
}: {
  selo: string;
  titulo: string;
  preview?: string | null;
}) => (
  <div className="p-3 flex-1 flex flex-col">
    <Selo label={selo} />
    <h3
      className="font-serif font-bold leading-tight line-clamp-2"
      style={{ color: NAVY, fontSize: 15, minHeight: "2.6em" }}
    >
      {titulo}
    </h3>
    <p
      className="text-xs mt-1.5 line-clamp-1"
      style={{ color: "rgba(53,47,84,0.7)", minHeight: "1.1em" }}
    >
      {preview || "\u00A0"}
    </p>
  </div>
);

const VideoCard = ({ v }: { v: ItemBase }) => (
  <CardShell to={v.rota || "/biblioteca"}>
    <Media imagem={v.imagem} titulo={v.titulo} FallbackIcon={Play} />
    <Body selo="Vídeo novo" titulo={v.titulo ?? "Novo vídeo"} />
  </CardShell>
);

const ReceitaCard = ({ r }: { r: ReceitaItem }) => {
  const Icon = getLucide(r.icone) || Leaf;
  const ingredientes = Array.isArray(r.ingredientes) ? r.ingredientes : [];
  const preview =
    ingredientes.length > 0
      ? ingredientes
          .map((i) => [i.qtd, i.item].filter(Boolean).join(" ").trim())
          .filter(Boolean)
          .slice(0, 4)
          .join(" · ")
      : r.resumo || "";
  return (
    <CardShell to={r.rota || "/biblioteca"}>
      <Media imagem={r.imagem} titulo={r.titulo} FallbackIcon={Icon} />
      <Body selo="Receita do dia" titulo={r.titulo ?? "Receita do dia"} preview={preview} />
    </CardShell>
  );
};

const RotinaCard = ({ r }: { r: RotinaItem }) => {
  const Icon = getLucide(r.icone_lucide) || Sparkles;
  const overlay = r.periodo ? (
    <span
      className="absolute left-2 bottom-2 px-2 py-0.5 rounded-full text-[10px] font-medium"
      style={{ background: PAPEL, color: SALMAO, border: `1px solid ${BORDER}` }}
    >
      {r.periodo}
    </span>
  ) : null;
  return (
    <CardShell to={r.rota || "/minha-rotina"}>
      <Media imagem={r.imagem} titulo={r.titulo} FallbackIcon={Icon} overlay={overlay} />
      <Body selo="Rotina do dia" titulo={r.titulo ?? "Gesto do dia"} preview={r.resumo} />
    </CardShell>
  );
};

export const HojeNoPortal = () => {
  const { data } = useQuery({
    queryKey: ["hoje-no-portal"],
    queryFn: async () => {
      const { data } = await (supabase.rpc as any)("hoje_no_portal");
      const row = Array.isArray(data) ? data[0] : data;
      return (row ?? null) as HojePayload | null;
    },
    staleTime: 30 * 60 * 1000,
  });

  const video = data?.video_novo ?? null;
  const receita = data?.receita_do_dia ?? null;
  const rotina = data?.rotina_do_dia ?? null;

  if (!video && !receita && !rotina) return null;

  return (
    <section className="w-full max-w-6xl mx-auto px-4 py-6">
      <div className="mb-3 flex items-baseline justify-center">
        <h2 className="font-serif text-lg md:text-xl text-center" style={{ color: NAVY }}>
          Hoje no portal
        </h2>
      </div>
      <div className="flex sm:grid sm:grid-cols-3 gap-3 overflow-x-auto sm:overflow-visible snap-x snap-mandatory pb-2 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0 items-stretch">
        {video && <VideoCard v={video} />}
        {receita && <ReceitaCard r={receita} />}
        {rotina && <RotinaCard r={rotina} />}
      </div>
    </section>
  );
};

export default HojeNoPortal;
