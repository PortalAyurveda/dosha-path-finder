import { ReactNode, useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown } from 'lucide-react';
import { terapia, diaBR } from '@/lib/terapia';
import { FichaPaciente } from '@/lib/terapiaPaciente';
import { CartaoFicha, resumoEvolucao } from '@/lib/terapiaPessoa';
import MarcadosDosha from './MarcadosDosha';
import { CartaoPontosAtencao, CartaoQueixasArea, CartaoTesteResumo } from './ResumoAreas';
import { Ponto } from './PacienteResumo';
import PacienteEvolucao from './PacienteEvolucao';
import PacienteRotina from './PacienteRotina';
import { TituloPaciente, Trancado } from './PacienteComuns';

const doshas = ['vata', 'pitta', 'kapha'] as const;
const fundos = { vata: 'bg-vata', pitta: 'bg-pitta', kapha: 'bg-kapha' };
const textos = { vata: 'text-vata', pitta: 'text-pitta', kapha: 'text-kapha' };

function Sanfona({ id, titulo, resumo, aberto, alternar, children }: { id: CartaoFicha; titulo: string; resumo?: string; aberto: boolean; alternar: () => void; children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  return <section ref={ref} id={`ficha-${id}`} className="pessoa-sanfona">
    <button type="button" aria-expanded={aberto} onClick={alternar}><span className="font-serif text-base text-primary">{titulo}</span><span className="flex items-center gap-2">{!aberto && resumo && <small>{resumo}</small>}<ChevronDown className={`h-4 w-4 transition-transform ${aberto ? 'rotate-180' : ''}`} /></span></button>
    {aberto && <div>{children}</div>}
  </section>;
}

export default function PessoaFicha({ ficha, userId, cartao }: { ficha: FichaPaciente; userId?: string; cartao?: CartaoFicha }) {
  const [abertos, setAbertos] = useState<Set<CartaoFicha>>(() => new Set<CartaoFicha>(['teste', ...(cartao ? [cartao] : [])]));
  useEffect(() => { if (!cartao) return; setAbertos(a => new Set(a).add(cartao)); requestAnimationFrame(() => document.getElementById(`ficha-${cartao}`)?.scrollIntoView({ block: 'start', behavior: 'smooth' })); }, [cartao]);
  const alternar = (c: CartaoFicha) => setAbertos(a => { const n = new Set(a); if (n.has(c)) n.delete(c); else n.add(c); return n; });
  const p = (c: CartaoFicha) => ({ id: c, aberto: abertos.has(c), alternar: () => alternar(c) });
  const nascimento = useQuery({ queryKey: ['paciente-nascimento', userId, ficha.paciente_id], queryFn: () => terapia.nascimentoPaciente(ficha.paciente_id), enabled: abertos.has('nascimento') });
  const rotina = useQuery({ queryKey: ['paciente-rotina', userId, ficha.paciente_id], queryFn: () => terapia.rotinaPaciente(ficha.paciente_id), enabled: ficha.permissoes.rotina && abertos.has('rotina') });
  const teste = ficha.teste;
  const permite = ficha.permissoes.teste;
  const resumo = permite && teste ? ficha.resumo_areas : null;
  const trancado = <Trancado nome={ficha.nome} assunto="o teste de dosha" />;
  return <div className="max-w-5xl">
    <p className="mb-4 text-sm text-muted-foreground">O que ela trouxe: teste, sintomas, fotos e respostas. Só leitura.</p>
    <Sanfona {...p('teste')} titulo="Teste de dosha" resumo={teste ? `${diaBR(teste.data)} · V ${teste.vata ?? 0} · P ${teste.pitta ?? 0} · K ${teste.kapha ?? 0}` : undefined}>
      {!permite ? trancado : resumo ? <div className="grid gap-6 md:grid-cols-2"><div className="space-y-6"><CartaoTesteResumo resumo={resumo} data={teste?.data} teste={teste} completo={ficha.teste_completo} /><CartaoQueixasArea resumo={resumo} teste={teste} /></div><div><CartaoPontosAtencao resumo={resumo} /></div></div>
        : teste ? <div className="space-y-5"><div className="flex flex-wrap gap-4">{doshas.map(d => <span key={d} className={`text-sm font-semibold capitalize ${textos[d]}`}>{d} {teste[d] ?? ''}</span>)}</div><div className="flex h-2 overflow-hidden rounded-full bg-muted" role="img" aria-label={`Vata ${teste.vata ?? 0}, Pitta ${teste.pitta ?? 0}, Kapha ${teste.kapha ?? 0}`}>{doshas.map(d => <div key={d} className={fundos[d]} style={{ flexGrow: teste[d] ?? 0, flexBasis: 0 }} />)}</div><p className="text-sm text-muted-foreground">{teste.agni ?? ''}</p><div><TituloPaciente>Pontos de atenção</TituloPaciente><div className="flex flex-wrap gap-2">{(ficha.pontos_atencao ?? []).filter(x => x.completo).map(x => <Ponto key={x.slug} ponto={x} />)}</div></div></div>
        : <p className="text-sm text-muted-foreground">Ainda não fez o teste.</p>}
    </Sanfona>
    <Sanfona {...p('sintomas')} titulo="Sintomas dos doshas">{permite ? <MarcadosDosha grupos={teste?.queixas} /> : trancado}</Sanfona>
    <Sanfona {...p('evolucao')} titulo="Como evoluiu" resumo={permite ? resumoEvolucao(ficha.evolucao) : undefined}><PacienteEvolucao ficha={ficha} /></Sanfona>
    <Sanfona {...p('escreveu')} titulo="O que escreveu e o que come">{permite ? <div className="space-y-5"><div><TituloPaciente>O que escreveu</TituloPaciente><p className="whitespace-pre-wrap text-sm italic leading-relaxed">{teste?.relato || ''}</p></div><div><TituloPaciente>Come muito</TituloPaciente><MarcadosDosha grupos={teste?.alimentos} /></div></div> : trancado}</Sanfona>
    {ficha.permissoes.rotina && <Sanfona {...p('rotina')} titulo="Minha Rotina dela">{rotina.data ? <PacienteRotina dados={rotina.data} nome={ficha.nome} /> : <p role={rotina.error ? 'alert' : 'status'} className="text-sm">{rotina.error?.message ?? 'Carregando rotina…'}</p>}</Sanfona>}
    {ficha.permissoes.akasha && <Sanfona {...p('akasha')} titulo="Conversas com a Akasha" resumo={`${ficha.akasha?.length ?? 0} conversas`}><div className="divide-y divide-border">{(ficha.akasha ?? []).map((a, i) => <article key={`${a.data}-${i}`} className="py-4"><p className="text-xs text-muted-foreground">{diaBR(a.data)}</p><h3 className="my-2 text-base font-semibold">{a.titulo}</h3><p className="whitespace-pre-wrap text-sm leading-relaxed">{a.resumo}</p></article>)}</div>{!ficha.akasha?.length && <p className="text-sm text-muted-foreground">Nenhuma conversa disponível.</p>}</Sanfona>}
    <Sanfona {...p('nascimento')} titulo="Nascimento e objetivo">
      <TituloPaciente>Nascimento</TituloPaciente><p className="text-sm text-muted-foreground" role={nascimento.error ? 'alert' : undefined}>{nascimento.error?.message ?? (nascimento.isPending ? 'Carregando…' : nascimento.data ? [new Date(`${nascimento.data.data}T12:00:00`).toLocaleDateString('pt-BR'), nascimento.data.hora, nascimento.data.local_exterior || [nascimento.data.cidade, nascimento.data.uf].filter(Boolean).join('/')].filter(Boolean).join(' · ') : 'Ainda não preencheu')}</p>
      {permite && <div className="mt-5"><TituloPaciente>Objetivo</TituloPaciente><p className="whitespace-pre-wrap text-sm leading-relaxed">{[teste?.objetivo1, teste?.objetivo2].filter(Boolean).join('\n')}</p></div>}
    </Sanfona>
  </div>;
}
