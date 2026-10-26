import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import CTAButton from "@/components/CTAButton";
import { AGORA_POLL_MS, horaBR, terapia, type PedidoAgora } from "@/lib/terapia";

function Acompanhar({ id, fechar }: { id: string; fechar: () => void }) {
  const q = useQuery({ queryKey: ["agora-do-pedido", id], queryFn: () => terapia.agoraDoPedido(id), refetchInterval: (r) => (r.state.data && r.state.data.status !== "aceito" ? false : AGORA_POLL_MS) });
  const p = q.data;
  if (!p) return null;
  return (
    <div className="relative rounded-lg border border-secondary/30 bg-card p-4 shadow-lg">
      <Button variant="ghost" size="icon" className="absolute right-1 top-1 h-7 w-7" aria-label="Fechar aviso" onClick={fechar}><X className="h-4 w-4" /></Button>
      <p className="pr-6 text-sm font-semibold">{p.paciente_nome ?? "Consulta agora"}</p>
      {p.status === "confirmado" && p.consulta_id ? (
        <CTAButton to={`/consulta/${p.consulta_id}`} className="mt-3 h-10 w-full px-4 py-2 text-sm">Entrar na sala</CTAButton>
      ) : p.status === "aceito" ? (
        <p className="mt-1 text-xs text-muted-foreground">Esperando a confirmação{p.inicio ? ` · ${horaBR(p.inicio)}` : ""}…</p>
      ) : (
        <p className="mt-1 text-xs text-muted-foreground">{p.status === "cancelado" ? "A pessoa desistiu." : "O pedido expirou."}</p>
      )}
    </div>
  );
}

export default function AvisoConsultaAgora({ temPedidos }: { temPedidos: boolean }) {
  const [acompanhando, setAcompanhando] = useState<string[]>([]);
  const [erro, setErro] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const [ativo, setAtivo] = useState(true);
  const q = useQuery({ queryKey: ["agora-pedidos"], queryFn: terapia.agoraPedidos, enabled: ativo || temPedidos, refetchInterval: AGORA_POLL_MS });
  const novos = (q.data ?? []).filter((p) => p.status === "pedido");
  useEffect(() => { if (temPedidos) setAtivo(true); }, [temPedidos]);
  useEffect(() => { if (q.data && !q.data.length && !temPedidos) setAtivo(false); }, [q.data, temPedidos]);
  const responder = async (p: PedidoAgora, aceitar: boolean, minutos = 0) => {
    setOcupado(true); setErro("");
    try {
      const r = await terapia.agoraResponder(p.id, aceitar, minutos);
      if (r.status === "aceito") setAcompanhando((l) => [...new Set([...l, r.id])]);
      await q.refetch();
    } catch (e) { setErro(e instanceof Error ? e.message : String(e)); } finally { setOcupado(false); }
  };
  if (!novos.length && !acompanhando.length) return null;
  return (
    <div role="region" aria-label="Consulta agora" className="fixed bottom-4 right-4 z-50 w-[min(22rem,calc(100vw-2rem))] space-y-3">
      {novos.map((p) => (
        <div key={p.id} className="rounded-lg border border-secondary/30 bg-card p-4 shadow-lg">
          <p className="text-xs font-semibold uppercase text-secondary">Consulta agora</p>
          <p className="mt-1 text-sm font-semibold">{p.paciente_nome ?? "Alguém"} quer uma consulta</p>
          {p.motivo && <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">“{p.motivo}”</p>}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <CTAButton disabled={ocupado} className="col-span-2 h-10 px-4 py-2 text-sm" onClick={() => void responder(p, true, 0)}>Atender agora</CTAButton>
            <Button variant="outline" size="sm" disabled={ocupado} onClick={() => void responder(p, true, 10)}>Em 10 minutos</Button>
            <Button variant="outline" size="sm" disabled={ocupado} onClick={() => void responder(p, true, 15)}>Em 15 minutos</Button>
            <Button variant="ghost" size="sm" disabled={ocupado} className="col-span-2" onClick={() => void responder(p, false)}>Agora não</Button>
          </div>
          {erro && <p role="alert" className="mt-2 text-xs text-destructive">{erro}</p>}
        </div>
      ))}
      {acompanhando.map((id) => <Acompanhar key={id} id={id} fechar={() => setAcompanhando((l) => l.filter((x) => x !== id))} />)}
      <span className="sr-only"><Link to="/painel-terapeuta">Área da terapeuta</Link></span>
    </div>
  );
}
