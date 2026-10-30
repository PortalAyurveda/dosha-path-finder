import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import CTAButton from '@/components/CTAButton';
import { meu } from '@/lib/terapiaMeu';
import { pedidos, quandoPedido, type AcaoPedido, type PedidoTerapeuta } from '@/lib/terapiaPedidos';
import { Secao } from './Comuns';

function Responder({ p, fechar }: { p: PedidoTerapeuta; fechar: () => void }) {
  const qc = useQueryClient();
  const [acao, setAcao] = useState<AcaoPedido>('confirmar');
  const [inicio, setInicio] = useState('');
  const [texto, setTexto] = useState('');
  const [erro, setErro] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const horarios = useQuery({ queryKey: ['acomp-horarios', p.terapeuta.id], queryFn: () => meu.horarios(p.terapeuta.id), enabled: acao === 'sugerir' });
  const enviar = async () => {
    setOcupado(true); setErro('');
    try { await pedidos.responder(p.id, acao, acao === 'sugerir' ? inicio : undefined, texto); await Promise.all([qc.invalidateQueries({ queryKey: ['terapia-pedidos'] }), qc.invalidateQueries({ queryKey: ['terapia-hoje'] })]); fechar(); }
    catch (e) { setErro(e instanceof Error ? e.message : String(e)); } finally { setOcupado(false); }
  };
  return <Dialog open onOpenChange={v => { if (!v) fechar(); }}><DialogContent className="max-h-[88dvh] overflow-y-auto">
    <DialogTitle>Pedido de {p.nome}</DialogTitle>
    <DialogDescription>{quandoPedido(p.inicio)}</DialogDescription>
    <div className="flex flex-wrap gap-2" role="group" aria-label="Resposta">
      {([['confirmar','Confirmar'],['sugerir','Sugerir outro horário'],['recusar','Recusar']] as const).filter(([k]) => k !== 'confirmar' || p.status === 'aguardando').map(([k, t]) => <Button key={k} variant={acao === k ? 'secondary' : 'outline'} aria-pressed={acao === k} onClick={() => setAcao(k)}>{t}</Button>)}
    </div>
    {acao === 'sugerir' && (horarios.isLoading ? <p className="text-sm">Carregando horários…</p> : !horarios.data?.length ? <p className="text-sm text-muted-foreground">Sem horários livres. Abra horários na agenda.</p> : <div className="flex max-h-56 flex-wrap gap-2 overflow-y-auto">{horarios.data.map(h => <Button key={h.inicio} size="sm" variant={inicio === h.inicio ? 'secondary' : 'outline'} onClick={() => setInicio(h.inicio)}>{quandoPedido(h.inicio)}</Button>)}</div>)}
    <label className="block text-sm">Uma frase para {p.nome.split(' ')[0]} (opcional)<Textarea value={texto} onChange={e => setTexto(e.target.value)} className="mt-1" /></label>
    {erro && <p role="alert" className="text-sm text-destructive">{erro}</p>}
    <CTAButton data-terapia-principal disabled={ocupado || (acao === 'sugerir' && !inicio)} className="h-11 px-4 py-2 text-sm" onClick={() => void enviar()}>{acao === 'confirmar' ? 'Confirmar consulta' : acao === 'sugerir' ? 'Enviar sugestão' : 'Recusar pedido'}</CTAButton>
  </DialogContent></Dialog>;
}

export default function PedidosConsulta() {
  const q = useQuery({ queryKey: ['terapia-pedidos'], queryFn: pedidos.daTerapeuta, refetchInterval: 120000 });
  const [aberto, setAberto] = useState<PedidoTerapeuta | null>(null);
  const lista = q.data ?? [];
  if (!lista.length) return null;
  return <Secao titulo="Pedidos de consulta">
    <span className="portal-atencao-num">{lista.length}</span>
    {lista.map(p => {
      const d = p.dados ?? {};
      const partes = [p.motivo ? `“${p.motivo}”` : null, d.tem_teste ? 'teste feito' : null, d.fotos ? `${d.fotos} ${d.fotos === 1 ? 'foto' : 'fotos'}` : null, d.tem_nascimento ? 'nascimento' : null].filter(Boolean);
      return <article key={p.id} className="border-b border-border py-3">
        <p className="text-sm font-semibold">{p.status === 'sugerida' ? `Você sugeriu ${quandoPedido(p.sugerido_inicio ?? p.inicio)} para ${p.nome}` : `${p.nome} quer consulta ${quandoPedido(p.inicio)}`}</p>
        <p className="text-xs text-muted-foreground">{p.status === 'sugerida' ? 'Esperando a resposta dela' : 'Já preencheu os dados'}{partes.length ? ` · ${partes.join(' · ')}` : ''}{p.status === 'aguardando' && (p.horas_esperando ?? 0) >= 24 ? ` · esperando há ${p.horas_esperando} horas` : ''}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {p.status === 'aguardando' && <Button size="sm" variant="secondary" onClick={() => setAberto(p)}>Responder</Button>}
          {p.status === 'sugerida' && <Button size="sm" variant="outline" onClick={() => setAberto(p)}>Mudar resposta</Button>}
          <Button asChild size="sm" variant="outline"><Link to={`/painel-terapeuta/paciente/${p.paciente_id}`}>Ver os dados</Link></Button>
        </div>
      </article>;
    })}
    {aberto && <Responder p={aberto} fechar={() => setAberto(null)} />}
  </Secao>;
}
