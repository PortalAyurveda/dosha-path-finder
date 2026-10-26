import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { terapia, diaBR } from '@/lib/terapia';
import { FichaPaciente, textosMarcados } from '@/lib/terapiaPaciente';
import { TituloPaciente, Trancado } from './PacienteComuns';
import type { PontoAtencao } from '@/lib/terapiaPaciente';
const doshas = ['vata', 'pitta', 'kapha'] as const;
const fundos = { vata: 'bg-vata', pitta: 'bg-pitta', kapha: 'bg-kapha' };
const textos = { vata: 'text-vata', pitta: 'text-pitta', kapha: 'text-kapha' };
function Ponto({ ponto }: { ponto: PontoAtencao }) {
  const [aberto, setAberto] = useState(false);
  return <Popover open={aberto} onOpenChange={setAberto}><PopoverTrigger asChild><Button variant="outline" size="sm" onMouseEnter={() => setAberto(true)} className="portal-atencao h-auto whitespace-normal text-left text-xs hover:bg-muted">{ponto.nome}</Button></PopoverTrigger><PopoverContent onMouseLeave={() => setAberto(false)}><p className="text-sm">Marcou {ponto.marcou.length} de {ponto.total}: {ponto.marcou.join(', ')}</p>{ponto.anda_junto && <p className="mt-2 text-sm">Anda junto: {Array.isArray(ponto.anda_junto) ? ponto.anda_junto.join(', ') : ponto.anda_junto}</p>}</PopoverContent></Popover>;
}
export default function PacienteResumo({ ficha, userId }: { ficha: FichaPaciente; userId?: string }) {
  const nascimento = useQuery({ queryKey: ['paciente-nascimento', userId, ficha.paciente_id], queryFn: () => terapia.nascimentoPaciente(ficha.paciente_id) });
  const teste = ficha.teste;
  const chips = (itens: string[]) => <div className="flex flex-wrap gap-2">{itens.map(i => <span className="rounded bg-muted px-2 py-1 text-xs" key={i}>{i}</span>)}</div>;
  return <div className="grid gap-7 md:grid-cols-2">
    {!ficha.permissoes.teste ? <div className="md:col-span-2"><Trancado nome={ficha.nome} assunto="o teste de dosha" /></div> : <>
      <section className="portal-cartao"><TituloPaciente>Teste de dosha{teste && ` · ${diaBR(teste.data)}`}</TituloPaciente>{teste ? <><div className="flex flex-wrap gap-4">{doshas.map(d => <span key={d} className={`text-sm font-semibold capitalize ${textos[d]}`}>{d} {teste[d] ?? ''}</span>)}</div><div className="my-3 flex h-2 overflow-hidden rounded-full bg-muted" role="img" aria-label={`Vata ${teste.vata ?? 0}, Pitta ${teste.pitta ?? 0}, Kapha ${teste.kapha ?? 0}`}>{doshas.map(d => <div key={d} className={fundos[d]} style={{ flexGrow: teste[d] ?? 0, flexBasis: 0 }} />)}</div><p className="text-sm text-muted-foreground">{teste.agni ?? ''}</p></> : <p className="text-sm text-muted-foreground">Ainda não fez o teste.</p>}</section>
      <section className="portal-cartao"><TituloPaciente>Pontos de atenção</TituloPaciente><div className="flex flex-wrap gap-2">{(ficha.pontos_atencao ?? []).filter(p => p.completo).map(p => <Ponto key={p.slug} ponto={p} />)}</div></section>
      <section className="portal-cartao space-y-5"><div><TituloPaciente>Queixas que marcou</TituloPaciente>{chips(textosMarcados(teste?.queixas))}</div><div><TituloPaciente>Come muito</TituloPaciente>{chips(textosMarcados(teste?.alimentos))}</div><div><TituloPaciente>O que escreveu</TituloPaciente><p className="italic whitespace-pre-wrap text-sm leading-relaxed">{teste?.relato || ''}</p></div></section>
    </>}
    <section className="portal-cartao"><TituloPaciente>Nascimento</TituloPaciente><p className="text-sm text-muted-foreground" role={nascimento.error ? 'alert' : undefined}>{nascimento.error?.message ?? (nascimento.isPending ? 'Carregando…' : nascimento.data ? [new Date(`${nascimento.data.data}T12:00:00`).toLocaleDateString('pt-BR'), nascimento.data.hora, nascimento.data.local_exterior || [nascimento.data.cidade, nascimento.data.uf].filter(Boolean).join('/')].filter(Boolean).join(' · ') : 'Ainda não preencheu')}</p>{ficha.permissoes.teste && <div className="mt-5"><TituloPaciente>Objetivo</TituloPaciente><p className="whitespace-pre-wrap text-sm leading-relaxed">{[teste?.objetivo1, teste?.objetivo2].filter(Boolean).join('\n') || ''}</p></div>}</section>
  </div>;
}