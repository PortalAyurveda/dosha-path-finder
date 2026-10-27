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
import { abaPessoa, botaoPrincipal, quandoConsulta } from '@/lib/terapiaPessoa';
import PacienteFotos from '@/components/terapia/PacienteFotos';
import PacienteMarcar from '@/components/terapia/PacienteMarcar';
import { Trancado } from '@/components/terapia/PacienteComuns';
import '@/components/terapia/paciente.css';
const abas = [['ficha','Ficha'],['consultas','Consultas'],['fotos','Fotos'],['conversa','Conversa']] as const;
export default function PacienteTerapeuta() {
  const { id } = useParams(); const acesso = useSouTerapeuta(); const qc = useQueryClient(); const { toast } = useToast();
  const [params, setParams] = useSearchParams(); const { aba, cartao } = abaPessoa(params.get('aba'));
  const [marcar, setMarcar] = useState(false); const [agora, setAgora] = useState(Date.now());
  useEffect(() => { const timer = setInterval(() => setAgora(Date.now()), 1000); return () => clearInterval(timer); }, []);
  const ficha = useQuery({ queryKey: ['paciente-ficha', acesso.userId, id], queryFn: () => { if (!id) throw new Error('Paciente não encontrado.'); return terapia.ficha(id); }, enabled: acesso.permitido && !!id, retry: false });
  const fotos = useQuery({ queryKey: ['paciente-fotos', acesso.userId, id], queryFn: () => { if (!id) throw new Error('Paciente não encontrado.'); return terapia.fotosPaciente(id); }, enabled: !!ficha.data && aba === 'fotos' && ficha.data.permissoes.fotos });
  const folhas = useQuery({ queryKey: ['indicacoes-lista', acesso.userId, id], queryFn: () => terapia.folhasDa(id!), enabled: !!ficha.data, retry: false });
  const executar = async (fn: () => Promise<unknown>) => { try { await fn(); await Promise.all([qc.invalidateQueries({ queryKey: ['paciente-ficha', acesso.userId, id] }), qc.invalidateQueries({ queryKey: ['terapia-pacientes', acesso.userId] }), qc.invalidateQueries({ queryKey: ['terapia-hoje', acesso.userId] }), qc.invalidateQueries({ queryKey: ['terapia-semana'] })]); return true; } catch(e) { toast({ title: e instanceof Error ? e.message : String(e), variant: 'destructive' }); return false; } };
  if (acesso.carregando || (acesso.permitido && ficha.isPending)) return <main className="mx-auto max-w-6xl p-8" role="status">Carregando…</main>;
  if (!acesso.permitido && !acesso.error) return <Navigate to="/" replace />;
  if (!ficha.data) return <main className="mx-auto max-w-6xl space-y-5 p-6"><p role="alert">{acesso.error?.message ?? ficha.error?.message ?? 'Paciente não encontrado.'}</p><Button variant="outline" asChild><Link to="/painel-terapeuta?aba=pacientes">Voltar para Pessoas</Link></Button></main>;
  const dados = ficha.data; const proxima = proximaConsulta(dados.consultas, agora); const principal = botaoPrincipal(dados.consultas, folhas.data ?? [], agora);
  return <><Helmet><title>Pessoa | Portal do terapeuta | Portal Ayurveda</title><meta name="robots" content="noindex, nofollow" /></Helmet><main className="portal-paciente min-h-[70dvh] w-full px-4 py-6 sm:px-6">
    <header className="mb-2 pb-3"><Button variant="link" asChild className="mb-4 h-auto p-0 text-sm text-muted-foreground"><Link to="/painel-terapeuta?aba=pacientes">← Pessoas</Link></Button><div className="flex flex-wrap items-start justify-between gap-4"><div className="flex items-center gap-4"><AvatarPessoa nome={dados.nome} id={dados.paciente_id} grande/><div className="min-w-0"><h1 className="break-words font-serif text-2xl font-bold text-primary">{dados.nome}</h1><p className="mt-1 text-sm leading-relaxed text-muted-foreground">{[dados.permissoes.teste && dados.teste?.idade != null ? `${dados.teste.idade} anos` : null, dados.permissoes.teste ? [dados.teste?.cidade, dados.teste?.estado].filter(Boolean).join('/') || null : null, `com você desde ${diaBR(dados.ligado_em)}`, proxima ? `próxima consulta: ${quandoConsulta(proxima.inicio, agora)}` : 'sem consulta marcada'].filter(Boolean).join(' · ')}</p></div></div><div className="flex flex-wrap gap-2">{principal.tipo === 'sala' ? <CTAButton data-terapia-principal to={`/consulta/${principal.consulta}`} className="h-10 px-4 py-2 text-sm">Entrar na sala</CTAButton> : principal.tipo === 'indicacoes' ? <CTAButton data-terapia-principal to={`/painel-terapeuta/paciente/${dados.paciente_id}/indicacoes/nova?consulta=${principal.consulta}`} className="h-10 px-4 py-2 text-sm">Montar indicações</CTAButton> : <CTAButton data-terapia-principal className="h-10 px-4 py-2 text-sm" onClick={() => setMarcar(true)}>Marcar consulta</CTAButton>}<Button variant="outline" className="h-10" onClick={() => setParams({ aba: 'conversa' })}>Mandar mensagem</Button></div></div></header>
    <nav aria-label="Ficha da paciente" className="mb-6 flex overflow-x-auto border-b border-border">{abas.map(([v,l]) => <Button key={v} variant="ghost" aria-current={v === aba ? 'page' : undefined} className={`h-12 shrink-0 rounded-none border-b-2 px-4 text-sm hover:bg-secondary/10 ${v === aba ? 'border-secondary bg-secondary/5 font-semibold' : 'border-transparent text-muted-foreground'}`} onClick={() => setParams({ aba: v })}>{l}</Button>)}</nav>
    {aba === 'ficha' && <PessoaFicha ficha={dados} userId={acesso.userId} cartao={cartao} />}
    {aba === 'consultas' && <PessoaConsultas ficha={dados} userId={acesso.userId} agora={agora} executar={executar} />}
    {aba === 'fotos' && (!dados.permissoes.fotos ? <Trancado nome={dados.nome} assunto="as fotos" /> : fotos.data ? <PacienteFotos dados={fotos.data} nome={dados.nome} paciente={dados.paciente_id} /> : <p role={fotos.error ? 'alert' : 'status'}>{fotos.error?.message ?? 'Carregando fotos…'}</p>)}
    {aba === 'conversa' && <PessoaConversa paciente={dados.paciente_id} userId={acesso.userId} />}
  </main>{marcar && <PacienteMarcar paciente={dados.paciente_id} nome={dados.nome} userId={acesso.userId} fechar={() => setMarcar(false)} executar={async fn => { const ok = await executar(fn); if (ok) toast({ title: 'Consulta marcada com sucesso.' }); return ok; }} />}</>;
}