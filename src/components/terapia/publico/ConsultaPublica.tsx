import { useEffect, useMemo, useState } from "react";
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

const PERMS: [keyof PermissoesConvite, string][] = [["teste", "Meu teste de dosha"], ["fotos", "Minhas fotos"], ["rotina", "Minha rotina"], ["akasha", "Minhas conversas com a Akasha"]];
const chave = (slug: string) => `consulta-agora:${slug}`;

export function OnlineAgora() {
  return <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[hsl(var(--therapist-green-ink))]"><span className="h-2 w-2 rounded-full bg-[hsl(var(--therapist-green-ink))]" aria-hidden />online agora</span>;
}

export default function ConsultaPublica({ slug, terapeutaId, primeiroNome }: { slug: string; terapeutaId: string; primeiroNome: string }) {
  const { user, isAnonymous } = useUser();
  const logado = !!user && !isAnonymous;
  const navigate = useNavigate();
  const agenda = useQuery({ queryKey: ["agenda-publica", slug, user?.id], queryFn: () => terapia.agendaPublica(slug), refetchInterval: 60000 });
  const [pedidoId, setPedidoId] = useState<string | null>(() => sessionStorage.getItem(chave(slug)));
  const [modo, setModo] = useState<"" | "agora" | "entrar">("");
  const [motivo, setMotivo] = useState("");
  const [perm, setPerm] = useState<PermissoesConvite>({ teste: true, fotos: true, rotina: true, akasha: false });
  const [erro, setErro] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const [marcada, setMarcada] = useState<string | null>(null);
  const [naoDeu, setNaoDeu] = useState(false);
  const pedido = useQuery({
    queryKey: ["agora-meu", pedidoId],
    queryFn: () => terapia.agoraMeu(pedidoId!),
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
  const dias = useMemo(() => {
    const g: Record<string, { inicio: string }[]> = {};
    for (const h of agenda.data?.horarios ?? []) {
      const d = new Date(h.inicio).toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit", timeZone: "America/Sao_Paulo" });
      (g[d] ??= []).push(h);
    }
    return Object.entries(g).slice(0, 7);
  }, [agenda.data]);
  const rodar = async (fn: () => Promise<void>) => { setOcupado(true); setErro(""); try { await fn(); } catch (e) { setErro(e instanceof Error ? e.message : String(e)); } finally { setOcupado(false); } };
  const a = agenda.data;
  if (!a?.no_sistema) return null;
  const aberto = p && pedidoAberto(p.status);
  return (
    <section aria-label="Marcar consulta" className="mb-10 rounded-2xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-serif text-lg font-bold text-primary">Marcar consulta</h2>
        {a.online && <OnlineAgora />}
      </div>
      {a.valor ? <p className="mt-1 text-sm text-muted-foreground">Valor da consulta: {reais(Number(a.valor))}, combinado direto com a terapeuta</p> : null}
      {erro && <p role="alert" className="mt-3 text-sm text-destructive">{erro}</p>}

      {aberto ? (
        <div className="mt-4 rounded-lg border border-secondary/30 bg-secondary/5 p-4">
          {p.status === "pedido" ? (
            <>
              <p className="text-sm font-semibold">Pedido enviado. Esperando {primeiroNome} responder...</p>
              <Button variant="outline" size="sm" className="mt-3" disabled={ocupado} onClick={() => void rodar(async () => { await terapia.agoraCancelar(p.id); guardar(null); setModo(""); })}>Desistir</Button>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold">{primeiroNome} pode atender {p.em_minutos && p.inicio ? `às ${horaBR(p.inicio)}` : "agora"}</p>
              <p className="mt-3 text-xs font-semibold uppercase text-muted-foreground">O que {primeiroNome} pode ver</p>
              <div className="mt-2 space-y-2">
                {PERMS.map(([k, n]) => (
                  <div key={k} className="flex items-center gap-2">
                    <Checkbox id={`perm-agora-${k}`} checked={perm[k]} onCheckedChange={(v) => setPerm({ ...perm, [k]: v === true })} />
                    <label htmlFor={`perm-agora-${k}`} className="text-sm">{n}</label>
                  </div>
                ))}
              </div>
              <CTAButton disabled={ocupado} className="mt-4 h-10 px-5 py-2 text-sm" onClick={() => void rodar(async () => { const r = await terapia.agoraConfirmar(p.id, perm); if (r.consulta_id) { guardar(null); navigate(`/consulta/${r.consulta_id}`); } })}>Confirmar consulta</CTAButton>
              <Button variant="ghost" size="sm" className="ml-2" disabled={ocupado} onClick={() => void rodar(async () => { await terapia.agoraCancelar(p.id); guardar(null); })}>Desistir</Button>
            </>
          )}
        </div>
      ) : (
        <>
          {naoDeu && <p className="mt-4 rounded-lg border border-border p-3 text-sm">Agora não deu. Veja os próximos horários</p>}
          {a.online && !naoDeu && modo !== "agora" && (
            <CTAButton className="mt-4 h-11 w-full px-5 py-2 text-base" onClick={() => setModo(logado ? "agora" : "entrar")}>Consulta agora</CTAButton>
          )}
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
          {marcada ? (
            <p className="mt-4 text-sm font-semibold">Consulta marcada para {new Date(marcada).toLocaleString("pt-BR", { weekday: "long", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" })}.</p>
          ) : dias.length > 0 ? (
            <div className="mt-5 space-y-3">
              <p className="text-xs font-semibold uppercase text-muted-foreground">Próximos horários</p>
              {dias.map(([d, hs]) => (
                <div key={d}>
                  <p className="mb-1.5 text-sm font-semibold capitalize">{d}</p>
                  <div className="flex flex-wrap gap-2">
                    {hs.map((h) => (
                      <Button key={h.inicio} variant="outline" size="sm" disabled={ocupado} onClick={() => { if (!logado) { setModo("entrar"); return; } if (window.confirm(`Marcar consulta ${d} às ${horaBR(h.inicio)}?`)) void rodar(async () => { await terapia.marcarPublico(terapeutaId, h.inicio); setMarcada(h.inicio); await agenda.refetch(); }); }}>{horaBR(h.inicio)}</Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">Sem horários livres nos próximos dias.</p>
          )}
        </>
      )}
    </section>
  );
}
