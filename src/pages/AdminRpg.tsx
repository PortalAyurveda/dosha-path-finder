import { useState } from "react";
import PageContainer from "@/components/PageContainer";
import SectionTitle from "@/components/SectionTitle";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Play } from "lucide-react";

type Status =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "success"; campaignId: string }
  | { kind: "warning"; message: string };

const leafShape = "rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm";

const AdminRpg = () => {
  const [historia, setHistoria] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const loading = status.kind === "loading";
  const disabled = loading || historia.trim().length === 0;

  const handleGerar = async () => {
    setStatus({ kind: "loading" });
    try {
      const res = await fetch("https://n8n.portalayurveda.com/webhook/rpg-gerar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ historia }),
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch {
        setStatus({
          kind: "warning",
          message:
            "Resposta do servidor não foi um JSON válido. A geração pode ainda estar rodando — verifique no banco em alguns minutos.",
        });
        return;
      }

      if (data && data.ok === true && data.campaign_id) {
        setStatus({ kind: "success", campaignId: String(data.campaign_id) });
      } else {
        setStatus({
          kind: "warning",
          message:
            "O servidor respondeu, mas sem confirmação de sucesso. A geração pode ainda estar rodando — verifique no banco em alguns minutos.",
        });
      }
    } catch {
      setStatus({
        kind: "warning",
        message:
          "A requisição demorou ou caiu, mas a geração pode ainda estar rodando no servidor. Verifique no banco em alguns minutos.",
      });
    }
  };

  return (
    <PageContainer
      title="Admin · Gerar RPG"
      description="Painel interno para gerar campanhas de RPG."
    >
      <SectionTitle centered={false}>Gerar Campanha de RPG</SectionTitle>

      <p className="text-muted-foreground max-w-2xl mb-6">
        Descreva o mundo e a história da campanha. O Arquiteto vai construir o bioma, as 3 cidades,
        NPCs, 10 quests interligadas, salas e o mapa automaticamente.
      </p>

      <div className={`bg-card border p-5 sm:p-6 ${leafShape} shadow-sm`}>
        <label htmlFor="historia" className="block text-sm font-medium mb-2">
          História / tese do mundo
        </label>
        <Textarea
          id="historia"
          value={historia}
          onChange={(e) => setHistoria(e.target.value)}
          rows={8}
          disabled={loading}
          placeholder="Ex: Um arquipélago vulcânico onde tribos disputam o controle de fontes termais sagradas que estão secando..."
          className="min-h-[12rem] text-base"
        />

        <div className="mt-5 flex flex-col sm:flex-row sm:items-center gap-3">
          <Button
            onClick={handleGerar}
            disabled={disabled}
            className={`bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold px-6 py-5 ${leafShape} shadow-md hover:shadow-lg transition-all`}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" /> Gerando…
              </>
            ) : (
              <>
                <Play /> Gerar campanha
              </>
            )}
          </Button>
          {loading && (
            <span className="text-sm text-muted-foreground">
              Gerando campanha… isso leva alguns minutos, não feche a página.
            </span>
          )}
        </div>

        <div className="mt-5" aria-live="polite">
          {status.kind === "success" && (
            <div
              className={`border border-green-300 bg-green-50 text-green-900 p-4 ${leafShape}`}
            >
              <p className="font-semibold">Campanha criada!</p>
              <p className="text-sm mt-1">
                ID: <code className="font-mono">{status.campaignId}</code>
              </p>
            </div>
          )}
          {status.kind === "warning" && (
            <div
              className={`border border-yellow-300 bg-yellow-50 text-yellow-900 p-4 ${leafShape}`}
            >
              <p className="text-sm">{status.message}</p>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
};

export default AdminRpg;
