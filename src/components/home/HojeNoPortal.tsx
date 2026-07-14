import { Link } from "react-router-dom";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Play, Leaf, Sparkles, icons as LucideIcons, type LucideIcon } from "lucide-react";

type ItemBase = {
  id?: string | null;
  slug?: string | null;
  titulo?: string | null;
  imagem?: string | null;
  rota?: string | null;
};

type ReceitaItem = ItemBase & {
  icone?: string | null;
  resumo?: string | null;
  ingredientes?: { qtd?: string | null; item?: string | null }[] | null;
  bom_para?: string | null;
};

type RotinaItem = ItemBase & {
  periodo?: string | null;
  icone_lucide?: string | null;
  resumo?: string | null;
  efeito?: string | null;
};

type HojePayload = {
  video_novo?: ItemBase | null;
  receita_do_dia?: ReceitaItem | null;
  rotina_do_dia?: RotinaItem | null;
};

const SALMAO = "#FF7676";
const SALMAO_SOFT = "#FF76761F";
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
  const pascal = toPascal(name);
  return ((LucideIcons as any)[pascal] as LucideIcon) || null;
};

const CardShell = ({
  to,
  children,
}: {
  to: string;
  children: React.ReactNode;
}) => (
  <Link
    to={to}
    className={`shrink-0 w-[80%] sm:w-auto sm:flex-1 min-w-0 snap-start block transition-shadow ${HOVER_SHADOW} relative overflow-hidden`}
    style={{
      background: PAPEL,
      border: `1px solid ${BORDER}`,
      ...LEAF_RADIUS,
    }}
  >
    <div className="h-full flex flex-col min-h-[220px] sm:min-h-[260px]">{children}</div>
  </Link>
);

const Selo = ({ icon, label }: { icon: React.ReactNode; label: string }) => (
  <div
    className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-medium"
    style={{ color: SALMAO }}
  >
    {icon}
    <span>{label}</span>
  </div>
);

const VideoCard = ({ v }: { v: ItemBase }) => {
  const [ok, setOk] = useState<boolean>(!!v.imagem);
  const showImage = !!v.imagem && ok;
  return (
    <CardShell to={v.rota || "/biblioteca"}>
      {showImage ? (
        <div className="w-full aspect-[16/9] overflow-hidden" style={{ background: "rgba(53,47,84,0.06)" }}>
          <img
            src={v.imagem!}
            alt={v.titulo || ""}
            loading="lazy"
            className="w-full h-full object-cover"
            onError={() => setOk(false)}
          />
        </div>
      ) : (
        <div className="p-3 flex items-center gap-2">
          <div
            className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: SALMAO_SOFT, color: SALMAO }}
          >
            <Play className="h-4 w-4" />
          </div>
          <Selo icon={<Play className="h-3 w-3" />} label="Vídeo novo" />
        </div>
      )}
      <div className="p-3 flex-1 flex flex-col gap-1.5">
        {showImage && <Selo icon={<Play className="h-3 w-3" />} label="Vídeo novo" />}
        <h3
          className="font-serif font-bold leading-tight line-clamp-3"
          style={{ color: NAVY, fontSize: 15 }}
        >
          {v.titulo ?? "Novo vídeo"}
        </h3>
      </div>
    </CardShell>
  );
};

const ReceitaCard = ({ r }: { r: ReceitaItem }) => {
  const [ok, setOk] = useState<boolean>(!!r.imagem);
  const showImage = !!r.imagem && ok;
  const Icon = getLucide(r.icone) || Leaf;
  const ingredientes = Array.isArray(r.ingredientes) ? r.ingredientes.slice(0, 3) : [];

  return (
    <CardShell to={r.rota || "/biblioteca"}>
      {showImage && (
        <div className="w-full aspect-[16/9] overflow-hidden" style={{ background: "rgba(53,47,84,0.06)" }}>
          <img
            src={r.imagem!}
            alt={r.titulo || ""}
            loading="lazy"
            className="w-full h-full object-cover"
            onError={() => setOk(false)}
          />
        </div>
      )}
      <div className="p-3 flex-1 flex flex-col relative">
        <div className="flex items-center gap-1.5 mb-1.5">
          <Icon className="h-3.5 w-3.5" style={{ color: SALMAO }} />
          <Selo icon={null} label="Receita do dia" />
          <div className="h-px flex-1 ml-1" style={{ background: "rgba(53,47,84,0.15)" }} />
        </div>
        <h3
          className="font-serif font-bold leading-tight line-clamp-2 mb-1.5"
          style={{ color: NAVY, fontSize: 15 }}
        >
          {r.titulo ?? "Receita do dia"}
        </h3>
        <ul
          className="space-y-0.5 flex-1"
          style={{ color: "rgba(53,47,84,0.75)", fontSize: 11, lineHeight: 1.4 }}
        >
          {ingredientes.length > 0 ? (
            ingredientes.map((i, idx) => (
              <li key={idx} className="line-clamp-1">
                • {i.qtd ? `${i.qtd} ` : ""}
                {i.item || ""}
              </li>
            ))
          ) : r.resumo ? (
            <li className="line-clamp-3">{r.resumo}</li>
          ) : null}
        </ul>
        <div
          className="absolute left-0 right-0 bottom-0 h-10 pointer-events-none"
          style={{
            background: `linear-gradient(to bottom, rgba(253,251,245,0) 0%, ${PAPEL} 90%)`,
          }}
        />
      </div>
    </CardShell>
  );
};

const RotinaCard = ({ r }: { r: RotinaItem }) => {
  const Icon = getLucide(r.icone_lucide) || Sparkles;
  return (
    <CardShell to={r.rota || "/minha-rotina"}>
      <div className="p-3 flex-1 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div
            className="shrink-0 w-11 h-11 rounded-full flex items-center justify-center"
            style={{ background: SALMAO_SOFT, color: SALMAO }}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <Selo icon={null} label="Rotina do dia" />
            {r.periodo && (
              <span
                className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
                style={{ background: SALMAO_SOFT, color: SALMAO }}
              >
                {r.periodo}
              </span>
            )}
          </div>
        </div>
        <h3
          className="font-serif font-bold leading-tight line-clamp-2"
          style={{ color: NAVY, fontSize: 15 }}
        >
          {r.titulo ?? "Gesto do dia"}
        </h3>
        {r.resumo && (
          <p className="text-xs line-clamp-2" style={{ color: "rgba(53,47,84,0.75)" }}>
            {r.resumo}
          </p>
        )}
      </div>
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
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="font-serif text-lg md:text-xl" style={{ color: NAVY }}>
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
