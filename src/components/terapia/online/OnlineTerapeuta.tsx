import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSouTerapeuta } from "@/hooks/useSouTerapeuta";
import { useToast } from "@/hooks/use-toast";
import { PING_MS, terapia, type Ping } from "@/lib/terapia";
import AvisoConsultaAgora from "./AvisoConsultaAgora";

interface EstadoOnline { participa: boolean; online: boolean; nome: string; mudando: boolean; mudar: (v: boolean) => Promise<void> }
const Ctx = createContext<EstadoOnline | null>(null);
export const useOnlineTerapeuta = () => useContext(Ctx);

export function OnlineTerapeutaProvider({ children }: { children: ReactNode }) {
  const acesso = useSouTerapeuta();
  const qc = useQueryClient();
  const { toast } = useToast();
  const painel = useQuery({ queryKey: ["terapia-painel", acesso.userId], queryFn: terapia.painel, enabled: acesso.permitido });
  const [ping, setPing] = useState<Ping | null>(null);
  const [mudando, setMudando] = useState(false);
  const participa = ping?.participa ?? painel.data?.sistema.participa ?? false;
  const online = participa && (ping?.online ?? painel.data?.sistema.online ?? false);
  const pingar = useCallback(async () => {
    try { const r = await terapia.ping(); if (r) setPing(r); } catch { /* tenta de novo no próximo intervalo */ }
  }, []);
  useEffect(() => { setPing(null); }, [acesso.userId]);
  useEffect(() => {
    if (!acesso.permitido || !online) return;
    void pingar();
    const id = setInterval(pingar, PING_MS);
    return () => clearInterval(id);
  }, [acesso.permitido, online, pingar]);
  const mudar = async (v: boolean) => {
    setMudando(true);
    try {
      const r = await terapia.online(v);
      setPing((p) => ({ participa: true, pedidos_agora: p?.pedidos_agora ?? 0, online: r }));
      if (r) void pingar();
      void qc.invalidateQueries({ queryKey: ["terapia-painel", acesso.userId] });
    } catch (e) {
      toast({ title: e instanceof Error ? e.message : String(e), variant: "destructive" });
    } finally { setMudando(false); }
  };
  const valor: EstadoOnline | null = acesso.permitido && painel.data ? { participa, online, nome: painel.data.terapeuta.nome, mudando, mudar } : null;
  return (
    <Ctx.Provider value={valor}>
      {children}
      {valor && participa && <AvisoConsultaAgora temPedidos={(ping?.pedidos_agora ?? 0) > 0} />}
    </Ctx.Provider>
  );
}
