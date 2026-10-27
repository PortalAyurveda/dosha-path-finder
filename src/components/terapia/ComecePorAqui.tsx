import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { terapia } from '@/lib/terapia';
import { urlDestino } from '@/lib/terapiaPessoa';

/** Cartão "Comece por aqui": some quando todos os passos estão feitos. */
export default function ComecePorAqui() {
  const q = useQuery({ queryKey: ['terapia-primeiros-passos'], queryFn: terapia.primeirosPassos });
  const d = q.data;
  if (!d || !d.passos?.length || d.feitos >= d.total) return null;
  const proximo = d.passos.find(p => !p.feito);
  return <section className="comece-aqui" aria-labelledby="comece-titulo">
    <div className="flex flex-wrap items-center justify-between gap-2"><h2 id="comece-titulo" className="font-serif text-xl font-bold text-primary">Comece por aqui</h2><span className="text-sm text-muted-foreground">{d.feitos} de {d.total} feitos</span></div>
    <div className="comece-barra" role="progressbar" aria-valuemin={0} aria-valuemax={d.total} aria-valuenow={d.feitos}><i style={{ width: `${Math.round(d.feitos / Math.max(1, d.total) * 100)}%` }} /></div>
    <ol className="comece-passos">{d.passos.map(p => <li key={p.chave} className={`comece-passo ${p.feito ? 'feito' : ''} ${p === proximo ? 'proximo' : ''}`}>
      <b>{p.feito && <span aria-hidden className="comece-ok">✓ </span>}{p.titulo}</b>{p.ajuda && <span>{p.ajuda}</span>}
      {p === proximo && <Button asChild size="sm" className="mt-2 w-fit"><Link to={urlDestino(p.destino)}>Fazer agora</Link></Button>}
    </li>)}</ol>
  </section>;
}
