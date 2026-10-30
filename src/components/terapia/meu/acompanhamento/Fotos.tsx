import { useState } from 'react';
import { useQuery,useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Dialog,DialogContent,DialogTitle } from '@/components/ui/dialog';
import { useUser } from '@/contexts/UserContext';
import { meu,type FotosMinhas,type FotoMinha } from '@/lib/terapiaMeu';
import { dataAcompanhamento } from '@/lib/meuAcompanhamento';
import type { PedidoFoto } from '@/lib/terapiaFotoPedidos';
export function FotoAssinada({foto}:{foto:FotoMinha}) {
  const q=useQuery({queryKey:['acomp-foto',foto.path],queryFn:()=>meu.fotoUrl(foto.path),staleTime:50*60*1000});
  return q.data?<img src={q.data} alt={foto.titulo||foto.tipo}/>:<span role={q.error?'alert':'status'}>{q.error?'Não foi possível abrir a foto.':'Carregando…'}</span>;
}
export default function Fotos({dados,nome}:{dados:FotosMinhas;nome:string}) {
  const {user}=useUser();const qc=useQueryClient();const [erro,setErro]=useState('');const [ocupado,setOcupado]=useState(false);const [ver,setVer]=useState<string|null>(null);
  const enviar=async(tipo:string,f:File,titulo?:string,pedido?:string)=>{
    if(!user)return;setOcupado(true);setErro('');try{const path=await meu.fotoEnviar(user.id,f);try{await meu.fotoRegistrar(tipo,path,titulo,pedido);}catch(e){await meu.fotoTirarDoStorage(path).catch(()=>undefined);throw e;}await Promise.all([qc.invalidateQueries({queryKey:['fotos-minhas']}),qc.invalidateQueries({queryKey:['meu-terapeuta']})]);}catch(e){setErro((e as Error).message);}finally{setOcupado(false);}
  };
  const entrada=(texto:string,tipo:string,titulo?:string,pedido?:string)=><Button asChild variant="secondary" disabled={ocupado}><label className="cursor-pointer">{texto}<input aria-label={titulo?`Enviar ${titulo}`:'Enviar foto'} className="sr-only" type="file" accept="image/*" disabled={ocupado} onChange={e=>{const f=e.target.files?.[0];e.target.value='';if(f)void enviar(tipo,f,titulo,pedido);}}/></label></Button>;
  const guiadas=dados.guiadas??[];const count=guiadas.filter(g=>dados.fotos.some(f=>f.tipo===g.chave)).length;
  const pedidos=(dados.pedidos??[]).filter(p=>!p.terapeuta||p.terapeuta===nome);
  const historico=dados.fotos.filter(f=>f.tipo===ver);
  return <>{pedidos.map((p:PedidoFoto)=><section key={p.id} className="ac-pedido"><div className="min-w-0 flex-1"><h3 className="ac-eti">{nome} pediu</h3><b>{p.titulo}</b>{p.instrucao&&<p>{p.instrucao}</p>}{p.ate&&<p className="ac-muted">Até {dataAcompanhamento(p.ate)}</p>}</div>{entrada('Tirar foto','extra',p.titulo,p.id)}</section>)}<section className="ac-card"><h3 className="ac-eti">As {guiadas.length} fotos guiadas · {count} de {guiadas.length}</h3><div className="ac-fotos">{guiadas.map(g=>{const foto=dados.fotos.find(f=>f.tipo===g.chave);return <div key={g.chave} className={`ac-foto ${foto?'':'falta'}`}>{foto?<Button variant="ghost" className="ac-foto-ver" onClick={()=>setVer(g.chave)} aria-label={`Ver ${g.titulo}`}><FotoAssinada foto={foto}/><span>{g.titulo} · {dataAcompanhamento(foto.criado_em)}</span></Button>:<><span>{g.titulo}</span>{entrada('+ enviar',g.chave,g.titulo)}</>}</div>;})}</div><p className="ac-muted">Só você e {nome} veem as fotos.</p>{!guiadas.length&&<p>Nenhuma foto guiada disponível.</p>}</section>{dados.fotos.some(f=>f.tipo==='extra')&&<section className="ac-card"><h3 className="ac-eti">Outras fotos</h3><div className="ac-fotos">{dados.fotos.filter(f=>f.tipo==='extra').map(f=><figure key={f.id} className="ac-foto"><FotoAssinada foto={f}/><figcaption>{f.titulo} · {dataAcompanhamento(f.criado_em)}</figcaption></figure>)}</div></section>}{ocupado&&<p role="status">Enviando foto…</p>}{erro&&<p role="alert">{erro}</p>}{ver&&<Dialog open onOpenChange={()=>setVer(null)}><DialogContent className="max-h-[90dvh] overflow-y-auto"><DialogTitle>{guiadas.find(g=>g.chave===ver)?.titulo}</DialogTitle>{historico.map(f=><figure key={f.id} className="ac-foto-historico"><FotoAssinada foto={f}/><figcaption>{dataAcompanhamento(f.criado_em)}</figcaption></figure>)}{entrada('Enviar nova foto',ver,guiadas.find(g=>g.chave===ver)?.titulo)}</DialogContent></Dialog>}</>;
}