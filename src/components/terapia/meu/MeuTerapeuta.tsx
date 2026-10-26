import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useUser } from "@/contexts/UserContext";
import { terapia, diaBR, horaBR, dataBR, type MunicipioNascimento } from "@/lib/terapia";
import { meu, dataExtenso, salaLiberada, type MeuTerapeutaLigacao } from "@/lib/terapiaMeu";
import Nascimento from "./Nascimento";
import MeuTerapeutaFotos from "./MeuTerapeutaFotos";
import FolhasDoTerapeuta from "./FolhasDoTerapeuta";

const STATUS: Record<string, string> = { marcada: "Marcada", realizada: "Realizada", cancelada: "Cancelada", faltou: "Faltou" };
const Bloco = ({ titulo, children }: { titulo: string; children: React.ReactNode }) => (
  <section className="border-t border-border pt-5"><h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{titulo}</h3>{children}</section>
);

function Remarcar({ l, fechar, pronto }: { l: MeuTerapeutaLigacao; fechar: () => void; pronto: () => void }) {
  const q = useQuery({ queryKey: ["meu-horarios", l.terapeuta.id], queryFn: () => meu.horarios(l.terapeuta.id) });
  const [escolha, setEscolha] = useState(""); const [erro, setErro] = useState(""); const [ocupado, setOcupado] = useState(false);
  const dias = useMemo(() => { const m = new Map<string, { inicio: string }[]>(); (q.data ?? []).forEach(h => { const d = dataBR(h.inicio); m.set(d, [...(m.get(d) ?? []), h]); }); return [...m]; }, [q.data]);
  const confirmar = async () => { if (!l.proxima) return; setOcupado(true); setErro(""); try { await meu.remarcar(l.proxima.id, escolha); pronto(); } catch (e) { setErro((e as Error).message); } finally { setOcupado(false); } };
  return (
    <Dialog open onOpenChange={v => { if (!v) fechar(); }}>
      <DialogContent className="max-h-[85dvh] overflow-y-auto">
        <DialogTitle>Remarcar com {l.terapeuta.primeiro_nome}</DialogTitle>
        <DialogDescription>Escolha um novo horário nos próximos 14 dias.</DialogDescription>
        {q.isLoading ? <p role="status">Carregando horários…</p> : q.error ? <p role="alert" className="text-destructive">{q.error.message}</p> : !dias.length ? <p>Sem horários livres nos próximos 14 dias.</p> :
          <div className="space-y-4">{dias.map(([d, hs]) => <div key={d}><p className="mb-2 text-sm font-semibold capitalize">{new Date(`${d}T12:00:00`).toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "2-digit" })}</p><div className="flex flex-wrap gap-2">{hs.map(h => <Button key={h.inicio} size="sm" variant={escolha === h.inicio ? "secondary" : "outline"} onClick={() => setEscolha(h.inicio)}>{horaBR(h.inicio)}</Button>)}</div></div>)}</div>}
        {erro && <p role="alert" className="text-sm text-destructive">{erro}</p>}
        <div className="flex justify-end gap-2"><Button variant="outline" onClick={fechar}>Voltar</Button><Button variant="secondary" disabled={!escolha || ocupado} onClick={confirmar}>Confirmar novo horário</Button></div>
      </DialogContent>
    </Dialog>
  );
}


function Ligacao({ l }: { l: MeuTerapeutaLigacao }) {
  const qc = useQueryClient();
  const { doshaResult } = useUser();
  const recarregar = () => qc.invalidateQueries({ queryKey: ["meu-terapeuta"] });
  const [agora, setAgora] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setAgora(Date.now()), 30000); return () => clearInterval(t); }, []);
  const [remarcar, setRemarcar] = useState(false);
  const [motivo, setMotivo] = useState(l.proxima?.motivo ?? ""); const [motivoMsg, setMotivoMsg] = useState("");
  useEffect(() => setMotivo(l.proxima?.motivo ?? ""), [l.proxima?.id, l.proxima?.motivo]);
  const [fotos, setFotos] = useState(window.location.hash === '#meu-terapeuta-fotos');
  const [nasc, setNasc] = useState(false);
  const [folha, setFolha] = useState<string>("");
  const [perm, setPerm] = useState(l.permissoes); useEffect(() => setPerm(l.permissoes), [l.permissoes]);
  const [erro, setErro] = useState("");
  const nome = l.terapeuta.primeiro_nome;
  const p = l.proxima;
  const sala = salaLiberada(p, agora);
  const regra = typeof l.regras?.texto === "string" ? l.regras.texto : "";
  const fraseSala = typeof l.regras?.sala === "string" ? l.regras.sala : "O botão da sala aparece aqui 10 minutos antes da consulta.";
  const teste = doshaResult as { created_at?: string } | null;

  const cancelar = async () => { if (!p || !window.confirm(`Cancelar a consulta de ${dataExtenso(p.inicio)}?`)) return; setErro(""); try { await meu.cancelar(p.id); recarregar(); } catch (e) { setErro((e as Error).message); } };
  const salvarMotivo = async () => { if (!p || motivo === (p.motivo ?? "")) return; setMotivoMsg(""); try { await meu.motivo(p.id, motivo); setMotivoMsg(`Salvo às ${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`); recarregar(); } catch (e) { setMotivoMsg((e as Error).message); } };
  const mudarPerm = async (k: keyof typeof perm, v: boolean) => { const antes = perm; const novo = { ...perm, [k]: v }; setPerm(novo); setErro(""); try { await meu.permissoes(l.ligacao, novo); recarregar(); } catch (e) { setPerm(antes); setErro((e as Error).message); } };
  const desligar = async () => { if (!window.confirm(`Parar de ser acompanhada por ${l.terapeuta.nome}? Ela deixa de ver seus dados e suas próximas consultas são canceladas. Para voltar, será preciso um novo convite.`)) return; setErro(""); try { await meu.desligar(l.ligacao); recarregar(); } catch (e) { setErro((e as Error).message); } };

  return (
    <div id="meu-terapeuta-fotos" className="space-y-5 scroll-mt-24">
      <header className="flex flex-wrap items-center gap-4">
        {l.terapeuta.imagem ? <img src={l.terapeuta.imagem} alt="" className="h-16 w-16 rounded-t-full rounded-b-lg object-cover" /> : <span className="flex h-16 w-16 items-center justify-center rounded-t-full rounded-b-lg bg-secondary/15 font-serif text-xl font-bold text-secondary">{nome[0]}</span>}
        <div className="min-w-0 flex-1">
          <p className="font-serif text-lg font-bold text-primary">{l.terapeuta.nome}</p>
          {l.terapeuta.especialidade && <p className="text-sm text-muted-foreground">{l.terapeuta.especialidade}</p>}
          <Link to={`/terapeutas/${l.terapeuta.slug}`} className="text-sm font-semibold text-secondary underline-offset-2 hover:underline">Ver o perfil dela</Link>
        </div>
        <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold">● Ligada desde {diaBR(l.desde)}</span>
      </header>

      <Bloco titulo="Próxima consulta">
        {!p ? <p className="text-sm text-muted-foreground">Nenhuma consulta marcada.</p> : <div className="space-y-3">
          <p className="font-semibold capitalize">{dataExtenso(p.inicio)}</p>
          <p className="text-sm text-muted-foreground">Online, na sala do Portal · {Math.round((Date.parse(p.fim) - Date.parse(p.inicio)) / 60000)} min</p>
          {sala ? <div className="space-y-2"><Button asChild variant="secondary"><Link to={`/consulta/${p.id}`}>Entrar na sala</Link></Button><p className="text-xs text-muted-foreground">Use o Chrome ou o Safari para a chamada funcionar bem.</p></div>
            : p.pode_cancelar ? <div className="flex flex-wrap gap-2"><Button variant="outline" onClick={() => setRemarcar(true)}>Remarcar</Button><Button variant="outline" onClick={cancelar}>Cancelar</Button></div>
            : regra && <p className="text-sm text-muted-foreground">{regra}</p>}
          {!sala && <p className="text-xs text-muted-foreground">{fraseSala}</p>}
        </div>}
      </Bloco>

      {p && <Bloco titulo="Antes da consulta">
        <div className="space-y-4">
          <label className="block text-sm font-semibold">O que te traz a esta consulta?<Textarea className="mt-1 font-normal" rows={3} value={motivo} onChange={e => setMotivo(e.target.value)} onBlur={salvarMotivo} /></label>
          {motivoMsg && <p className="text-xs text-muted-foreground" role="status">{motivoMsg}</p>}
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border p-3"><span className="text-sm">Fotos para {nome} · {l.fotos_guiadas} de {l.fotos_total_guiadas} enviadas</span><Button size="sm" variant={l.fotos_guiadas < l.fotos_total_guiadas ? "secondary" : "outline"} onClick={() => setFotos(v => !v)}>{fotos ? "Fechar" : l.fotos_guiadas < l.fotos_total_guiadas ? "Enviar as que faltam" : "Ver fotos"}</Button></div>
          {fotos && <MeuTerapeutaFotos primeiroNome={nome} />}
          {l.pedir_nascimento && <div className="rounded-xl border border-border p-3"><div className="flex flex-wrap items-center justify-between gap-2"><span className="text-sm">Data, hora e cidade de nascimento</span>{l.tem_nascimento ? <span className="text-sm font-semibold text-secondary">✓ Feito</span> : <Button size="sm" variant="secondary" onClick={() => setNasc(v => !v)}>{nasc ? "Fechar" : "Preencher"}</Button>}</div>{nasc && !l.tem_nascimento && <div className="mt-3"><Nascimento pronto={() => { setNasc(false); recarregar(); }} /></div>}</div>}
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border p-3"><span className="text-sm">Teste de dosha</span>{teste ? <span className="text-sm font-semibold text-secondary">✓ Feito{teste.created_at ? ` em ${diaBR(teste.created_at)}` : ""}</span> : <Button asChild size="sm" variant="secondary"><Link to="/teste-de-dosha">Fazer o teste</Link></Button>}</div>
        </div>
      </Bloco>}

      {!p && <Bloco titulo={`Fotos para ${nome}`}>
        <Button size="sm" variant="secondary" onClick={() => setFotos(v => !v)}>{fotos ? "Fechar fotos" : "Ver fotos"}</Button>
        {fotos && <div className="mt-4"><MeuTerapeutaFotos primeiroNome={nome} /></div>}
      </Bloco>}

      <Bloco titulo={`Indicações de ${nome}`}>
        {!l.folhas.length ? <p className="text-sm text-muted-foreground">{nome} ainda não te enviou indicações.</p> : folha ? <div className="space-y-2"><Button size="sm" variant="ghost" onClick={() => setFolha("")}>← Fechar folha</Button><FolhasDoTerapeuta inicialId={folha} rodape={p ? `Dúvidas? Leve para a próxima consulta: ${dataExtenso(p.inicio)}.` : undefined} /></div>
          : <ul className="divide-y divide-border rounded-xl border border-border">{l.folhas.map(f => <li key={f.id} className="flex items-center justify-between gap-3 p-3 text-sm"><span>{diaBR(f.enviada_em)}{f.diagnostico ? ` · ${f.diagnostico.slice(0, 60)}` : ""}</span><Button size="sm" variant="outline" onClick={() => setFolha(f.id)}>Abrir</Button></li>)}</ul>}
      </Bloco>

      <Bloco titulo={`O que ${nome} vê`}>
        <div className="grid gap-2 sm:grid-cols-2">{([["teste", "Meu teste de dosha"], ["fotos", "Minhas fotos"], ["rotina", "Minha Rotina"], ["akasha", "Minhas conversas com a Akasha"]] as const).map(([k, t]) => <label key={k} className="flex items-center justify-between gap-3 rounded-xl border border-border p-3 text-sm">{t}<Switch checked={perm[k]} onCheckedChange={v => mudarPerm(k, v)} aria-label={t} className="data-[state=checked]:bg-secondary" /></label>)}</div>
      </Bloco>

      <Bloco titulo="Consultas">
        {!l.historico.length ? <p className="text-sm text-muted-foreground">Nenhuma consulta ainda.</p> : <ul className="space-y-1 text-sm">{l.historico.map(c => <li key={c.id} className="flex justify-between gap-3"><span>{diaBR(c.inicio)} · {horaBR(c.inicio)}</span><span className="text-muted-foreground">{STATUS[c.status] ?? c.status}</span></li>)}</ul>}
      </Bloco>

      {erro && <p role="alert" className="text-sm text-destructive">{erro}</p>}
      <div className="border-t border-border pt-4"><Button variant="ghost" className="text-destructive" onClick={desligar}>Parar de ser acompanhada</Button></div>
      {remarcar && <Remarcar l={l} fechar={() => setRemarcar(false)} pronto={() => { setRemarcar(false); recarregar(); }} />}
    </div>
  );
}

export default function MeuTerapeuta() {
  const q = useQuery({ queryKey: ["meu-terapeuta"], queryFn: meu.terapeuta });
  if (q.isLoading) return <p role="status" className="text-sm text-muted-foreground">Carregando…</p>;
  if (q.error) return <p role="alert" className="text-sm text-destructive">{q.error.message}</p>;
  if (!q.data?.length) return (
    <div className="space-y-3"><p className="text-sm leading-relaxed text-muted-foreground">Você ainda não está com um terapeuta no Portal. Se o seu terapeuta te mandou um link de convite, é só abrir o link.</p><Button asChild variant="secondary"><Link to="/terapeutas-do-brasil">Ver terapeutas do Brasil</Link></Button></div>
  );
  return <div className="space-y-10">{q.data.map(l => <Ligacao key={l.ligacao} l={l} />)}</div>;
}
