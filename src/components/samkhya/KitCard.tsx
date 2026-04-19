import { Link } from "react-router-dom";
import { samkhyaTokens } from "./tokens";
import type { LojaKit } from "@/integrations/supabase/loja-client";

interface KitCardProps {
  kit: LojaKit;
}

const TIPO_LABEL: Record<string, string> = {
  anti_dosha: "Anti-Dosha",
  mini_kit: "Mini Kit",
  especial: "Especial",
  viagem: "Viagem",
  gold: "Gold",
};

const formatBRL = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const KitCard = ({ kit }: KitCardProps) => {
  const tipoLabel = kit.tipo_kit ? TIPO_LABEL[kit.tipo_kit] ?? kit.tipo_kit : null;

  return (
    <Link
      to={`/samkhya/kits/${kit.slug}`}
      className="group flex flex-col items-center text-center transition-transform duration-200 hover:scale-[1.02]"
    >
      <div
        className="relative aspect-square w-full flex items-center justify-center p-4 rounded-sm overflow-hidden"
        style={{ background: "#FFFFFF" }}
      >
        {kit.imagem_url ? (
          <img
            src={kit.imagem_url}
            alt={kit.nome}
            loading="lazy"
            className="max-h-full max-w-full object-contain"
          />
        ) : (
          <span className="text-xs" style={{ color: samkhyaTokens.textoSec }}>
            Sem imagem
          </span>
        )}
        {tipoLabel && (
          <span
            className="absolute top-2 left-2 rounded px-2 py-0.5 text-[0.65rem] font-semibold text-white"
            style={{ background: samkhyaTokens.roxo }}
          >
            {tipoLabel}
          </span>
        )}
      </div>
      <h3
        className="mt-3 text-base italic"
        style={{
          color: samkhyaTokens.texto,
          fontFamily: "Georgia, 'Times New Roman', serif",
        }}
      >
        {kit.nome}
      </h3>
      {kit.descricao_curta && (
        <p
          className="mt-1 px-2 line-clamp-2"
          style={{
            color: samkhyaTokens.textoSec,
            fontSize: "0.8rem",
            lineHeight: 1.35,
          }}
        >
          {kit.descricao_curta}
        </p>
      )}
      <p
        className="mt-1 text-sm font-medium"
        style={{ color: samkhyaTokens.ouro }}
      >
        {formatBRL(Number(kit.preco_pix))}
      </p>
    </Link>
  );
};

export default KitCard;
