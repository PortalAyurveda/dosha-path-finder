import { useEffect, useState } from 'react';
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import CTAButton from '@/components/CTAButton';
import { useSouTerapeuta } from '@/hooks/useSouTerapeuta';
import { useToast } from '@/hooks/use-toast';
import { terapia, diaBR, horaBR } from '@/lib/terapia';
import { proximaConsulta, salaPacienteAberta } from '@/lib/terapiaPaciente';
import { AvatarPessoa } from '@/components/terapia/Comuns';
import PacienteResumo from '@/components/terapia/PacienteResumo';
import PacienteConsultas from '@/components/terapia/PacienteConsultas';
import PacienteFotos from '@/components/terapia/PacienteFotos';
import PacienteEvolucao from '@/components/terapia/PacienteEvolucao';
import PacienteAnotacoes from '@/components/terapia/PacienteAnotacoes';
import PacienteRotina from '@/components/terapia/PacienteRotina';
import PacienteMarcar from '@/components/terapia/PacienteMarcar';
import { TituloPaciente, Trancado } from '@/components/terapia/PacienteComuns';
import '@/components/terapia/paciente.css';
const abas = [['resumo','Resumo'],['consultas','Consultas'],['fotos','Fotos'],['evolucao','Evolução'],['anotacoes','Anotações'],['rotina','Rotina'],['akasha','Akasha']];
export default function PacienteTerapeuta() {
  const { id } = useParams(); const acesso = useSouTerapeuta(); const qc = useQueryClient(); const { toast } = useToast();
  const [params, setParams] = useSearchParams(); const escolha = params.get('aba') ?? 'resumo'; const aba = abas.some(([v]) => v === escolha) ? escolha : 'resumo';
  const [marcar, setMarcar] = useState(false); const [agora, setAgora] = useState(Date.now());
  useEffect(() => { const timer = setInterval(() => setAgora(Date.now()), 1000); return () => clearInterval(timer); }, []);
  const ficha = useQuery({ queryKey: ['paciente-ficha', acesso.userId, id], queryFn: () => { if (!id) throw new Error('Paciente não encontrado.'); return terapia.ficha(id); }, enabled: acesso.permitido && !!id, retry: false });
  const fotos = useQuery({ queryKey: ['paciente-fotos', acesso.userId, id], queryFn: () => { if (!id) throw new Error('Paciente não encontrado.'); return terapia.fotosPaciente(id); }, enabled: !!ficha.data && aba === 'fotos' && ficha.data.permissoes.fotos });
  const rotina = useQuery({ queryKey: ['paciente-rotina', acesso.userId, id], queryFn: () => { if (!id) throw new Error('Paciente não encontrado.'); return terapia.rotinaPaciente(id); }, enabled: !!ficha.data && aba === 'rotina' && ficha.data.permissoes.rotina });
  const executar = async (fn: () => Promise<unknown>) => { try { await fn(); await Promise.all([qc.invalidateQueries({ queryKey: ['paciente-ficha', acesso.userId, id] }), qc.invalidateQueries({ queryKey: ['terapia-pacientes', acesso.userId] }), qc.invalidateQueries({ queryKey: ['terapia-hoje', acesso.userId] }), qc.invalidateQueries({ queryKey: ['terapia-semana'] })]); return true; } catch(e) { toast({ title: e instanceof Error ? e.message : String(e), variant: 'destructive' }); return false; } };
  if (acesso.carregando || (acesso.permitido && ficha.isPending)) return <main className="mx-auto max-w-6xl p-8" role="status">Carregando…</main>;
  if (!acesso.permitido && !acesso.error) return <Navigate to="/" replace />;
  if (!ficha.data) return <main className="mx-auto max-w-6xl space-y-5 p-6"><p role="alert">{acesso.error?.message ?? ficha.error?.message ?? 'Paciente não encontrado.'}</p><Button variant="outline" asChild><Link to="/painel-terapeuta?aba=pacientes">Voltar para Pacientes</Link></Button></main>;
  const dados = ficha.data; const proxima = proximaConsulta(dados.consultas, agora);
  return <><Helmet><title>Paciente | Portal do terapeuta | Portal Ayurveda</title><meta name="robots" content="noindex, nofollow" /></Helmet><main className="portal-paciente min-h-[70dvh] w-full px-4 py-6 sm:px-6">
    <header className="border-b border-border pb-5"><Button variant="link" asChild className="mb-4 h-auto p-0 text-sm text-muted-foreground"><Link to="/painel-terapeuta?aba=pacientes">← Pacientes</Link></Button><div className="flex items-center gap-4"><AvatarPessoa nome={dados.nome} id={dados.paciente_id} grande/><div className="min-w-0"><h1 className="break-words font-serif text-2xl font-bold text-primary">{dados.nome}</h1><p className="mt-1 text-xs leading-relaxed text-muted-foreground">{[dados.permissoes.teste && dados.teste?.idade != null ? `${dados.teste.idade} anos` : null, dados.permissoes.teste ? [dados.teste?.cidade, dados.teste?.estado].filter(Boolean).join('/') : null, `com você desde ${diaBR(dados.ligado_em)}, ${['agenda','lista'].includes(dados.origem) ? 'Marcou pela sua agenda' : 'pelo seu link'}`].filter(Boolean).join(' · ')}</p><div className="mt-2 flex flex-wrap items-center gap-2"><span className="text-xs text-muted-foreground">Ela deixa ver:</span>{(['teste','fotos','rotina','akasha'] as const).map(p => <span key={p} className={`rounded bg-muted px-2 py-0.5 text-xs ${dados.permissoes[p] ? '' : 'text-muted-foreground line-through'}`}>{p === 'akasha' ? 'Akasha' : p}</span>)}</div></div></div><div className="mt-4 flex flex-wrap gap-2">{proxima && (salaPacienteAberta(proxima, agora) ? <CTAButton to={`/consulta/${proxima.id}`} className="h-10 px-4 py-2 text-sm">Entrar na sala</CTAButton> : <Button variant="outline" disabled className="text-sm">Sala: {diaBR(proxima.inicio)} · {horaBR(proxima.inicio)}</Button>)}<CTAButton className="h-10 px-4 py-2 text-sm" onClick={() => setMarcar(true)}>Marcar consulta</CTAButton><CTAButton data-terapia-principal to={`/painel-terapeuta/paciente/${dados.paciente_id}/avaliacao/nova`} className="h-10 px-4 py-2 text-sm">Nova avaliação</CTAButton><CTAButton to={`/painel-terapeuta/paciente/${dados.paciente_id}/indicacoes/nova`} className="h-10 px-4 py-2 text-sm">Montar indicações</CTAButton></div></header>
    <nav aria-label="Ficha da paciente" className="mb-6 flex overflow-x-auto border-b border-border">{abas.map(([v,l]) => <Button key={v} variant="ghost" aria-current={v === aba ? 'page' : undefined} className={`h-12 shrink-0 rounded-none border-b-2 px-4 text-sm hover:bg-secondary/10 ${v === aba ? 'border-secondary bg-secondary/5 font-semibold' : 'border-transparent text-muted-foreground'}`} onClick={() => setParams({ aba: v })}>{l}</Button>)}</nav>
    {aba === 'resumo' && <PacienteResumo ficha={dados} userId={acesso.userId} />}
    {aba === 'consultas' && <PacienteConsultas ficha={dados} userId={acesso.userId} agora={agora} />}
    {aba === 'fotos' && (!dados.permissoes.fotos ? <Trancado nome={dados.nome} assunto="as fotos" /> : fotos.data ? <PacienteFotos dados={fotos.data} nome={dados.nome} paciente={dados.paciente_id} /> : <p role={fotos.error ? 'alert' : 'status'}>{fotos.error?.message ?? 'Carregando fotos…'}</p>)}
    {aba === 'evolucao' && <PacienteEvolucao ficha={dados} />}
    {aba === 'anotacoes' && <PacienteAnotacoes key={id} paciente={dados.paciente_id} notas={dados.notas} executar={executar} />}
    {aba === 'rotina' && (!dados.permissoes.rotina ? <Trancado nome={dados.nome} assunto="a rotina" /> : rotina.data ? <PacienteRotina dados={rotina.data} nome={dados.nome} /> : <p role={rotina.error ? 'alert' : 'status'}>{rotina.error?.message ?? 'Carregando rotina…'}</p>)}
    {aba === 'akasha' && (!dados.permissoes.akasha ? <Trancado nome={dados.nome} assunto="as conversas com a Akasha" /> : <section><TituloPaciente>Akasha</TituloPaciente><div className="divide-y divide-border">{(dados.akasha ?? []).map((a,i) => <article key={`${a.data}-${i}`} className="py-4"><p className="text-xs text-muted-foreground">{diaBR(a.data)}</p><h3 className="my-2 text-base font-semibold">{a.titulo}</h3><p className="whitespace-pre-wrap text-sm leading-relaxed">{a.resumo}</p></article>)}</div>{!dados.akasha?.length && <p className="text-sm text-muted-foreground">Nenhuma conversa disponível.</p>}</section>)}
  </main>{marcar && <PacienteMarcar paciente={dados.paciente_id} nome={dados.nome} userId={acesso.userId} fechar={() => setMarcar(false)} executar={async fn => { const ok = await executar(fn); if (ok) toast({ title: 'Consulta marcada com sucesso.' }); return ok; }} />}</>;
}