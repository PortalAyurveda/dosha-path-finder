import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MessageCircleHeart, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface PesquisaMinha {
  elegivel?: boolean;
  ja_respondeu?: boolean;
  em_andamento?: boolean;
  slug?: string;
  tempo_estimado_min?: number | null;
}

const ConvitePesquisa = () => {
  const [dados, setDados] = useState<PesquisaMinha | null>(null);

  useEffect(() => {
    let vivo = true;
    (async () => {
      const { data, error } = await supabase.rpc("pesquisa_minha");
      if (!vivo || error) return;
      setDados(data as unknown as PesquisaMinha);
    })();
    return () => {
      vivo = false;
    };
  }, []);

  if (!dados?.elegivel || !dados.slug) return null;

  const minutos = dados.tempo_estimado_min || 3;

  return (
    <Link
      to={`/opiniao/${dados.slug}?origem=banner`}
      className="group relative block overflow-hidden rounded-2xl p-5 md:p-6 transition-all hover:-translate-y-0.5 hover:shadow-lg"
      style={{
        background: "linear-gradient(135deg, #FFF8E7 0%, #FFFDF8 70%)",
        border: "1px solid #E8D9A0",
      }}
    >
      <span
        className="absolute inset-x-0 top-0 h-[3px]"
        style={{ background: "linear-gradient(90deg, #FACC15, #C9A227)" }}
      />
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl"
          style={{ background: "#FACC1526" }}
        >
          <MessageCircleHeart size={26} stroke="#B8860B" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase" style={{ color: "#B8860B", letterSpacing: "1.5px" }}>
            Pesquisa, opinião e satisfação
          </p>
          <h3 className="mt-1 font-serif text-lg md:text-xl" style={{ color: "#352F54" }}>
            Queria ouvir você
          </h3>
          <p className="mt-1 text-sm" style={{ color: "#5a5675" }}>
            Sua opinião decide o que eu construo em seguida. Leva {minutos} minutos.
          </p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold" style={{ color: "#B8860B" }}>
          {dados.em_andamento ? "Continuar de onde parei" : "Responder"}
          <ArrowRight size={16} />
        </span>
      </div>
    </Link>
  );
};

export default ConvitePesquisa;
