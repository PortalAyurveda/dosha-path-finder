import { useState } from "react";
import { cn } from "@/lib/utils";
import VideosGeneralTab from "./VideosGeneralTab";
import VideosPersonalizadoTab from "./VideosPersonalizadoTab";

interface VideosTabProps {
  doshaprincipal: string | null;
  agravVataTags: string | null;
  agravPittaTags: string | null;
  agravKaphaTags: string | null;
}

const VideosTab = ({ doshaprincipal, agravVataTags, agravPittaTags, agravKaphaTags }: VideosTabProps) => {
  const [mode, setMode] = useState<"gerais" | "personalizado">("gerais");

  return (
    <div className="space-y-4 mt-4">
      {/* Toggle buttons */}
      <div className="flex justify-center gap-2">
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
          Personalizado ✨
        </button>
      </div>

      {mode === "gerais" ? (
        <VideosGeneralTab doshaprincipal={doshaprincipal} />
      ) : (
        <VideosPersonalizadoTab
          agravVataTags={agravVataTags}
          agravPittaTags={agravPittaTags}
          agravKaphaTags={agravKaphaTags}
          doshaprincipal={doshaprincipal}
        />
      )}
    </div>
  );
};

export default VideosTab;
