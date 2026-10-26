import {useQuery} from '@tanstack/react-query';
import {Button} from '@/components/ui/button';
import {TesteCorpo} from '@/components/terapia/mesa/Mesa';
import {terapia} from '@/lib/terapia';
import {DOSHAS,marcada} from '@/lib/terapiaAvaliacao';
import type {FichaPaciente} from '@/lib/terapiaPaciente';
import type {FolhaIndicacoes} from '@/lib/terapiaIndicacoes';
export default function FichaIndicacoes({ficha,folha,fechar,userId}:{ficha:FichaPaciente;folha:FolhaIndicacoes;fechar:()=>void;userId?:string}){
 const ultimo=[...(ficha.avaliacoes??[])].sort((a,b)=>Date.parse(b.criado_em)-Date.parse(a.criado_em))[0];
 const id=folha.avaliacao_id??folha.avaliacao?.id??ultimo?.id;
 const q=useQuery({queryKey:['indicacoes-avaliacao',userId,id],queryFn:()=>terapia.avaliacao(id??''),enabled:!!id,retry:false});
 const a=q.data;const leitura=a?.leitura??folha.avaliacao?.leitura??ultimo?.leitura;
 const marcas=Object.values(a?.dados.marcas??{}).filter(marcada);
 return <aside className="ind-ficha"><div className="ind-ficha-cab"><h2>{ficha.nome}</h2><Button variant="outline" onClick={fechar}>Fechar ficha</Button></div><TesteCorpo ficha={ficha}/><section><h3 className="m-eti">{folha.avaliacao_id||folha.avaliacao?'Avaliação desta consulta':'Avaliação mais recente'}</h3>{q.error&&<p role="alert">{q.error.message}</p>}{q.isFetching&&!a&&<p role="status">Carregando avaliação…</p>}{leitura?<div>{DOSHAS.map(d=><span className={`m-chip ${d}`} key={d}>{d} {leitura[d]??0}</span>)}</div>:!id&&<p>Nenhuma avaliação ainda.</p>}{a?.dados.ama&&<p>Ama · {DOSHAS.map(d=>`${d} ${a.dados.ama?.[d]??0}`).join(' · ')}</p>}{marcas.length>0&&<><h3 className="m-eti">O que foi marcado</h3>{marcas.map(m=><p key={m.id}>{m.nome}{m.nota?` · ${m.nota}`:''}</p>)}</>}{(a?.resumo??folha.avaliacao?.resumo??ultimo?.resumo)&&<p className="whitespace-pre-wrap">{a?.resumo??folha.avaliacao?.resumo??ultimo?.resumo}</p>}</section></aside>;
}
