import { useEffect, useState } from "react";
import {useSouTerapeuta} from "@/hooks/useSouTerapeuta";
import MensagemPerfil from "../chat/MensagemPerfil";
import {tempoPedido} from "@/lib/terapiaPublica";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import CTAButton from "@/components/CTAButton";
import LoginForm from "@/components/auth/LoginForm";
import { useUser } from "@/contexts/UserContext";
import { AGORA_POLL_MS, horaBR, pedidoAberto, reais, terapia, type PedidoAgora } from "@/lib/terapia";
import type { PermissoesConvite } from "@/lib/terapiaConvite";
import AgendamentoPublico from './AgendamentoPublico';

const PERMS: [keyof PermissoesConvite, string][] = [["teste", "Meu teste de dosha"], ["fotos", "Minhas fotos"], ["rotina", "Minha rotina"], ["akasha", "Minhas conversas com a Akasha"]];
const chave = (slug: string) => `consulta-agora:${slug}`;

export function OnlineAgora() {
  return <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[hsl(var(--therapist-green-ink))]"><span className="h-2 w-2 rounded-full bg-[hsl(var(--therapist-green-ink))]" aria-hidden />online agora</span>;
}

export default function ConsultaPublica({ slug, terapeutaId, primeiroNome }: { slug: string; terapeutaId: string; primeiroNome: string }) {
  const { user, isAnonymous } = useUser();
  const identidade=useSouTerapeuta();
  const painel=useQuery({queryKey:["mesa-terapeuta",identidade.userId],queryFn:terapia.painel,enabled:identidade.permitido});
  const propria=painel.data?.terapeuta.id===terapeutaId;
  const [agora,setAgora]=useState(Date.now());
  useEffect(()=>{const t=setInterval(()=>setAgora(Date.now()),1000);return()=>clearInterval(t);},[]);
  const logado = !!user && !isAnonymous;
  const navigate = useNavigate();
  const agenda = useQuery({ queryKey: ["agenda-publica", slug, user?.id], queryFn: () => terapia.agendaPublica(slug), refetchInterval: 60000 });
  const [pedidoId, setPedidoId] = useState<string | null>(() => sessionStorage.getItem(chave(slug)));
  const [modo, setModo] = useState<"" | "agora" | "entrar">("");
  const [motivo, setMotivo] = useState("");
  const [perm, setPerm] = useState<PermissoesConvite>({ teste: true, fotos: true, rotina: true, akasha: false });
  const [erro, setErro] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const [naoDeu, setNaoDeu] = useState(false);
  const pedido = useQuery({
    queryKey: ["agora-meu", pedidoId],
    queryFn: () => { if (!pedidoId) throw new Error('Pedido não encontrado.'); return terapia.agoraMeu(pedidoId); },
    enabled: !!pedidoId && logado,
    refetchInterval: (q) => (q.state.data && !pedidoAberto(q.state.data.status) ? false : AGORA_POLL_MS),
    retry: false,
  });
  const p: PedidoAgora | undefined = pedido.data;
  const guardar = (id: string | null) => { setPedidoId(id); if (id) sessionStorage.setItem(chave(slug), id); else sessionStorage.removeItem(chave(slug)); };
  useEffect(() => {
    if (pedido.error) guardar(null);
    if (!p) return;
    if (p.status === "recusado" || p.status === "expirado") { setNaoDeu(true); guardar(null); setModo(""); }
    if (p.status === "cancelado") { guardar(null); setModo(""); }
    if (p.status === "confirmado" && p.consulta_id) { guardar(null); navigate(`/consulta/${p.consulta_id}`); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p, pedido.error]);
  const rodar = async (fn: () => Promise<void>) => { setOcupado(true); setErro(""); try { await fn(); } catch (e) { setErro(e instanceof Error ? e.message : String(e)); } finally { setOcupado(false); } };
  const a = agenda.data;
  useEffect(()=>{if(a?.no_sistema&&window.location.hash==="#agenda")requestAnimationFrame(()=>document.getElementById("agenda")?.scrollIntoView({block:"start"}));},[a?.no_sistema]);
  if (!a?.no_sistema) return null;
  const aberto = p && pedidoAberto(p.status);
  return (
    <section id="agenda" aria-label="Marcar consulta" className="mb-10 scroll-mt-24 rounded-lg border border-border bg-card p-5">
      <p className="consulta-online-selo">● Consulta online pelo Portal</p>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-serif text-lg font-bold text-primary">Marcar consulta com {primeiroNome}</h2>
        {a.online && <OnlineAgora />}
      </div>
      <p className="mt-2 text-sm text-muted-foreground">Primeira consulta · {a.horarios?.[0]?Math.round((Date.parse(a.horarios[0].fim)-Date.parse(a.horarios[0].inicio))/60000):50} minutos · por vídeo, na sala do Portal</p>
      {a.valor != null ? <p className="mt-1 text-sm text-muted-foreground">{a.valor === 0 ? 'Consulta gratuita' : `Valor da consulta: ${reais(Number(a.valor))}, combinado direto com a terapeuta`}</p> : null}
      {erro && <p role="alert" className="mt-3 text-sm text-destructive">{erro}</p>}

      {(aberto ? (
        <div className="mt-4 rounded-lg border border-secondary/30 bg-secondary/5 p-4">
          {p.status === "pedido" ? (
            <>
              <p className="text-sm font-semibold">Pedido enviado. Esperando {primeiroNome} responder...</p><p role="timer" className="mt-2 text-sm">Tempo restante: {tempoPedido(p.expira_em,agora)}</p>
              <Button variant="outline" size="sm" className="mt-3" disabled={ocupado} onClick={() => void rodar(async () => { await terapia.agoraCancelar(p.id); guardar(null); setModo(""); })}>Desistir</Button>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold">{primeiroNome} pode atender {p.em_minutos && p.inicio ? `às ${horaBR(p.inicio)}` : "agora"}</p>
              <p role="timer" className="mt-2 text-sm">Tempo restante: {tempoPedido(p.expira_em,agora)}</p><p className="mt-3 text-xs font-semibold uppercase text-muted-foreground">O que {primeiroNome} pode ver</p>
              <div className="mt-2 space-y-2">
                {PERMS.map(([k, n]) => (
                  <div key={k} className="flex items-center gap-2">
                    <Checkbox id={`perm-agora-${k}`} checked={perm[k]} onCheckedChange={(v) => setPerm({ ...perm, [k]: v === true })} />
                    <label htmlFor={`perm-agora-${k}`} className="text-sm">{n}</label>
                  </div>
                ))}
              </div>
              <CTAButton disabled={ocupado} className="mt-4 h-10 px-5 py-2 text-sm" onClick={() => void rodar(async () => { const r = await terapia.agoraConfirmar(p.id, perm); if(r.status==="expirado"){setErro("A terapeuta ficou ocupada neste horário. Tente de novo em alguns minutos.");guardar(null);setModo("");return;} if (r.consulta_id) { guardar(null); navigate(`/consulta/${r.consulta_id}`); } })}>Confirmar consulta</CTAButton>
              <Button variant="ghost" size="sm" className="ml-2" disabled={ocupado} onClick={() => void rodar(async () => { await terapia.agoraCancelar(p.id); guardar(null); })}>Desistir</Button>
            </>
          )}
        </div>
      ) : (
        <>
          {naoDeu && <p className="mt-4 rounded-lg border border-border p-3 text-sm">Agora não deu. Veja os próximos horários</p>}
          {modo === "agora" && logado && (
            <form className="mt-4 space-y-3" onSubmit={(e) => { e.preventDefault(); void rodar(async () => { const r = await terapia.agoraPedir(slug, motivo); guardar(r.id); }); }}>
              <div>
                <Label htmlFor="motivo-agora">O que te traz? <span className="font-normal text-muted-foreground">(opcional)</span></Label>
                <Textarea id="motivo-agora" className="mt-1" value={motivo} onChange={(e) => setMotivo(e.target.value)} />
              </div>
              <div className="flex gap-2">
                <CTAButton type="submit" disabled={ocupado} className="h-10 px-5 py-2 text-sm">Enviar pedido</CTAButton>
                <Button type="button" variant="ghost" onClick={() => setModo("")}>Voltar</Button>
              </div>
            </form>
          )}
          {modo === "entrar" && !logado && <div className="mt-4"><LoginForm embedded emailOnly redirectPath={`/terapeutas/${slug}`} /></div>}
          <AgendamentoPublico slug={slug} nome={primeiroNome} agenda={a} atualizar={agenda.refetch} />
          <div className="mt-4 border-t border-border pt-4"><MensagemPerfil slug={slug} permitido={!propria}/><div>{!propria&&a.online&&!naoDeu&&modo!=="agora"&&<CTAButton className="h-11 w-full px-4 py-2" onClick={()=>setModo(logado?"agora":"entrar")}>Consulta agora</CTAButton>}</div></div>
        </>
      ))}
    </section>
  );
}
