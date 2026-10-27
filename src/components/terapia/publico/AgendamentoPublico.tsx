import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, CalendarPlus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import CTAButton from '@/components/CTAButton';
import LoginForm from '@/components/auth/LoginForm';
import { useUser } from '@/contexts/UserContext';
import { terapia, dataBR, horaBR, type AgendaPublica } from '@/lib/terapia';
import { consultaICS, RESERVA_MINUTOS, type ConsultaMarcada } from '@/lib/terapiaPublica';
import Nascimento from '@/components/terapia/meu/Nascimento';
import type { PermissoesConvite } from '@/lib/terapiaConvite';

export default function AgendamentoPublico({ slug, nome, agenda, atualizar }: { slug: string; nome: string; agenda: AgendaPublica; atualizar: () => Promise<unknown> }) {
  const { user, isAnonymous, profile, loading } = useUser();
  const logado = !!user && !isAnonymous;
  const chave = `agenda-escolha:${slug}`;
  const [inicio, setInicio] = useState(() => sessionStorage.getItem(chave) ?? new URLSearchParams(window.location.search).get('horario') ?? '');
  const [expira, setExpira] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState('');
  const [motivo, setMotivo] = useState('');
  const [perm, setPerm] = useState<PermissoesConvite>({ teste: true, fotos: true, rotina: true, akasha: false });
  const [nascimento, setNascimento] = useState(false);
  const [marcada, setMarcada] = useState<ConsultaMarcada>();
  const [semana, setSemana] = useState(0);
  const [agora, setAgora] = useState(Date.now());
  const reservando = useRef(false);
  const eu = useQuery({ queryKey: ['meu-terapeuta', user?.id, slug], queryFn: async () => { const { meu } = await import('@/lib/terapiaMeu'); return meu.terapeuta(); }, enabled: logado && !!agenda.pedir_nascimento });
  const temNascimento = nascimento || !!eu.data?.find(l => l.terapeuta.slug === slug)?.tem_nascimento;
  useEffect(() => { const t = setInterval(() => setAgora(Date.now()), 1000); return () => clearInterval(t); }, []);
  useEffect(() => {
    if (loading || !logado || !inicio || expira || marcada || reservando.current) return;
    reservando.current = true; setOcupado(true); setErro('');
    terapia.reservar(slug, inicio).then(setExpira).catch(e => { setErro(e.message); setInicio(''); sessionStorage.removeItem(chave); }).finally(() => { reservando.current = false; setOcupado(false); });
  }, [loading, logado, inicio, expira, marcada, slug, chave]);
  const expirou = !!expira && Date.parse(expira) <= agora;
  const horarios = agenda.horarios ?? [];
  const dias = useMemo(() => {
    const grupos = new Map<string, typeof horarios>();
    const hoje = dataBR(new Date().toISOString());
    const limite = new Date(`${hoje}T12:00:00-03:00`).getTime() + (semana * 7) * 86400000;
    horarios.filter(h => { const d = Date.parse(`${dataBR(h.inicio)}T12:00:00-03:00`); return d >= limite && d < limite + 7 * 86400000; }).forEach(h => { const d = dataBR(h.inicio); grupos.set(d, [...(grupos.get(d) ?? []), h]); });
    return [...grupos];
  }, [horarios, semana]);
  const escolhido = horarios.find(h => h.inicio === inicio);
  const quando = (s: string) => new Date(s).toLocaleString('pt-BR', { weekday:'long', day:'numeric', month:'long', hour:'2-digit', minute:'2-digit', timeZone:'America/Sao_Paulo' });
  const voltar = () => { setInicio(''); setExpira(''); setErro(''); sessionStorage.removeItem(chave); void atualizar(); };
  const confirmar = async () => {
    setOcupado(true); setErro('');
    try { const c = await terapia.marcarPublico(slug, inicio, motivo, perm); setMarcada(c); sessionStorage.removeItem(chave); await atualizar(); }
    catch (e) { setErro(e instanceof Error ? e.message : String(e)); }
    finally { setOcupado(false); }
  };
  const baixar = () => {
    if (!marcada) return;
    const url = URL.createObjectURL(new Blob([consultaICS(marcada, nome)], { type:'text/calendar;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = 'consulta-portal-ayurveda.ics'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return <div className="mt-5 space-y-4">
    <ol aria-label="Etapas do agendamento" className="flex gap-2">{['Horário','Confirmar','Pronto'].map((t,i)=><li key={t} className={`flex-1 border-t-2 pt-2 text-xs ${i === (marcada ? 2 : inicio ? 1 : 0) ? 'border-secondary font-semibold text-primary' : 'border-border text-muted-foreground'}`}>{i+1}. {t}</li>)}</ol>
    {erro && <p role="alert" className="text-sm text-destructive">{erro}</p>}
    {marcada ? <div className="space-y-3">
      <h3 className="flex items-center gap-2 font-serif text-lg font-bold"><Check className="h-5 w-5 text-secondary" />Consulta marcada</h3>
      <p className="text-sm">Com {nome} · {quando(marcada.inicio)}</p><p className="text-sm text-muted-foreground">Online, na sala do Portal · {Math.round((Date.parse(marcada.fim)-Date.parse(marcada.inicio))/60000)} min</p>
      <p className="text-sm">O botão “Entrar na sala” aparece em Meu acompanhamento, 10 minutos antes.</p>
      {agenda.regras?.texto && <p className="whitespace-pre-line text-xs text-muted-foreground">{agenda.regras.texto}</p>}
      <CTAButton to="/meu-acompanhamento?aba=fotos" className="h-auto min-h-10 px-4 py-2 text-sm">Enviar as fotos agora</CTAButton>
      <Button variant="outline" className="h-auto whitespace-normal" onClick={baixar}><CalendarPlus className="mr-2 h-4 w-4" />Pôr na agenda do celular</Button>
    </div> : inicio ? <div className="space-y-4">
      <p className="text-sm font-semibold">Com {nome} · {quando(inicio)}</p><p className="text-xs text-muted-foreground">Online, na sala do Portal{escolhido ? ` · ${Math.round((Date.parse(escolhido.fim)-Date.parse(inicio))/60000)} min` : ''}</p>
      {!logado ? <LoginForm embedded emailOnly redirectPath={`/terapeutas/${slug}?horario=${encodeURIComponent(inicio)}#agenda`} /> : <>
        <p className="text-xs text-muted-foreground">{expirou ? 'A reserva expirou. Escolha um horário novamente.' : `Seguramos este horário por ${RESERVA_MINUTOS} minutos`}</p>
        <p className="text-sm">Você está como {profile?.nome || user?.email}</p>
        <label className="block text-sm">O que te traz a esta consulta? (opcional)<Textarea value={motivo} onChange={e=>setMotivo(e.target.value)} className="mt-1" /></label>
        <div className="space-y-2"><p className="text-xs font-semibold">O que {nome} pode ver</p>{([['teste','Meu teste de dosha'],['fotos','Minhas fotos'],['rotina','Minha rotina'],['akasha','Minhas conversas com a Akasha']] as const).map(([k,t])=><label key={k} className="flex items-center gap-2 text-sm"><Checkbox checked={perm[k]} onCheckedChange={v=>setPerm(p=>({...p,[k]:v===true}))} />{t}</label>)}</div>
        {agenda.pedir_nascimento && <div><p className="mb-2 text-sm font-semibold">Data de nascimento</p>{temNascimento ? <p className="text-sm text-muted-foreground">✓ Feito</p> : <Nascimento pronto={()=>setNascimento(true)} />}</div>}
        <p className="text-xs text-muted-foreground">A consulta pode ser gravada localmente, no aparelho, com o consentimento de quem participa.</p>
        {agenda.regras?.texto && <p className="whitespace-pre-line text-xs text-muted-foreground">{agenda.regras.texto}</p>}
        <CTAButton data-terapia-principal disabled={ocupado || !expira || expirou || (!!agenda.pedir_nascimento && !temNascimento)} className="h-11 px-4 py-2 text-sm" onClick={()=>void confirmar()}>Confirmar consulta</CTAButton>
      </>}
      <Button variant="ghost" disabled={ocupado} onClick={voltar}>Voltar aos horários</Button>
    </div> : <>
      <div className="flex items-center justify-between"><Button size="icon" variant="ghost" aria-label="Semana anterior" disabled={semana===0} onClick={()=>setSemana(0)}><ChevronLeft className="h-4 w-4" /></Button><p className="text-xs font-semibold">{semana===0 ? 'Próximos 7 dias' : 'Próxima semana'}</p><Button size="icon" variant="ghost" aria-label="Próxima semana" disabled={semana===1} onClick={()=>setSemana(1)}><ChevronRight className="h-4 w-4" /></Button></div>
      {!dias.length && <p className="text-sm text-muted-foreground">Sem horários livres nos próximos dias.</p>}
      <div className="agenda-publica-dias">{dias.map(([d,hs])=><div key={d}><p className="mb-2 text-sm font-semibold capitalize">{new Date(`${d}T12:00:00-03:00`).toLocaleDateString('pt-BR',{weekday:'short',day:'2-digit',month:'2-digit',timeZone:'America/Sao_Paulo'})}</p><div className="flex flex-wrap gap-2">{hs.map(h=><Button key={h.inicio} size="sm" variant="outline" onClick={()=>{setInicio(h.inicio);sessionStorage.setItem(chave,h.inicio);}}>{horaBR(h.inicio)}</Button>)}</div></div>)}</div><p className="text-xs text-muted-foreground">Horários de Brasília. A consulta acontece aqui no Portal.</p><Button data-terapia-principal variant="secondary" disabled className="w-full">Marcar consulta</Button>
    </>}
  </div>;
}