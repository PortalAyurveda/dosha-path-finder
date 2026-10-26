import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useQuery } from '@tanstack/react-query';
import { terapia, diaBR, horaBR } from '@/lib/terapia';
import { FichaPaciente, proximaConsulta, guiadasEnviadas } from '@/lib/terapiaPaciente';
import { TituloPaciente } from './PacienteComuns';
export default function PacienteConsultas({ ficha, userId, agora }: { ficha: FichaPaciente; userId?: string; agora: number }) {
  const config=useQuery({queryKey:["terapia-config"],queryFn:terapia.config});
  const fotos = useQuery({ queryKey: ['paciente-fotos', userId, ficha.paciente_id], queryFn: () => terapia.fotosPaciente(ficha.paciente_id), enabled: ficha.permissoes.fotos });
  const nascimento = useQuery({ queryKey: ['paciente-nascimento', userId, ficha.paciente_id], queryFn: () => terapia.nascimentoPaciente(ficha.paciente_id) });
  const proxima = proximaConsulta(ficha.consultas, agora);
  const folhas = useQuery({ queryKey: ['indicacoes-lista', userId, ficha.paciente_id], queryFn: () => terapia.folhasDa(ficha.paciente_id), retry: false });
  const entradas = [
    ...(folhas.data ?? []).map(f => ({ tipo: 'indicacoes' as const, data: f.criado_em, folha: f })),
    ...ficha.consultas.map(c => ({ tipo: 'consulta' as const, data: c.inicio, consulta: c })),
    ...(ficha.avaliacoes ?? []).map(a => ({ tipo: 'avaliacao' as const, data: a.criado_em, avaliacao: a })),
  ].sort((a,b) => Date.parse(b.data)-Date.parse(a.data));
  return <section><TituloPaciente>Consultas</TituloPaciente>{folhas.error && <p role="alert" className="mb-3 text-sm text-destructive">{folhas.error.message}</p>}{folhas.isPending && <p role="status" className="mb-3 text-sm text-muted-foreground">Carregando indicações…</p>}{!entradas.length && <p className="text-sm text-muted-foreground">Nenhuma consulta.</p>}
    <div className="divide-y divide-border">{entradas.map(entrada => {
      if (entrada.tipo === 'indicacoes') {
        const f = entrada.folha;
        const base = `/painel-terapeuta/paciente/${ficha.paciente_id}/indicacoes/${f.id}`;
        return <article key={`indicacoes-${f.id}`} className="grid gap-3 py-5 sm:grid-cols-[90px_minmax(0,1fr)]"><div><p className="font-semibold">{diaBR(f.criado_em)}</p><p className="text-xs text-muted-foreground">{horaBR(f.criado_em)}</p></div><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-sm font-semibold">Indicações</h3><p className="mt-1 text-xs text-muted-foreground">{f.enviada_em ? `enviada em ${diaBR(f.enviada_em)} às ${horaBR(f.enviada_em)}` : 'Rascunho'}{f.vista_em ? ` · ela viu em ${diaBR(f.vista_em)} às ${horaBR(f.vista_em)}` : ''}</p></div><div className="flex gap-2"><Button variant="outline" asChild><Link to={`${base}/folha`}>Ver</Link></Button><Button variant="outline" asChild><Link to={base}>Ajustar</Link></Button></div></div></article>;
      }
      if (entrada.tipo === 'avaliacao') {
        const a = entrada.avaliacao;
        return <article key={`avaliacao-${a.id}`} className="grid gap-3 py-5 sm:grid-cols-[90px_minmax(0,1fr)]"><div><p className="font-semibold">{diaBR(a.criado_em)}</p><p className="text-xs text-muted-foreground">{horaBR(a.criado_em)}</p></div><div className="flex flex-wrap items-center justify-between gap-3"><h3 className="text-sm font-semibold">Avaliação{a.consulta_id && ` · consulta ${diaBR(ficha.consultas.find(c=>c.id===a.consulta_id)?.inicio ?? a.criado_em)}`}</h3><Button variant="outline" asChild><Link to={`/painel-terapeuta/paciente/${ficha.paciente_id}/avaliacao/${a.id}`}>Continuar</Link></Button></div></article>;
      }
      const c = entrada.consulta;
      return <article key={c.id} className="grid gap-3 py-5 sm:grid-cols-[90px_minmax(0,1fr)]"><div><p className="font-semibold">{diaBR(c.inicio)}</p><p className="text-xs text-muted-foreground">{horaBR(c.inicio)}</p></div><div><div className="flex items-center gap-3"><h3 className="text-sm font-semibold">Consulta</h3><span className={`rounded px-2 py-1 text-xs ${c.status === 'realizada' ? 'paciente-status-ok' : c.status === 'marcada' ? 'paciente-status-pendente' : 'bg-muted text-muted-foreground'}`}>{c.status}</span></div>{proxima?.id === c.id && <div className="mt-3 border-l-2 border-border pl-3"><p className="text-sm">Antes da consulta</p><p className="text-xs text-muted-foreground">{ficha.permissoes.fotos ? fotos.error ? fotos.error.message : fotos.data ? `fotos ${guiadasEnviadas(fotos.data)} de ${config.data?.fotos_guiadas?.length??fotos.data.guiadas?.length??0}` : 'Carregando fotos…' : 'fotos não liberadas'} · {nascimento.error ? nascimento.error.message : nascimento.isPending ? 'Carregando nascimento…' : nascimento.data ? 'nascimento ok' : 'nascimento pendente'} · {ficha.permissoes.teste ? ficha.teste ? 'teste ok' : 'teste pendente' : 'teste não liberado'}</p></div>}{ficha.notas.filter(n => n.consulta_id === c.id).map(n => <p key={n.id} className="mt-3 whitespace-pre-wrap border-l-2 border-border pl-3 text-sm leading-relaxed">{n.texto}</p>)}</div></article>;
    })}</div>
  </section>;
}
