import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { samkhyaTokens } from "./tokens";
import { cn } from "@/lib/utils";

interface ProdutoCarrosselProps {
  imagens: string[];
  alt: string;
}

/**
 * Carrossel interativo para a página de produto:
 * - Imagem principal grande
 * - Setas de navegação esq/dir (visíveis se houver mais de 1 imagem)
 * - Galeria de miniaturas clicáveis abaixo
 * - Suporte a teclado (← →)
 */
export default function ProdutoCarrossel({ imagens, alt }: ProdutoCarrosselProps) {
  const [index, setIndex] = useState(0);
  const total = imagens.length;
  const hasMultiple = total > 1;

  const goPrev = () => setIndex((i) => (i - 1 + total) % total);
  const goNext = () => setIndex((i) => (i + 1) % total);

  useEffect(() => {
    if (!hasMultiple) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMultiple, total]);

  if (total === 0) {
    return (
      <div
        className="aspect-square rounded-lg flex items-center justify-center"
        style={{
          background: samkhyaTokens.cardBg,
          border: `1px solid ${samkhyaTokens.cardBorder}`,
        }}
      >
        <span style={{ color: samkhyaTokens.textoSec }}>Sem imagem</span>
      </div>
    );
  }

  const atual = imagens[index];

  return (
    <div className="space-y-3">
      {/* Imagem principal */}
      <div
        className="relative aspect-square rounded-lg flex items-center justify-center p-8 md:p-12 group"
        style={{
          background: samkhyaTokens.cardBg,
          border: `1px solid ${samkhyaTokens.cardBorder}`,
        }}
      >
        <img
          key={atual}
          src={atual}
          alt={alt}
          className="max-h-full max-w-full object-contain transition-opacity duration-200"
        />

        {hasMultiple && (
          <>
            <button
              onClick={goPrev}
              aria-label="Imagem anterior"
              className="absolute left-2 md:left-3 top-1/2 -translate-y-1/2 w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center shadow-md transition-opacity"
              style={{
                background: "rgba(255,255,255,0.92)",
                color: samkhyaTokens.roxo,
                border: `1px solid ${samkhyaTokens.cardBorder}`,
              }}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={goNext}
              aria-label="Próxima imagem"
              className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center shadow-md transition-opacity"
              style={{
                background: "rgba(255,255,255,0.92)",
                color: samkhyaTokens.roxo,
                border: `1px solid ${samkhyaTokens.cardBorder}`,
              }}
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Contador */}
            <div
              className="absolute bottom-3 right-3 text-xs px-2 py-0.5 rounded-full"
              style={{
                background: "rgba(0,0,0,0.55)",
                color: "#fff",
              }}
            >
              {index + 1} / {total}
            </div>
          </>
        )}
      </div>

      {/* Miniaturas */}
      {hasMultiple && (
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 snap-x">
          {imagens.map((url, i) => (
            <button
              key={`${url}-${i}`}
              onClick={() => setIndex(i)}
              aria-label={`Ver imagem ${i + 1}`}
              aria-current={i === index}
              className={cn(
                "shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-md overflow-hidden flex items-center justify-center p-1 snap-start transition-all",
                "focus:outline-none focus-visible:ring-2",
              )}
              style={{
                background: samkhyaTokens.cardBg,
                border:
                  i === index
                    ? `2px solid ${samkhyaTokens.roxo}`
                    : `1px solid ${samkhyaTokens.cardBorder}`,
                opacity: i === index ? 1 : 0.7,
              }}
            >
              <img src={url} alt="" className="max-w-full max-h-full object-contain" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
