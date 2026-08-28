import { BookOpen } from "lucide-react";
import { getTransformedImageUrl } from "@/lib/imageTransform";

export const COR_CARD_PADRAO = "#352F54";

export type OverlayPos =
  | "top-left"
  | "top-center"
  | "center"
  | "bottom-left"
  | "bottom-center";

export const OVERLAY_POS_OPCOES: { value: OverlayPos; label: string }[] = [
  { value: "top-left", label: "Topo, à esquerda" },
  { value: "top-center", label: "Topo, centralizado" },
  { value: "center", label: "Meio da imagem" },
  { value: "bottom-left", label: "Base, à esquerda" },
  { value: "bottom-center", label: "Base, centralizado" },
];

export interface CursoCardConfig {
  titulo: string;
  capaUrl: string;
  logoUrl: string;
  subtitulo: string;
  corSecundaria: string;
  fotoPosicao: string;
  fotoZoom: number;
  foscoOpacidade: number;
  tituloSobreFoto: boolean;
  tituloTamanho: number;
  mostrarTitulo: boolean;
  mostrarSubtitulo: boolean;
  mostrarLogo: boolean;
  overlayPos: OverlayPos;
  logoTamanho: number;
  textoCor: string;
}

const hex2 = (v: number) => Math.round(v).toString(16).padStart(2, "0");

/** Degradê fosco: nasce do lado onde o texto está. */
export const gradienteFosco = (
  cor: string,
  fosco: number,
  pos: OverlayPos = "bottom-left",
): string | null => {
  if (!fosco || fosco <= 0) return null;
  const fim = hex2((fosco / 100) * 255);
  const meio = hex2((fosco / 100) * 0.35 * 255);
  if (pos === "top-left" || pos === "top-center")
    return `linear-gradient(0deg, ${cor}00 0%, ${cor}${meio} 45%, ${cor}${fim} 100%)`;
  if (pos === "center")
    return `linear-gradient(180deg, ${cor}00 0%, ${cor}${fim} 50%, ${cor}00 100%)`;
  return `linear-gradient(180deg, ${cor}00 0%, ${cor}${meio} 45%, ${cor}${fim} 100%)`;
};

const posClasses = (pos: OverlayPos) => {
  switch (pos) {
    case "top-left":
      return "justify-start items-start text-left";
    case "top-center":
      return "justify-start items-center text-center";
    case "center":
      return "justify-center items-center text-center";
    case "bottom-center":
      return "justify-end items-center text-center";
    default:
      return "justify-end items-start text-left";
  }
};

interface Props {
  cfg: CursoCardConfig;
  /** admin: clique posiciona a foto */
  fotoRef?: React.RefObject<HTMLDivElement>;
  onFotoClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  eager?: boolean;
}

/** A capa do card da vitrine — mesma renderização no /cursos e no preview do admin. */
export const CursoCardCapa = ({ cfg, fotoRef, onFotoClick, eager }: Props) => {
  const cor = cfg.corSecundaria || COR_CARD_PADRAO;
  const gradiente = gradienteFosco(cor, cfg.foscoOpacidade, cfg.overlayPos);
  const tituloPx = 19 * ((cfg.tituloTamanho || 100) / 100);
  const logoPx = 42 * ((cfg.logoTamanho || 100) / 100);
  const texto = cfg.textoCor || "#FFFFFF";

  const mostraBloco =
    cfg.tituloSobreFoto &&
    (cfg.mostrarLogo || cfg.mostrarTitulo || cfg.mostrarSubtitulo);

  return (
    <div
      ref={fotoRef}
      onClick={onFotoClick}
      className={`relative aspect-[4/3] w-full overflow-hidden bg-muted ${
        onFotoClick ? "cursor-crosshair" : ""
      }`}
      title={onFotoClick ? "Clique no ponto da foto que deve ficar visível" : undefined}
    >
      {cfg.capaUrl ? (
        <div
          className="absolute inset-0 bg-no-repeat transition-transform duration-500 group-hover:scale-[1.03]"
          style={{
            backgroundImage: `url(${getTransformedImageUrl(cfg.capaUrl, 800)})`,
            backgroundPosition: cfg.fotoPosicao || "center center",
            backgroundSize: "cover",
            transform: `scale(${(cfg.fotoZoom || 100) / 100})`,
          }}

          role="img"
          aria-label={cfg.titulo}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20" />
      )}

      {gradiente && <div className="absolute inset-0" style={{ backgroundImage: gradiente }} />}

      {mostraBloco && (
        <div
          className={`absolute inset-0 flex flex-col p-5 ${posClasses(cfg.overlayPos)}`}
          style={{ color: texto }}
        >
          {cfg.mostrarLogo && (
            <div className="mb-2.5 shrink-0">
              {cfg.logoUrl ? (
                <img
                  src={cfg.logoUrl}
                  alt=""
                  className="w-auto object-contain drop-shadow-md"
                  style={{ height: logoPx }}
                />
              ) : (
                <span
                  className="rounded-xl bg-white/95 flex items-center justify-center shadow-md"
                  style={{ width: logoPx, height: logoPx }}
                >
                  <BookOpen style={{ width: logoPx * 0.5, height: logoPx * 0.5, color: cor }} />
                </span>
              )}
            </div>
          )}
          {cfg.mostrarTitulo && (
            <h3
              className="font-serif font-bold leading-tight line-clamp-3"
              style={{ fontSize: `${tituloPx}px`, textShadow: "0 2px 10px rgba(0,0,0,.35)" }}
            >
              {cfg.titulo || "Título do curso"}
            </h3>
          )}
          {cfg.mostrarSubtitulo && cfg.subtitulo && (
            <p
              className="mt-1.5 text-[11px] font-bold uppercase tracking-[0.14em] opacity-90"
              style={{ textShadow: "0 1px 8px rgba(0,0,0,.45)" }}
            >
              {cfg.subtitulo}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

/** Título clássico, abaixo da foto. */
export const CursoCardTituloAbaixo = ({ cfg }: { cfg: CursoCardConfig }) => {
  if (cfg.tituloSobreFoto) return null;
  const cor = cfg.corSecundaria || COR_CARD_PADRAO;
  const tituloPx = 19 * ((cfg.tituloTamanho || 100) / 100);
  const logoPx = 36 * ((cfg.logoTamanho || 100) / 100);
  if (!cfg.mostrarLogo && !cfg.mostrarTitulo && !cfg.mostrarSubtitulo) return null;

  return (
    <div className="px-6 pt-5 pb-1 flex items-start gap-3">
      {cfg.mostrarLogo && cfg.logoUrl && (
        <img
          src={cfg.logoUrl}
          alt=""
          className="w-auto object-contain shrink-0 mt-0.5"
          style={{ height: logoPx }}
        />
      )}
      <div className="min-w-0">
        {cfg.mostrarTitulo && (
          <h3
            className="line-clamp-2 leading-tight font-bold font-serif"
            style={{ fontSize: `${tituloPx}px`, color: cor }}
          >
            {cfg.titulo || "Título do curso"}
          </h3>
        )}
        {cfg.mostrarSubtitulo && cfg.subtitulo && (
          <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground line-clamp-1">
            {cfg.subtitulo}
          </p>
        )}
      </div>
    </div>
  );
};

export default CursoCardCapa;
