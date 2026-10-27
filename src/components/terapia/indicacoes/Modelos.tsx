import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { filtrarModelos, modelosTerapia, ordenarPorTeste, type ModeloIndicacoes } from '@/lib/terapiaModelos';
import { iniciarIndicacoes, momentosDaFolha } from '@/lib/terapiaIndicacoes';

/** Lista de folhas prontas (do Portal e minhas), com as que combinam com o teste primeiro. */
export default function Modelos({ lista, usar, ocupado = false, dosha }: { lista: ModeloIndicacoes[]; usar: (m: ModeloIndicacoes) => void; ocupado?: boolean; dosha?: string | null }) {
  const [busca, setBusca] = useState(''); const [ver, setVer] = useState<string>();
  const q = useQuery({ queryKey: ['terapia-modelo', ver], queryFn: () => modelosTerapia.modelo(ver ?? ''), enabled: !!ver });
  const filtrados = ordenarPorTeste(filtrarModelos(lista, busca, ''), dosha);
  return <>
    <Input aria-label="Buscar folhas prontas" placeholder="Buscar por nome ou etiqueta" value={busca} onChange={e => setBusca(e.target.value)} />
    <ul className="mt-3 grid gap-2">
      {filtrados.map(m => <li key={m.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-3">
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{m.nome} {m.combina && <span className="ml-1 rounded-full bg-accent/20 px-2 py-0.5 text-xs font-semibold text-primary">Combina com o teste</span>}</p>
          <p className="text-xs text-muted-foreground">{m.do_portal ? 'Do Portal' : 'Minha'} · {m.itens} itens{m.dosha ? ` · ${m.dosha}` : ''}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setVer(m.id)}>Ver</Button>
        <Button size="sm" disabled={ocupado} onClick={() => usar(m)}>Usar</Button>
      </li>)}
    </ul>
    {!filtrados.length && <p className="mt-3 text-sm text-muted-foreground">Nenhuma folha pronta.</p>}
    <Dialog open={!!ver} onOpenChange={v => { if (!v) setVer(undefined); }}><DialogContent className="max-h-[85dvh] overflow-y-auto"><DialogTitle>{q.data?.nome ?? 'Folha pronta'}</DialogTitle>{q.error ? <p role="alert">{q.error.message}</p> : !q.data ? <p role="status">Carregando…</p> : <>
      {q.data.descricao && <p className="text-sm">{q.data.descricao}</p>}
      {q.data.tratamento && <p className="whitespace-pre-wrap text-sm">{q.data.tratamento}</p>}
      {momentosDaFolha().map(s => { const itens = iniciarIndicacoes(q.data?.dados ?? {}).secoes[s.chave] ?? []; return itens.length ? <section key={s.chave}><h3 className="mb-1 text-sm font-semibold">{s.titulo}</h3><ul className="space-y-1">{itens.map((i, n) => <li key={n} className="text-sm">{i.titulo}{i.nota && <span className="block text-xs text-muted-foreground">{i.nota}</span>}</li>)}</ul></section> : null; })}
      <Button disabled={ocupado} onClick={() => { if (q.data) { usar(q.data); setVer(undefined); } }}>Usar</Button>
    </>}</DialogContent></Dialog>
  </>;
}
