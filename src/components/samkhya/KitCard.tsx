import { Link } from "react-router-dom";
import { useState } from "react";
import PrecoDisplay from "./PrecoDisplay";
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

const KitCard = ({ kit }: KitCardProps) => {
  const [hover, setHover] = useState(false);
  const tipoLabel = kit.tipo_kit ? TIPO_LABEL[kit.tipo_kit] ?? kit.tipo_kit : null;

  return (
    <Link
      to={`/samkhya/kits/${kit.slug}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="group flex flex-col rounded-lg overflow-hidden"
      style={{
        background: samkhyaTokens.cardBg,
        border: `1px solid ${samkhyaTokens.cardBorder}`,
        boxShadow: hover ? "0 4px 12px rgba(123,73,99,0.12)" : "0 1px 4px rgba(0,0,0,0.06)",
        transform: hover ? "translateY(-2px)" : "translateY(0)",
        transition: "transform 0.2s, box-shadow 0.2s",
      }}
    >
      <div className="relative aspect-square bg-white p-6 flex items-center justify-center overflow-hidden">
        {kit.imagem_url ? (
          <img
            src={kit.imagem_url}
            alt={kit.nome}
            loading="lazy"
            className="max-h-full max-w-full object-contain transition-transform group-hover:scale-105"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-sm"
            style={{ background: samkhyaTokens.roxoLight, color: samkhyaTokens.roxo }}
          >
            {kit.nome}
          </div>
        )}
        {tipoLabel && (
          <span
            className="absolute top-3 left-3 rounded px-2 py-1 text-xs font-semibold text-white"
            style={{ background: samkhyaTokens.roxo }}
          >
            {tipoLabel}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2 p-4 text-center">
        <h3
          className="text-lg leading-snug"
          style={{ color: samkhyaTokens.texto, fontFamily: "Georgia, 'Times New Roman', serif" }}
        >
          {kit.nome}
        </h3>
        {kit.descricao_curta && (
          <p className="text-sm" style={{ color: samkhyaTokens.textoSec }}>
            {kit.descricao_curta}
          </p>
        )}
        <div className="flex items-center justify-center">
          <PrecoDisplay precoNormal={Number(kit.preco_normal)} precoPix={Number(kit.preco_pix)} />
        </div>
        <span
          className="mt-2 inline-flex items-center justify-center rounded-md px-5 py-2.5 text-sm font-medium text-white w-full transition-colors"
          style={{
            background: hover ? samkhyaTokens.ouroDark : samkhyaTokens.ouro,
          }}
        >
          Ver kit
        </span>
      </div>
    </Link>
  );
};

export default KitCard;
