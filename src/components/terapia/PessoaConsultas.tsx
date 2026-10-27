import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { terapia, diaBR, horaBR } from '@/lib/terapia';
import { FichaPaciente, proximaConsulta, guiadasEnviadas } from '@/lib/terapiaPaciente';
import { agruparConsultas } from '@/lib/terapiaPessoa';
import type { FolhaIndicacoesLista } from '@/lib/terapiaIndicacoes';
import type { AvaliacaoLista } from '@/lib/terapiaAvaliacao';
import PacienteAnotacoes from './PacienteAnotacoes';
import { TituloPaciente } from './PacienteComuns';

/** Consultas: cada uma com a avaliação, a folha e as anotações daquele dia; o resto em "Anotações gerais". */
export default function PessoaConsultas({ ficha, userId, agora, executar }: { ficha: FichaPaciente; userId?: string; agora: number; executar: (fn: () => Promise<unknown>) => Promise<boolean> }) {
  const config = useQuery({ queryKey: ['terapia-config'], queryFn: terapia.config });
  const fotos = useQuery({ queryKey: ['paciente-fotos', userId, ficha.paciente_id], queryFn: () => terapia.fotosPaciente(ficha.paciente_id), enabled: ficha.permissoes.fotos });
  const nascimento = useQuery({ queryKey: ['paciente-nascimento', userId, ficha.paciente_id], queryFn: () => terapia.nascimentoPaciente(ficha.paciente_id) });
  const folhas = useQuery({ queryKey: ['indicacoes-lista', userId, ficha.paciente_id], queryFn: () => terapia.folhasDa(ficha.paciente_id), retry: false });
  const proxima = proximaConsulta(ficha.consultas, agora);
  const { grupos, geral } = agruparConsultas(ficha.consultas, ficha.avaliacoes ?? [], folhas.data ?? [], ficha.notas);
  const base = `/painel-terapeuta/paciente/${ficha.paciente_id}`;
  const linhaFolha = (f: FolhaIndicacoesLista) => <div key={f.id} className="flex flex-wrap items-center justify-between gap-2 border-t border-border py-2 text-sm"><span>Indicações · <span className="text-muted-foreground">{f.enviada_em ? `enviada em ${diaBR(f.enviada_em)}` : 'rascunho'}{f.vista_em ? ` · ela viu em ${diaBR(f.vista_em)}` : ''}</span></span><Button variant="outline" size="sm" asChild><Link to={`${base}/indicacoes/${f.id}`}>Abrir folha</Link></Button></div>;
  const linhaAvaliacao = (a: AvaliacaoLista) => <div key={a.id} className="flex flex-wrap items-center justify-between gap-2 border-t border-border py-2 text-sm"><span>Avaliação · <span className="text-muted-foreground">{diaBR(a.criado_em)}</span></span><Button variant="outline" size="sm" asChild><Link to={`${base}/avaliacao/${a.id}`}>Abrir avaliação</Link></Button></div>;
  return <section className="max-w-5xl space-y-4">
    <TituloPaciente>Consultas</TituloPaciente>
    {folhas.error && <p role="alert" className="text-sm text-destructive">{folhas.error.message}</p>}
    {!grupos.length && <p className="text-sm text-muted-foreground">Nenhuma consulta.</p>}
    {grupos.map(({ consulta: c, avaliacoes, folhas: fs, notas }) => {
      const futura = c.status === 'marcada' && Date.parse(c.inicio) > agora;
      return <article key={c.id} className="portal-cartao">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3"><h3 className="font-semibold">{diaBR(c.inicio)} · {horaBR(c.inicio)}</h3><span className={`rounded px-2 py-1 text-xs ${c.status === 'realizada' ? 'paciente-status-ok' : c.status === 'marcada' ? 'paciente-status-pendente' : 'bg-muted text-muted-foreground'}`}>{c.status}</span></div>
          {c.status !== 'cancelada' && <div className="flex flex-wrap gap-2">
            {!avaliacoes.length && <Button variant="outline" size="sm" asChild><Link to={`${base}/avaliacao/nova?consulta=${c.id}`}>Nova avaliação</Link></Button>}
            {!fs.length && !futura && <Button variant="outline" size="sm" asChild><Link to={`${base}/indicacoes/nova?consulta=${c.id}`}>Montar indicações</Link></Button>}
          </div>}
        </div>
        {proxima?.id === c.id && <p className="mt-2 text-xs text-muted-foreground">Antes da consulta: {ficha.permissoes.fotos ? fotos.data ? `fotos ${guiadasEnviadas(fotos.data)} de ${config.data?.fotos_guiadas?.length ?? fotos.data.guiadas?.length ?? 0}` : 'carregando fotos…' : 'fotos não liberadas'} · {nascimento.isPending ? 'carregando nascimento…' : nascimento.data ? 'nascimento ok' : 'nascimento pendente'} · {ficha.permissoes.teste ? ficha.teste ? 'teste ok' : 'teste pendente' : 'teste não liberado'}</p>}
        {(avaliacoes.length > 0 || fs.length > 0 || notas.length > 0) && <div className="mt-3">
          {avaliacoes.map(linhaAvaliacao)}
          {fs.map(linhaFolha)}
          {notas.map(n => <p key={n.id} className="whitespace-pre-wrap border-t border-border py-2 text-sm leading-relaxed"><span className="text-xs text-muted-foreground">Anotação · </span>{n.texto}</p>)}
        </div>}
      </article>;
    })}
    {(geral.avaliacoes.length > 0 || geral.folhas.length > 0) && <article className="portal-cartao"><h3 className="mb-1 font-semibold">Sem consulta</h3>{geral.avaliacoes.map(linhaAvaliacao)}{geral.folhas.map(linhaFolha)}</article>}
    <div className="portal-cartao"><PacienteAnotacoes key={ficha.paciente_id} titulo="Anotações gerais" paciente={ficha.paciente_id} notas={geral.notas} executar={executar} /></div>
  </section>;
}
