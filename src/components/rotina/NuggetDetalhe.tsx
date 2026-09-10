import { useState } from "react";
import { Check, ChevronDown, Play } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import VideoPlayerDialog from "@/components/biblioteca/VideoPlayerDialog";

export interface NuggetJson {
  resumo?: string;
  ingredientes?: { qtd?: string; item?: string }[];
  modo_preparo?: string[];
  dicas?: string;
  efeito_esperado?: string;
  bom_para_agni?: boolean;
  tags?: string[];
  dravya_guna?: {
    rasa?: string[];
    virya?: string;
    gunas?: string[];
    karma?: string[];
    efeito_tecidos?: string;
  };
}

export interface Nugget {
  id: string;
  slug?: string | null;
  titulo: string;
  icone_lucide: string | null;
  imagem_url: string | null;
  video_id: string | null;
  video_timestamp: string | null;
  vata: number | null;
  pitta: number | null;
  kapha: number | null;
  nugget_json: NuggetJson | null;
}

export const formatScore = (n: number | null | undefined) => {
  if (n === null || n === undefined) return "0";
  if (n > 0) return `+${n}`;
  if (n < 0) return `−${Math.abs(n)}`;
  return "0";
};

export const parseTimestamp = (ts: string | null): number | undefined => {
  if (!ts) return undefined;
  const n = Number(ts);
  if (!Number.isNaN(n)) return n;
  const parts = ts.split(":").map(Number);
  if (parts.some(Number.isNaN)) return undefined;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return undefined;
};

interface NuggetDetalheProps {
  nugget: Nugget;
  /** Mostra o botão "marcar como praticado" (só quando o item está na rotina) */
  podeMarcar?: boolean;
  feito?: boolean;
  onToggleFeito?: () => void;
  somenteLeitura?: boolean;
}

/** Conteúdo completo de uma receita/prática — usado no card da rotina e na isca por link. */
const NuggetDetalhe = ({
  nugget,
  podeMarcar = false,
  feito = false,
  onToggleFeito,
  somenteLeitura = false,
}: NuggetDetalheProps) => {
  const [porqueOpen, setPorqueOpen] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);

  const nj = nugget.nugget_json ?? {};
  const dg = nj.dravya_guna ?? {};
  const tsSec = parseTimestamp(nugget.video_timestamp ?? null);

  return (
    <div className="space-y-4 text-sm text-foreground">
      {nugget.imagem_url && (
        <img
          src={nugget.imagem_url}
          alt={nugget.titulo}
          loading="lazy"
          decoding="async"
          className="float-right ml-4 mb-2 w-32 sm:w-40 aspect-square object-cover rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm shadow-sm"
        />
      )}
      {nj.resumo && (
        <p className="text-muted-foreground leading-relaxed">{nj.resumo}</p>
      )}

      {nj.ingredientes && nj.ingredientes.length > 0 && (
        <div>
          <h4 className="font-semibold mb-1">Ingredientes</h4>
          <ul className="list-disc pl-5 space-y-0.5 text-muted-foreground">
            {nj.ingredientes.map((i, idx) => (
              <li key={idx}>{[i.qtd, i.item].filter(Boolean).join(" ")}</li>
            ))}
          </ul>
        </div>
      )}

      {nj.modo_preparo && nj.modo_preparo.length > 0 && (
        <div>
          <h4 className="font-semibold mb-1">Modo de preparo</h4>
          <ol className="list-decimal pl-5 space-y-1 text-muted-foreground">
            {nj.modo_preparo.map((p, idx) => (
              <li key={idx}>{p}</li>
            ))}
          </ol>
        </div>
      )}

      {nj.dicas && (
        <div>
          <h4 className="font-semibold mb-1">Dicas</h4>
          <p className="text-muted-foreground">{nj.dicas}</p>
        </div>
      )}

      {nj.efeito_esperado && (
        <div>
          <h4 className="font-semibold mb-1">Efeito esperado</h4>
          <p className="text-muted-foreground">{nj.efeito_esperado}</p>
        </div>
      )}

      <div className="clear-both flex flex-wrap items-center gap-2">
        {nugget.video_id && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setVideoOpen(true)}
            className="gap-2"
          >
            <Play className="h-4 w-4" />
            ver o prof. ensinar
          </Button>
        )}
        {podeMarcar && (
          <Button
            type="button"
            variant={feito ? "default" : "outline"}
            size="sm"
            onClick={onToggleFeito}
            disabled={somenteLeitura}
            className="gap-2"
          >
            <Check className="h-4 w-4" />
            {feito ? "praticado hoje" : "marcar como praticado"}
          </Button>
        )}
      </div>

      {/* Camada 2 */}
      <Collapsible open={porqueOpen} onOpenChange={setPorqueOpen}>
        <CollapsibleTrigger asChild>
          <button className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
            por que funciona
            <ChevronDown
              className={cn("h-4 w-4 transition-transform", porqueOpen && "rotate-180")}
            />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3 space-y-2 text-sm text-muted-foreground">
          {dg.rasa && dg.rasa.length > 0 && (
            <p>
              <span className="font-medium text-foreground">Sabores:</span>{" "}
              {dg.rasa.join(", ")}
            </p>
          )}
          <p className="leading-relaxed">
            {dg.virya && (
              <>
                <span className="font-medium text-foreground">Potência:</span>{" "}
                {dg.virya}
                {" · "}
              </>
            )}
            {dg.gunas && dg.gunas.length > 0 && (
              <>
                <span className="font-medium text-foreground">Qualidades:</span>{" "}
                {dg.gunas.join("/")}
                {" · "}
              </>
            )}
            {dg.karma && dg.karma.length > 0 && (
              <>
                <span className="font-medium text-foreground">Ações:</span>{" "}
                {dg.karma.join("/")}
                {" · "}
              </>
            )}
            {dg.efeito_tecidos && (
              <>
                <span className="font-medium text-foreground">Efeito nos tecidos:</span>{" "}
                {dg.efeito_tecidos}
              </>
            )}
          </p>
          <p>
            <span className="font-medium text-foreground">Efeito nos doshas:</span>{" "}
            Vata {formatScore(nugget.vata)} · Pitta {formatScore(nugget.pitta)} ·
            Kapha {formatScore(nugget.kapha)}
          </p>
        </CollapsibleContent>
      </Collapsible>

      {nugget.video_id && (
        <VideoPlayerDialog
          open={videoOpen}
          onOpenChange={setVideoOpen}
          videoId={nugget.video_id}
          title={nugget.titulo}
          description={nj.resumo ?? ""}
          initialSeconds={tsSec}
        />
      )}
    </div>
  );
};

export default NuggetDetalhe;
