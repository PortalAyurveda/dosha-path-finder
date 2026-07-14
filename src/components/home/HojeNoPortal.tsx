import { Link } from "react-router-dom";
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
}) => (
  <Link to={to} className="shrink-0 w-[80%] sm:w-auto sm:flex-1 min-w-0">
    <Card className="h-full overflow-hidden rounded-xl hover:shadow-md transition-shadow">
      {imagem ? (
        <div className="w-full aspect-[16/9] bg-muted overflow-hidden">
          <img src={imagem} alt={titulo} loading="lazy" className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="w-full aspect-[16/9] bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center text-muted-foreground">
          {icon}
        </div>
      )}
      <div className="p-3 space-y-1.5">
        <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
          {icon}
          <span>{selo}</span>
        </div>
        <h3 className="font-serif text-sm text-foreground leading-tight line-clamp-2">{titulo}</h3>
        {texto && <p className="text-xs text-muted-foreground line-clamp-2">{texto}</p>}
      </div>
    </Card>
  </Link>
);

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
            icon={<Play className="h-3 w-3" />}
            titulo={video.titulo ?? "Novo vídeo"}
            imagem={video.imagem}
          />
        )}
        {receita && (
          <MiniCard
            to={rotaReceita(receita)}
            selo="Receita do dia"
            icon={<UtensilsCrossed className="h-3 w-3" />}
            titulo={receita.titulo ?? "Receita do dia"}
            imagem={receita.imagem}
          />
        )}
        {dica && (
          <MiniCard
            to={rotaDica(dica)}
            selo="Gesto do dia"
            icon={<Sparkles className="h-3 w-3" />}
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
