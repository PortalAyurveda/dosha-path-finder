import { useState } from "react";
import { Search, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import VideosGeneralTab from "./VideosGeneralTab";
import VideosPersonalizadoTab from "./VideosPersonalizadoTab";
import VideosPesquisaTab from "./VideosPesquisaTab";

type Mode = "gerais" | "personalizado" | "pesquisa";

interface VideosTabProps {
  doshaprincipal: string | null;
  agravVataTags: string | null;
  agravPittaTags: string | null;
  agravKaphaTags: string | null;
  initialMode?: Mode;
}

const VideosTab = ({ doshaprincipal, agravVataTags, agravPittaTags, agravKaphaTags, initialMode = "gerais" }: VideosTabProps) => {
  const [mode, setMode] = useState<Mode>(initialMode);

  return (
    <div className="space-y-4 mt-4">
      <div className="flex justify-center gap-2 flex-wrap">
        <button
          onClick={() => setMode("gerais")}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-semibold transition-all",
            mode === "gerais"
              ? "bg-primary text-primary-foreground shadow-md"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          )}
        >
          Gerais
        </button>
        <button
          onClick={() => setMode("personalizado")}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-1",
            mode === "personalizado"
              ? "bg-akasha text-white shadow-md"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          )}
        >
          <Sparkles className="h-3.5 w-3.5" /> Personalizado
        </button>
        <button
          onClick={() => setMode("pesquisa")}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-1",
            mode === "pesquisa"
              ? "bg-primary text-primary-foreground shadow-md"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          )}
        >
          <Search className="h-3.5 w-3.5" /> Pesquisa
        </button>
      </div>

      {mode === "gerais" && <VideosGeneralTab doshaprincipal={doshaprincipal} />}
      {mode === "personalizado" && (
        <VideosPersonalizadoTab
          agravVataTags={agravVataTags}
          agravPittaTags={agravPittaTags}
          agravKaphaTags={agravKaphaTags}
          doshaprincipal={doshaprincipal}
        />
      )}
      {mode === "pesquisa" && <VideosPesquisaTab doshaprincipal={doshaprincipal} />}
    </div>
  );
};

export default VideosTab;
