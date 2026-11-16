import { useEffect, useState } from 'react';
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import CTAButton from '@/components/CTAButton';
import { useSouTerapeuta } from '@/hooks/useSouTerapeuta';
import { useToast } from '@/hooks/use-toast';
import { terapia, diaBR } from '@/lib/terapia';
import { proximaConsulta } from '@/lib/terapiaPaciente';
import { AvatarPessoa } from '@/components/terapia/Comuns';
import PessoaFicha from '@/components/terapia/PessoaFicha';
import PessoaConsultas from '@/components/terapia/PessoaConsultas';
import PessoaConversa from '@/components/terapia/PessoaConversa';
import { abaPessoa, abaPessoaNova, momentoPessoa, linhaHistorico, ddmm } from '@/lib/terapiaPessoa';
import { horaBR } from '@/lib/terapia';
import { pedidos, quandoPedido } from '@/lib/terapiaPedidos';
import { Responder, useConfirmarPedido } from '@/components/terapia/PedidosConsulta';
import PacienteFotos from '@/components/terapia/PacienteFotos';
import PacienteMarcar from '@/components/terapia/PacienteMarcar';
import { Trancado } from '@/components/terapia/PacienteComuns';
import '@/components/terapia/paciente.css';
const abas = [['consultas','Consultas e folhas'],['mandou','O que a pessoa mandou']] as const;
export default function PacienteTerapeuta() {
  const { id } = useParams(); const acesso = useSouTerapeuta(); const qc = useQueryClient(); const { toast } = useToast();
  const [params, setParams] = useSearchParams(); const { cartao } = abaPessoa(params.get('aba')); const conversa = params.get('aba') === 'conversa'; const aba = abaPessoaNova(params.get('aba'));
  const [outra, setOutra] = useState(false); const conf = useConfirmarPedido();
  const listaPedidos = useQuery({ queryKey: ['terapia-pedidos'], queryFn: pedidos.daTerapeuta, enabled: acesso.permitido, refetchInterval: 120000 });
  const [marcar, setMarcar] = useState(false); const [agora, setAgora] = useState(Date.now());
  useEffect(() => { const timer = setInterval(() => setAgora(Date.now()), 1000); return () => clearInterval(timer); }, []);
  const ficha = useQuery({ queryKey: ['paciente-ficha', acesso.userId, id], queryFn: () => { if (!id) throw new Error('Paciente não encontrado.'); return terapia.ficha(id); }, enabled: acesso.permitido && !!id, retry: false });
  const fotos = useQuery({ queryKey: ['paciente-fotos', acesso.userId, id], queryFn: () => { if (!id) throw new Error('Paciente não encontrado.'); return terapia.fotosPaciente(id); }, enabled: !!ficha.data && aba === 'mandou' && ficha.data.permissoes.fotos });
  const folhas = useQuery({ queryKey: ['indicacoes-lista', acesso.userId, id], queryFn: () => terapia.folhasDa(id!), enabled: !!ficha.data, retry: false });
  const executar = async (fn: () => Promise<unknown>) => { try { await fn(); await Promise.all([qc.invalidateQueries({ queryKey: ['paciente-ficha', acesso.userId, id] }), qc.invalidateQueries({ queryKey: ['terapia-pacientes', acesso.userId] }), qc.invalidateQueries({ queryKey: ['terapia-hoje', acesso.userId] }), qc.invalidateQueries({ queryKey: ['terapia-semana'] })]); return true; } catch(e) { toast({ title: e instanceof Error ? e.message : String(e), variant: 'destructive' }); return false; } };
  if (acesso.carregando || (acesso.permitido && ficha.isPending)) return <main className="mx-auto max-w-6xl p-8" role="status">Carregando…</main>;
  if (!acesso.permitido && !acesso.error) return <Navigate to="/" replace />;
  if (!ficha.data) return <main className="mx-auto max-w-6xl space-y-5 p-6"><p role="alert">{acesso.error?.message ?? ficha.error?.message ?? 'Paciente não encontrado.'}</p><Button variant="outline" asChild><Link to="/painel-terapeuta?aba=pacientes">Voltar para Pessoas</Link></Button></main>;
  const dados = ficha.data; const primeiro = dados.nome.split(' ')[0];
  const pedido = (listaPedidos.data ?? []).find(p => p.paciente_id === dados.paciente_id && p.status === 'aguardando');
  const m = momentoPessoa(dados.consultas, folhas.data ?? [], pedido, agora);
  const t = dados.permissoes.teste ? dados.teste : null;
  const base = `/painel-terapeuta/paciente/${dados.paciente_id}`;
  const aviso = m.tipo === 'pedido' ? `Pedido de consulta: ${quandoPedido(m.inicio)}` : m.tipo === 'marcada' ? `Próxima consulta: ${quandoPedido(m.inicio)}` : m.tipo === 'agora' ? `Consulta agora, ${horaBR(m.inicio)}. A sala está aberta.` : m.tipo === 'sem_folha' ? `Aguardando folha da consulta de ${diaBR(m.inicio)}` : m.tipo === 'folha' ? `Folha enviada em ${ddmm(m.enviada_em)}${m.vista_em ? ` · ${primeiro} viu em ${ddmm(m.vista_em)}` : ''}` : null;
  const cta = 'h-11 px-4 py-2 text-sm';
  const principal = m.tipo === 'pedido' ? <><CTAButton data-terapia-principal className={cta} disabled={!!conf.ocupado} onClick={() => void conf.confirmar(m.pedido)}>{conf.ocupado ? 'Confirmando…' : 'Confirmar consulta'}</CTAButton><Button variant="ghost" className="h-11 text-sm" onClick={() => setOutra(true)}>Outra resposta</Button></>
    : m.tipo === 'marcada' ? <CTAButton data-terapia-principal className={cta} onClick={() => setParams({ aba: 'mandou' })}>Ver o que {primeiro} mandou</CTAButton>
    : m.tipo === 'agora' ? <CTAButton data-terapia-principal to={`/consulta/${m.consulta}`} className={cta}>Entrar na sala</CTAButton>
    : m.tipo === 'sem_folha' ? <CTAButton data-terapia-principal to={`${base}/indicacoes/nova?consulta=${m.consulta}`} className={cta}>Montar indicações de {primeiro}</CTAButton>
    : <><CTAButton data-terapia-principal className={cta} onClick={() => setMarcar(true)}>Marcar consulta</CTAButton>{m.tipo === 'folha' && <Button variant="ghost" asChild className="h-11 text-sm"><Link to={`${base}/indicacoes/${m.folha}`}>Abrir folha</Link></Button>}</>;
  return <><Helmet><title>Pessoa | Portal do terapeuta | Portal Ayurveda</title><meta name="robots" content="noindex, nofollow" /></Helmet><main className="portal-paciente min-h-[70dvh] w-full px-4 py-6 sm:px-6">
    <Button variant="link" asChild className="mb-4 h-auto p-0 text-sm text-muted-foreground"><Link to="/painel-terapeuta?aba=pacientes">← Pessoas</Link></Button>
    <header className="pessoa-resumo mb-6 flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 sm:p-5 md:flex-row md:items-start md:justify-between" data-testid="pessoa-resumo">
      <div className="flex min-w-0 items-start gap-4"><AvatarPessoa nome={dados.nome} id={dados.paciente_id} grande/><div className="min-w-0 space-y-1">
        <h1 className="break-words font-serif text-2xl font-bold text-primary">{dados.nome}</h1>
        <p className="text-sm text-muted-foreground">{[t?.idade != null ? `${t.idade} anos` : null, [t?.cidade, t?.estado].filter(Boolean).join('/') || null].filter(Boolean).join(' · ')}</p>
        {t && <p className="text-sm"><span className="font-semibold text-vata">Vata {t.vata ?? 0}</span> · <span className="font-semibold text-pitta">Pitta {t.pitta ?? 0}</span> · <span className="font-semibold text-kapha">Kapha {t.kapha ?? 0}</span>{t.agni ? ` · Agni ${t.agni}` : ''}</p>}
        {t?.objetivo1 && <p className="text-sm">Objetivo: {t.objetivo1}</p>}
        <p className="text-sm text-muted-foreground">{linhaHistorico(dados.ligado_em, dados.consultas, folhas.data ?? [], agora)}</p>
        {aviso && <p className="text-sm font-semibold text-secondary" role="status">{aviso}</p>}
      </div></div>
      <div className="flex shrink-0 flex-col gap-2 md:items-end"><div className="flex flex-wrap gap-2">{principal}</div>{m.tipo === 'marcada' && <p className="text-xs text-muted-foreground">A sala abre 10 min antes</p>}{conf.erro && <p role="alert" className="text-xs text-destructive">{conf.erro}</p>}<Button variant="link" className="h-auto p-0 text-sm text-muted-foreground" onClick={() => setParams({ aba: 'conversa' })}>Mandar mensagem</Button></div>
    </header>
    {conversa ? <><Button variant="link" className="mb-3 h-auto p-0 text-sm" onClick={() => setParams({})}>← Voltar</Button><PessoaConversa paciente={dados.paciente_id} userId={acesso.userId} /></> : <>
    <nav aria-label="Ficha da paciente" className="mb-6 flex overflow-x-auto border-b border-border">{abas.map(([v,l]) => <Button key={v} variant="ghost" aria-current={v === aba ? 'page' : undefined} className={`h-12 shrink-0 rounded-none border-b-2 px-4 text-sm hover:bg-secondary/10 ${v === aba ? 'border-secondary bg-secondary/5 font-semibold' : 'border-transparent text-muted-foreground'}`} onClick={() => setParams({ aba: v })}>{l}</Button>)}</nav>
    {aba === 'consultas' && <PessoaConsultas ficha={dados} userId={acesso.userId} agora={agora} executar={executar} />}
    {aba === 'mandou' && <div className="space-y-8"><PessoaFicha ficha={dados} userId={acesso.userId} cartao={cartao} /><section><h2 className="mb-3 font-serif text-lg font-bold text-primary">Fotos de língua e rosto</h2>{!dados.permissoes.fotos ? <Trancado nome={dados.nome} assunto="as fotos" /> : fotos.data ? <PacienteFotos dados={fotos.data} nome={dados.nome} paciente={dados.paciente_id} /> : <p role={fotos.error ? 'alert' : 'status'}>{fotos.error?.message ?? 'Carregando fotos…'}</p>}</section></div>}
    </>}
  </main>{outra && pedido && <Responder p={pedido} outra fechar={() => setOutra(false)} />}{marcar && <PacienteMarcar paciente={dados.paciente_id} nome={dados.nome} userId={acesso.userId} fechar={() => setMarcar(false)} executar={async fn => { const ok = await executar(fn); if (ok) toast({ title: 'Consulta marcada com sucesso.' }); return ok; }} />}</>;
}
