import { Link } from "react-router-dom";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Play, UtensilsCrossed, Sparkles } from "lucide-react";

type ItemBase = {
  id?: string | null;
  slug?: string | null;
  titulo?: string | null;
  imagem?: string | null;
};

type HojePayload = {
  video_novo?: (ItemBase & { url?: string | null }) | null;
  receita_do_dia?: ItemBase | null;
  dica_do_dia?: (ItemBase & { texto?: string | null }) | null;
};

const rotaVideo = (v: any) => v?.url || (v?.slug ? `/video/${v.slug}` : v?.id ? `/video/${v.id}` : "/biblioteca");
const rotaReceita = (r: any) => (r?.slug ? `/receita/${r.slug}` : r?.id ? `/receita/${r.id}` : "/biblioteca");
const rotaDica = (d: any) => (d?.slug ? `/dica/${d.slug}` : d?.id ? `/dica/${d.id}` : "/biblioteca");

const SALMAO = "#FF7676";
const SALMAO_SOFT = "#FF76761F";
const HOVER_SHADOW = "hover:shadow-[0_10px_30px_-10px_rgba(255,118,118,0.45)]";

const MiniCard = ({
  to,
  selo,
  icon,
  titulo,
  imagem,
  texto,
}: {
  to: string;
  selo: string;
  icon: React.ReactNode;
  titulo: string;
  imagem?: string | null;
  texto?: string | null;
}) => {
  const [imgOk, setImgOk] = useState<boolean>(!!imagem);
  const showImage = !!imagem && imgOk;

  return (
    <Link to={to} className="shrink-0 w-[80%] sm:w-auto sm:flex-1 min-w-0">
      <Card
        className={`h-full overflow-hidden rounded-xl transition-shadow ${HOVER_SHADOW}`}
      >
        {showImage ? (
          <>
            <div className="w-full aspect-[16/9] bg-muted overflow-hidden">
              <img
                src={imagem!}
                alt={titulo}
                loading="lazy"
                className="w-full h-full object-cover"
                onError={() => setImgOk(false)}
              />
            </div>
            <div className="p-3 space-y-1.5">
              <div
                className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-medium"
                style={{ color: SALMAO }}
              >
                {icon}
                <span>{selo}</span>
              </div>
              <h3 className="font-serif text-sm text-foreground leading-tight line-clamp-2">{titulo}</h3>
              {texto && <p className="text-xs text-muted-foreground line-clamp-2">{texto}</p>}
            </div>
          </>
        ) : (
          <div className="p-3 flex items-center gap-3">
            <div
              className="shrink-0 w-11 h-11 rounded-full flex items-center justify-center"
              style={{ background: SALMAO_SOFT, color: SALMAO }}
            >
              {icon}
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <div
                className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-medium"
                style={{ color: SALMAO }}
              >
                <span>{selo}</span>
              </div>
              <h3 className="font-serif text-sm text-foreground leading-tight line-clamp-2">{titulo}</h3>
              {texto && <p className="text-xs text-muted-foreground line-clamp-2">{texto}</p>}
            </div>
          </div>
        )}
      </Card>
    </Link>
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
  const dica = data?.dica_do_dia ?? null;

  if (!video && !receita && !dica) return null;

  return (
    <section className="w-full max-w-6xl mx-auto px-4 py-6">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="font-serif text-lg md:text-xl text-foreground">Hoje no portal</h2>
      </div>
      <div className="flex sm:grid sm:grid-cols-3 gap-3 overflow-x-auto sm:overflow-visible snap-x snap-mandatory pb-2 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0">
        {video && (
          <MiniCard
            to={rotaVideo(video)}
            selo="Vídeo novo"
            icon={<Play className="h-4 w-4" />}
            titulo={video.titulo ?? "Novo vídeo"}
            imagem={video.imagem}
          />
        )}
        {receita && (
          <MiniCard
            to={rotaReceita(receita)}
            selo="Receita do dia"
            icon={<UtensilsCrossed className="h-4 w-4" />}
            titulo={receita.titulo ?? "Receita do dia"}
            imagem={receita.imagem}
          />
        )}
        {dica && (
          <MiniCard
            to={rotaDica(dica)}
            selo="Gesto do dia"
            icon={<Sparkles className="h-4 w-4" />}
            titulo={dica.titulo ?? "Gesto do dia"}
            imagem={dica.imagem}
            texto={dica.texto}
          />
        )}
      </div>
    </section>
  );
};

export default HojeNoPortal;
