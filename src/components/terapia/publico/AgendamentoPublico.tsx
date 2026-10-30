import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, CalendarPlus, Check, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import CTAButton from '@/components/CTAButton';
import LoginForm from '@/components/auth/LoginForm';
import { useUser } from '@/contexts/UserContext';
import { dataBR, horaBR, type AgendaPublica } from '@/lib/terapia';
import { consultaICS } from '@/lib/terapiaPublica';
import { pedidos, quandoPedido, situacaoPedido, tempoRestante, type PedidoConsulta } from '@/lib/terapiaPedidos';
import Nascimento from '@/components/terapia/meu/Nascimento';
import type { PermissoesConvite } from '@/lib/terapiaConvite';
const Fotos = lazy(() => import('@/components/terapia/meu/MeuTerapeutaFotos'));

const PERMISSOES = [['teste','Meu teste de dosha'],['fotos','Minhas fotos'],['rotina','Minha rotina'],['akasha','Minhas conversas com a Akasha']] as const;

export default function AgendamentoPublico({ slug, nome, agenda, atualizar }: { slug: string; nome: string; agenda: AgendaPublica; atualizar: () => Promise<unknown> }) {
  const { user, isAnonymous, profile, loading } = useUser();
  const logado = !!user && !isAnonymous;
  const qc = useQueryClient();
  const chave = `agenda-escolha:${slug}`;
  const primeiro = nome.split(' ')[0];
  const [inicio, setInicio] = useState(() => sessionStorage.getItem(chave) ?? new URLSearchParams(window.location.search).get('horario') ?? '');
  const [pedido, setPedido] = useState<PedidoConsulta | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState('');
  const [motivo, setMotivo] = useState('');
  const [perm, setPerm] = useState<PermissoesConvite>({ teste: true, fotos: true, rotina: true, akasha: false });
  const [nascimento, setNascimento] = useState(false);
  const [salvoEm, setSalvoEm] = useState('');
  const [semana, setSemana] = useState(0);
  const [agora, setAgora] = useState(Date.now());
  const pedindo = useRef(false);
  const meu = useQuery({ queryKey: ['pedido-meu', user?.id, slug], queryFn: () => pedidos.meu(slug), enabled: logado });
  const eu = useQuery({ queryKey: ['meu-terapeuta', user?.id, slug], queryFn: async () => { const { meu } = await import('@/lib/terapiaMeu'); return meu.terapeuta(); }, enabled: logado && !!agenda.pedir_nascimento });
  const temNascimento = nascimento || !!eu.data?.find(l => l.terapeuta.slug === slug)?.tem_nascimento;
  useEffect(() => { const t = setInterval(() => setAgora(Date.now()), 15000); return () => clearInterval(t); }, []);
  const usar = (p: PedidoConsulta) => { setPedido(p); setInicio(p.inicio); setMotivo(p.motivo ?? ''); setPerm(p.permissoes); };
  // retoma pedido em andamento
  useEffect(() => { if (meu.data && !pedido) usar(meu.data); }, [meu.data, pedido]);
  // guarda o horário escolhido
  useEffect(() => {
    if (loading || !logado || !inicio || pedido || meu.isLoading || meu.data || pedindo.current) return;
    pedindo.current = true; setOcupado(true); setErro('');
    pedidos.solicitar(slug, inicio).then(p => { usar(p); void atualizar(); })
      .catch(e => { setErro(e.message); setInicio(''); sessionStorage.removeItem(chave); })
      .finally(() => { pedindo.current = false; setOcupado(false); });
  }, [loading, logado, inicio, pedido, meu.isLoading, meu.data, slug, chave, atualizar]);
  // salva o rascunho sozinho
  const ultimo = useRef('');
  useEffect(() => {
    if (!pedido || pedido.status !== 'preenchendo') return;
    const sinal = JSON.stringify([motivo, perm]);
    if (!ultimo.current) { ultimo.current = sinal; return; }
    if (sinal === ultimo.current) return;
    const t = setTimeout(() => { ultimo.current = sinal; pedidos.salvar(pedido.id, motivo, perm).then(() => setSalvoEm(horaBR(new Date().toISOString()))).catch(e => setErro(e.message)); }, 900);
    return () => clearTimeout(t);
  }, [motivo, perm, pedido]);
  const expirou = !!pedido && pedido.status === 'preenchendo' && Date.parse(pedido.guardado_ate) <= agora;
  const horarios = agenda.horarios ?? [];
  const dias = useMemo(() => {
    const grupos = new Map<string, typeof horarios>();
    const hoje = dataBR(new Date().toISOString());
    const limite = new Date(`${hoje}T12:00:00-03:00`).getTime() + (semana * 7) * 86400000;
    horarios.filter(h => { const d = Date.parse(`${dataBR(h.inicio)}T12:00:00-03:00`); return d >= limite && d < limite + 7 * 86400000; }).forEach(h => { const d = dataBR(h.inicio); grupos.set(d, [...(grupos.get(d) ?? []), h]); });
    return [...grupos];
  }, [horarios, semana]);
  const recomecar = async () => {
    setOcupado(true); setErro('');
    try { if (pedido && ['preenchendo','aguardando','sugerida'].includes(pedido.status)) await pedidos.cancelar(pedido.id); }
    catch (e) { setErro(e instanceof Error ? e.message : String(e)); }
    setPedido(null); setInicio(''); ultimo.current = ''; sessionStorage.removeItem(chave);
    await qc.invalidateQueries({ queryKey: ['pedido-meu'] }); await atualizar(); setOcupado(false);
  };
  const agir = async (f: () => Promise<PedidoConsulta>) => {
    setOcupado(true); setErro('');
    try { const p = await f(); setPedido(p); sessionStorage.removeItem(chave); await qc.invalidateQueries({ queryKey: ['pedido-meu'] }); qc.invalidateQueries({ queryKey: ['meu-terapeuta'] }); await atualizar(); }
    catch (e) { setErro(e instanceof Error ? e.message : String(e)); }
    finally { setOcupado(false); }
  };
  const baixar = () => {
    if (!pedido?.consulta_id) return;
    const url = URL.createObjectURL(new Blob([consultaICS({ consulta: pedido.consulta_id, inicio: pedido.inicio, fim: pedido.fim }, nome)], { type:'text/calendar;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = 'consulta-portal-ayurveda.ics'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const etapa = pedido && pedido.status !== 'preenchendo' ? 2 : inicio ? 1 : 0;
  const duracao = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / 60000);
  const falta = !!agenda.pedir_nascimento && !temNascimento;

  return <div className="mt-5 space-y-4">
    <ol aria-label="Etapas do agendamento" className="flex gap-2">{['Horário','Seus dados','Enviado'].map((t,i)=><li key={t} className={`flex-1 border-t-2 pt-2 text-xs ${i === etapa ? 'border-secondary font-semibold text-primary' : 'border-border text-muted-foreground'}`}>{i+1}. {t}</li>)}</ol>
    {erro && <p role="alert" className="text-sm text-destructive">{erro}</p>}
    {pedido && pedido.status === 'confirmada' ? <div className="space-y-3">
      <h3 className="flex items-center gap-2 font-serif text-lg font-bold"><Check className="h-5 w-5 text-secondary" />Consulta confirmada</h3>
      <p className="text-sm">Com {nome} · {quandoPedido(pedido.inicio)}</p>
      <p className="text-sm">O botão “Entrar na sala” aparece em Meu acompanhamento, 10 minutos antes.</p>
      <Button variant="outline" className="h-auto whitespace-normal" onClick={baixar}><CalendarPlus className="mr-2 h-4 w-4" />Pôr na agenda do celular</Button>
    </div> : pedido && pedido.status === 'aguardando' ? <div className="space-y-3">
      <h3 className="flex items-center gap-2 font-serif text-lg font-bold"><Clock className="h-5 w-5 text-secondary" />{situacaoPedido(pedido)}</h3>
      <p className="text-sm">Você pediu {quandoPedido(pedido.inicio)}. O horário fica guardado para você até a resposta.</p>
      <p className="text-sm text-muted-foreground">A resposta aparece em Meu acompanhamento.</p>
      <CTAButton to="/meu-acompanhamento" className="h-auto min-h-10 px-4 py-2 text-sm">Ir para Meu acompanhamento</CTAButton>
      <Button variant="ghost" disabled={ocupado} onClick={() => { if (window.confirm('Cancelar este pedido?')) void recomecar(); }}>Cancelar pedido</Button>
    </div> : pedido && pedido.status === 'sugerida' && pedido.sugerido_inicio ? <div className="space-y-3">
      <h3 className="font-serif text-lg font-bold">{situacaoPedido(pedido)}</h3>
      <p className="text-sm">Você pediu {quandoPedido(pedido.pedido_inicio)}.</p>
      <p className="text-base font-semibold">{primeiro} sugere: {quandoPedido(pedido.sugerido_inicio)}</p>
      {pedido.resposta_texto && <p className="whitespace-pre-line rounded-lg bg-muted p-3 text-sm">“{pedido.resposta_texto}”</p>}
      <div className="flex flex-wrap gap-2"><CTAButton data-terapia-principal disabled={ocupado} className="h-11 px-4 py-2 text-sm" onClick={() => void agir(() => pedidos.sugestao(pedido.id, true))}>Aceitar este horário</CTAButton><Button variant="outline" disabled={ocupado} onClick={() => void recomecar()}>Escolher outro</Button></div>
    </div> : inicio ? <div className="space-y-4">
      <p className="text-sm font-semibold">Com {nome} · {quandoPedido(inicio)}</p>
      {!logado ? <LoginForm embedded emailOnly redirectPath={`/terapeutas/${slug}?horario=${encodeURIComponent(inicio)}#agenda`} /> : !pedido ? <p className="text-sm text-muted-foreground">Guardando o horário…</p> : <>
        <p className="text-xs text-muted-foreground">{expirou ? 'O horário guardado venceu. Escolha um horário novamente.' : `Guardamos este horário para você por mais ${tempoRestante(pedido.guardado_ate, agora)}. Tudo o que você preencher fica salvo na sua conta.`}{salvoEm && !expirou ? ` Salvo às ${salvoEm}.` : ''}</p>
        <p className="text-sm">Você está como {profile?.nome || user?.email}</p>
        <label className="block text-sm font-semibold">O que te traz a esta consulta?<Textarea value={motivo} onChange={e=>setMotivo(e.target.value)} className="mt-1 font-normal" /></label>
        <div className="space-y-2"><p className="text-sm font-semibold">O que {primeiro} pode ver</p>{PERMISSOES.map(([k,t])=><label key={k} className="flex items-center gap-2 text-sm"><Checkbox checked={perm[k]} onCheckedChange={v=>setPerm(p=>({...p,[k]:v===true}))} />{t}</label>)}</div>
        {agenda.pedir_nascimento && <div><p className="mb-2 text-sm font-semibold">Data de nascimento</p>{temNascimento ? <p className="text-sm text-muted-foreground">✓ Feito</p> : <Nascimento pronto={()=>setNascimento(true)} />}</div>}
        {perm.fotos && <div><p className="mb-2 text-sm font-semibold">Suas fotos (pode tirar na hora ou escolher da galeria)</p><Suspense fallback={<p className="text-sm text-muted-foreground">Carregando…</p>}><Fotos primeiroNome={primeiro} /></Suspense></div>}
        <p className="text-xs text-muted-foreground">A consulta pode ser gravada localmente, no aparelho, com o consentimento de quem participa.</p>
        {agenda.regras?.texto && <p className="whitespace-pre-line text-xs text-muted-foreground">{agenda.regras.texto}</p>}
        {falta && <p className="text-xs text-muted-foreground">Falta a data de nascimento para enviar.</p>}
        <CTAButton data-terapia-principal disabled={ocupado || expirou || falta} className="h-11 px-4 py-2 text-sm" onClick={()=>void agir(() => pedidos.enviar(pedido.id, motivo, perm))}>Enviar pedido para {primeiro}</CTAButton>
      </>}
      <Button variant="ghost" disabled={ocupado} onClick={() => void recomecar()}>Voltar aos horários</Button>
    </div> : <>
      {pedido && ['recusada','expirada','cancelada'].includes(pedido.status) && <p className="text-sm text-muted-foreground">{situacaoPedido(pedido)}.</p>}
      <div className="flex items-center justify-between"><Button size="icon" variant="ghost" aria-label="Semana anterior" disabled={semana===0} onClick={()=>setSemana(0)}><ChevronLeft className="h-4 w-4" /></Button><p className="text-xs font-semibold">{semana===0 ? 'Próximos 7 dias' : 'Próxima semana'}</p><Button size="icon" variant="ghost" aria-label="Próxima semana" disabled={semana===1} onClick={()=>setSemana(1)}><ChevronRight className="h-4 w-4" /></Button></div>
      {!dias.length && <p className="text-sm text-muted-foreground">Sem horários livres nos próximos dias.</p>}
      <div className="agenda-publica-dias">{dias.map(([d,hs])=><div key={d}><p className="mb-2 text-sm font-semibold capitalize">{new Date(`${d}T12:00:00-03:00`).toLocaleDateString('pt-BR',{weekday:'short',day:'2-digit',month:'2-digit',timeZone:'America/Sao_Paulo'})}</p><div className="flex flex-wrap gap-2">{hs.map(h=><Button key={h.inicio} size="sm" variant="outline" aria-label={`Marcar ${quandoPedido(h.inicio)} (${duracao(h.inicio,h.fim)} min)`} onClick={()=>{setPedido(null);setInicio(h.inicio);sessionStorage.setItem(chave,h.inicio);}}>{horaBR(h.inicio)}</Button>)}</div></div>)}</div>
      <p className="text-xs text-muted-foreground">Toque num horário para marcar. Horários de Brasília. {primeiro} confirma o pedido.</p>
      <p className="text-xs"><Link to="/meu-acompanhamento" className="underline">Ver meus pedidos</Link></p>
    </>}
  </div>;
}
