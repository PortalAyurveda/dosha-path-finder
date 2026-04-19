import { Link } from "react-router-dom";
import PrecoDisplay from "./PrecoDisplay";
import { samkhyaTokens } from "./tokens";
import type { LojaKit } from "@/integrations/supabase/loja-client";

interface KitCardProps {
  kit: LojaKit;
}

const TIPO_LABEL: Record<string, string> = {
  anti_dosha: "Kit Completo",
  mini_kit: "Mini Kit",
  especial: "Especial",
  viagem: "Para Viagem",
};

const KitCard = ({ kit }: KitCardProps) => {
  const tipoLabel = kit.tipo_kit ? TIPO_LABEL[kit.tipo_kit] ?? kit.tipo_kit : null;

  return (
    <Link
      to={`/samkhya/kits/${kit.slug}`}
      className="group flex flex-col rounded-lg overflow-hidden transition-all hover:-translate-y-0.5"
      style={{
        background: samkhyaTokens.cardBg,
        border: `1px solid ${samkhyaTokens.cardBorder}`,
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
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
            className="absolute top-3 left-3 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase text-white"
            style={{ background: samkhyaTokens.roxo }}
          >
            {tipoLabel}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-3 p-5">
        <h3
          className="text-lg leading-tight"
          style={{ color: samkhyaTokens.roxo, fontFamily: "Georgia, 'Times New Roman', serif" }}
        >
          {kit.nome}
        </h3>
        {kit.descricao_curta && (
          <p className="text-sm" style={{ color: samkhyaTokens.textoSec }}>
            {kit.descricao_curta}
          </p>
        )}
        <PrecoDisplay precoNormal={Number(kit.preco_normal)} precoPix={Number(kit.preco_pix)} />
        <span
          className="mt-2 inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold text-white"
          style={{ background: samkhyaTokens.ouro }}
        >
          Ver kit
        </span>
      </div>
    </Link>
  );
};

export default KitCard;
