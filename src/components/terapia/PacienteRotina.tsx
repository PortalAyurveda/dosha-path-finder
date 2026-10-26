import { RotinaPaciente } from '@/lib/terapiaPaciente';
import { rotinaEmDia } from '@/lib/terapiaPaciente';
import { TituloPaciente, Trancado } from './PacienteComuns';
export default function PacienteRotina({ dados, nome }: { dados: RotinaPaciente; nome: string }) {
  if (!dados.permitido) return <Trancado nome={nome} assunto="a rotina" />;
  return <section><TituloPaciente>Rotina desta semana</TituloPaciente><div className="divide-y divide-border">{(dados.horarios ?? []).map(h => <article key={h.slot} className="grid grid-cols-[minmax(70px,0.7fr)_minmax(0,2fr)_auto] items-center gap-3 py-4"><p className="text-xs text-muted-foreground">{h.nome}</p><p className="text-sm leading-relaxed">{h.itens.map(i => i.titulo).filter(Boolean).join(' · ')}</p><span className={`whitespace-nowrap rounded px-2 py-1 text-xs ${rotinaEmDia(h.feitos) ? 'paciente-status-ok' : 'paciente-status-pendente'}`}>{h.feitos} de {h.dias}</span></article>)}</div>{!dados.horarios?.length && <p className="text-sm text-muted-foreground">Nenhuma rotina disponível.</p>}</section>;
}