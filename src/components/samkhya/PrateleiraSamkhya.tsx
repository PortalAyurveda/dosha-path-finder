import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { samkhyaTokens } from "./tokens";
import samkhyaLogo from "@/assets/samkhya-logo-cropped.png";

interface PrateleiraItem {
  slug: string;
  nome: string;
  resumo: string | null;
  preco: number | null;
  imagem: string | null;
  rota: string;
}

interface PrateleiraSamkhyaProps {
  doshaPrincipal?: string | null;
  titulo?: string;
}

const serif = "Georgia, 'Times New Roman', serif";

const formatPreco = (v: number | null) => {
  if (v == null) return "";
  return `R$ ${Number(v).toLocaleString("pt-BR", {
    minimumFractionDigits: v % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
};

const PrateleiraSamkhya = ({ doshaPrincipal, titulo }: PrateleiraSamkhyaProps) => {
  const primaryDosha = doshaPrincipal?.split("-")[0]?.trim() || null;

  const { data: itens } = useQuery({
    queryKey: ["prateleira-samkhya", primaryDosha],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("prateleira_samkhya", {
        p_dosha: primaryDosha,
      });
      if (error) throw error;
      return (data ?? []) as PrateleiraItem[];
    },
    staleTime: 5 * 60 * 1000,
  });

  if (!itens || itens.length === 0) return null;

  const tituloFinal =
    titulo ??
    (primaryDosha
      ? `✦ O ritual do seu ${primaryDosha} ✦`
      : "✦ As fórmulas da Samkhya ✦");

  return (
    <section
      className="w-full"
      style={{
        backgroundColor: samkhyaTokens.fundo,
        borderTop: `1px solid ${samkhyaTokens.cardBorder}`,
        borderBottom: `1px solid ${samkhyaTokens.cardBorder}`,
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 md:py-14">
        {/* Cabeçalho */}
        <div className="grid grid-cols-3 items-center gap-3 mb-6 md:mb-8">
          <div className="flex justify-start">
            <img
              src={samkhyaLogo}
              alt="Samkhya"
              style={{ height: 30 }}
              className="w-auto"
            />
          </div>
          <div className="text-center">
            <h2
              className="text-xl md:text-2xl italic font-light tracking-wide"
              style={{ color: samkhyaTokens.roxo, fontFamily: serif }}
            >
              {tituloFinal}
            </h2>
            <p
              className="mt-1 text-xs md:text-sm"
              style={{ color: samkhyaTokens.textoSec }}
            >
              feitas à mão, a partir dos textos clássicos do Ayurveda
            </p>
          </div>
          <div className="flex justify-end">
            <Link
              to="/samkhya"
              className="text-sm font-medium hover:opacity-80 transition-opacity whitespace-nowrap"
              style={{ color: samkhyaTokens.roxo }}
            >
              ver a loja →
            </Link>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 md:overflow-visible overflow-x-auto md:snap-none snap-x snap-mandatory -mx-4 px-4 md:mx-0 md:px-0 md:flex-none flex md:grid">
          {itens.slice(0, 4).map((item) => (
            <Link
              key={item.slug}
              to={item.rota}
              className="group block flex-shrink-0 w-[70%] sm:w-[45%] md:w-auto snap-start rounded-lg overflow-hidden transition-all hover:shadow-md"
              style={{
                backgroundColor: samkhyaTokens.cardBg,
                border: `1px solid ${samkhyaTokens.cardBorder}`,
              }}
            >
              <div
                className="w-full aspect-square overflow-hidden"
                style={{ backgroundColor: samkhyaTokens.fundo }}
              >
                {item.imagem ? (
                  <img
                    src={item.imagem}
                    alt={item.nome}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : null}
              </div>
              <div className="p-3 md:p-4">
                <h3
                  className="text-base md:text-lg leading-tight mb-1"
                  style={{ color: samkhyaTokens.texto, fontFamily: serif }}
                >
                  {item.nome}
                </h3>
                {item.resumo && (
                  <p
                    className="text-xs md:text-sm line-clamp-1 mb-2"
                    style={{ color: samkhyaTokens.textoSec }}
                  >
                    {item.resumo}
                  </p>
                )}
                {item.preco != null && (
                  <div
                    className="text-base md:text-lg font-semibold"
                    style={{ color: samkhyaTokens.ouroText }}
                  >
                    {formatPreco(item.preco)}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PrateleiraSamkhya;
