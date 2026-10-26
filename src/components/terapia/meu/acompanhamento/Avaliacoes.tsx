import { useQuery } from '@tanstack/react-query';
import { terapia } from '@/lib/terapia';
import { nomeMarca,dataAcompanhamento,type AvaliacaoMinha } from '@/lib/meuAcompanhamento';
const doshas=[['V','Vata'],['P','Pitta'],['K','Kapha']] as const;
export function Leitura({a,ama=false}:{a:AvaliacaoMinha;ama?:boolean}) {
  return <div className="ac-tags">{doshas.map(([d,n])=><span key={d} className={`ac-selo ac-${d}`}>{n} {a.leitura?.[d]??0}</span>)}{ama&&a.ama&&<span className="ac-tag">Ama {doshas.map(([d])=>`${d}${a.ama?.[d]??0}`).join(' ')}</span>}</div>;
}
function Quadro({q}:{q:AvaliacaoMinha['quadros'][number]}) {
  const url=useQuery({queryKey:['acomp-quadro',q.imagem_path],queryFn:()=>terapia.arquivoAssinado('terapia-quadros',q.imagem_path),staleTime:50*60*1000});
  return <figure>{url.data?<a href={url.data} target="_blank" rel="noreferrer"><img src={url.data} alt={q.item}/></a>:<div className="ac-quadro-espera" role={url.error?'alert':'status'}>{url.error?'Não foi possível abrir o quadro.':'Carregando quadro…'}</div>}<figcaption>{q.item}</figcaption></figure>;
}
export default function Avaliacoes({lista,nome}:{lista:AvaliacaoMinha[];nome:string}) {
  if(!lista.length)return <p>Quando {nome} liberar a sua avaliação, ela aparece aqui.</p>;
  return <>{lista.map(a=><section className="ac-card" key={a.id} id={`avaliacao-${a.id}`}><header><h2>Avaliação de {dataAcompanhamento(a.data)}</h2><p className="ac-muted">{a.terapeuta.nome} · mostrada em {dataAcompanhamento(a.mostrada_em)}</p></header><h3 className="ac-eti">A leitura</h3><Leitura a={a} ama/><h3 className="ac-eti">Em palavras</h3><p className="whitespace-pre-wrap">{a.resumo||'Nenhum resumo nesta avaliação.'}</p>{a.marcas.length>0&&<><h3 className="ac-eti">O que foi marcado</h3><div className="ac-tags">{a.marcas.flatMap((m,i)=>{
    const efeitos=doshas.flatMap(([d,n])=>{const v=m[d]??0;const acalma=m[`${d}m` as 'Vm'|'Pm'|'Km']??0;return [...(v?[{d,texto:`${v>0?'aumenta':'acalma'} ${n}`}]:[]),...(acalma>0?[{d,texto:`acalma ${n}`}]:[])];});
    return efeitos.length?efeitos.map((e,j)=><span key={`${i}-${j}`} className={`ac-tag ac-${e.d}`}>{m.nome||nomeMarca(m.chave)} · {e.texto}</span>):[<span key={i} className="ac-tag">{m.nome||nomeMarca(m.chave)}</span>];
  })}</div></>}{a.quadros.length>0&&<><h3 className="ac-eti">O que foi mostrado na consulta</h3><div className="ac-quadros">{a.quadros.map(q=><Quadro key={q.id} q={q}/>)}</div></>}</section>)}</>;
}