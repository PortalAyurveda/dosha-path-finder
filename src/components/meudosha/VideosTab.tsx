import { useState } from "react";
import { Search, Sparkles } from "lucide-react";
import VideosGeneralTab from "./VideosGeneralTab";
import VideosPersonalizadoTab from "./VideosPersonalizadoTab";
import VideosPesquisaTab from "./VideosPesquisaTab";
import PremiumLock from "./PremiumLock";
import { useUser } from "@/contexts/UserContext";

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
  const { profile } = useUser();
  const isPremium = profile?.is_premium === true;

  return (
    <div className="space-y-4 mt-4">
      <div className="flex items-center gap-2 bg-muted/30 rounded-lg p-1 w-fit mx-auto">
        <button
          onClick={() => setMode("gerais")}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
            mode === "gerais"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Gerais
        </button>
        <button
          onClick={() => setMode("personalizado")}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1 ${
            mode === "personalizado"
              ? "bg-akasha text-white shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" /> Personalizado
        </button>
        <button
          onClick={() => setMode("pesquisa")}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1 ${
            mode === "pesquisa"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Search className="h-3.5 w-3.5" /> Pesquisa
        </button>
      </div>

      {mode === "gerais" && <VideosGeneralTab doshaprincipal={doshaprincipal} />}

      {mode === "personalizado" && (
        isPremium ? (
          <VideosPersonalizadoTab
            agravVataTags={agravVataTags}
            agravPittaTags={agravPittaTags}
            agravKaphaTags={agravKaphaTags}
            doshaprincipal={doshaprincipal}
          />
        ) : (
          <PremiumLock>
            <VideosPersonalizadoTab
              agravVataTags={agravVataTags}
              agravPittaTags={agravPittaTags}
              agravKaphaTags={agravKaphaTags}
              doshaprincipal={doshaprincipal}
            />
          </PremiumLock>
        )
      )}

      {mode === "pesquisa" && (
        isPremium ? (
          <VideosPesquisaTab doshaprincipal={doshaprincipal} />
        ) : (
          <PremiumLock>
            <VideosPesquisaTab doshaprincipal={doshaprincipal} />
          </PremiumLock>
        )
      )}
    </div>
  );
};

export default VideosTab;
