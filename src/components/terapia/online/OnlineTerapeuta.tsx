import { useCallback, useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSouTerapeuta } from "@/hooks/useSouTerapeuta";
import { useToast } from "@/hooks/use-toast";
import { PING_MS, terapia, type Ping } from "@/lib/terapia";
import AvisoConsultaAgora from "./AvisoConsultaAgora";
import { prepararAvisosConsulta } from '@/lib/consultaAgoraAvisos';

import type { EstadoOnline } from "./contexto";

// Carregado à parte (lazy) pelo Layout, só para quem é terapeuta. Entrega o estado pelo onValor.
export default function OnlineTerapeutaMotor({ onValor }: { onValor: (v: EstadoOnline | null) => void }) {
  const acesso = useSouTerapeuta();
  const qc = useQueryClient();
  const { toast } = useToast();
  const painel = useQuery({ queryKey: ["terapia-painel", acesso.userId], queryFn: terapia.painel, enabled: acesso.permitido });
  const [ping, setPing] = useState<Ping | null>(null);
  const [mudando, setMudando] = useState(false);
  const participa = painel.data?.sistema.participa ?? ping?.participa ?? false;
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
    if (v) prepararAvisosConsulta();
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
  const nome = painel.data?.terapeuta.nome;
  const pronto = acesso.permitido && !!painel.data;
  useEffect(() => {
    onValor(pronto ? { participa, online, nome: nome ?? "", mudando, mudar } : null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pronto, participa, online, nome, mudando]);
  useEffect(() => () => onValor(null), [onValor]);
  return valor && participa ? <AvisoConsultaAgora key={acesso.userId} online={online} temPedidos={(ping?.pedidos_agora ?? 0) > 0} /> : null;
}
