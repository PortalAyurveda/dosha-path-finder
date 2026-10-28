import { useEffect,useRef,useState } from 'react';
import type { ReactNode } from 'react';
import { useQuery,useQueryClient } from '@tanstack/react-query';
import { Eraser,Redo2,Undo2,Trash2,X } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { terapia } from '@/lib/terapia';
import type { ConteudoFicha } from '@/lib/terapiaAvaliacao';
import type { FichaPaciente,FotoPaciente } from '@/lib/terapiaPaciente';
import { CORES_QUADRO,NOMES_CORES,TRACOS_QUADRO,QUADRO_VAZIO,apagarPerto,basePrancha,desfazer,fotosDoQuadro,historicoVazio,refazer,registrar,svgLingua,tamanhoQuadro,encaixarQuadro } from '@/lib/terapiaQuadro';
import type { BaseQuadro,CorQuadro,EstadoQuadro,HistoricoQuadro,QuadroSalvo,TracoQuadro } from '@/lib/terapiaQuadro';
import '../mesa/mesa.css';
import './quadro.css';

function FotoTile({foto,nome,modelo,escolher,ocupado}:{foto?:FotoPaciente;nome:string;modelo?:string;ocupado:boolean;escolher:(b:BaseQuadro)=>void}) {
 const url=useQuery({queryKey:['quadro-foto',foto?.id,foto?.path],queryFn:()=>{if(!foto)throw new Error('Foto não encontrada.');return terapia.fotoAssinada(foto);},enabled:!!foto,staleTime:50*60*1000,gcTime:0});
 const base:BaseQuadro=foto?{chave:`foto:${foto.id}`,nome,foto}:{chave:`modelo:${nome}`,nome,url:modelo};
 return <button type="button" className="qa-th" disabled={ocupado||(!foto&&!modelo)} onClick={()=>escolher(base)}>{foto?url.data&&<img src={url.data} alt=""/>:modelo&&<img src={modelo} alt="" className="modelo"/>}<span>{nome}</span>{url.error&&<span role="alert">{url.error.message}</span>}</button>;
}
/** Quadro de aula em camada grande: base em um toque, uma barra de ferramentas e Voltar/Avançar. */
export default function Quadro({avaliacao,userId,ficha,conteudo,fechar,inicial,treino=false,consulta,videoTopo,fotosTreino=[],onLocalSave,onExibir}:{onLocalSave?:(quadro:QuadroSalvo)=>void;onExibir?:(v:boolean)=>void;treino?:boolean;consulta?:string;videoTopo?:ReactNode;fotosTreino?:{tipo:string;titulo:string;url:string}[];avaliacao:string;userId?:string;ficha:FichaPaciente;conteudo:ConteudoFicha;fechar:()=>void;inicial?:QuadroSalvo}) {
 const [exibindo,setExibindo]=useState(false);const exibindoRef=useRef(false);const guardarRef=useRef<()=>Promise<boolean>>(async()=>false);
 const qc=useQueryClient();const [escolha,setEscolha]=useState<'fotos'|'pranchas'|null>(null);const [ferramenta,setFerramenta]=useState<'pincel'|'borracha'>('pincel');const [cor,setCor]=useState<CorQuadro>('foreground');const [largura,setLargura]=useState<number>(TRACOS_QUADRO.fino);const [erro,setErro]=useState('');const [ocupado,setOcupado]=useState(false);const palco=useRef<HTMLDivElement>(null);const [larguraBase,setLarguraBase]=useState(600);const canvas=useRef<HTMLCanvasElement>(null);const desenhando=useRef(false);const apagou=useRef(false);const dirty=useRef(false);const salvandoRef=useRef(false);const fila=useRef(Promise.resolve());
 const [hist,setHist]=useState<HistoricoQuadro>(historicoVazio);const histRef=useRef(hist);histRef.current=hist;
 const primeiro:EstadoQuadro=inicial&&!Array.isArray(inicial.tracos)&&inicial.tracos?.base?inicial.tracos:{base:QUADRO_VAZIO,desenhos:[]};
 const [estado,setEstado]=useState<EstadoQuadro>(primeiro);const atual=useRef(estado);atual.current=estado;const [registro,setRegistro]=useState<QuadroSalvo|undefined>(inicial);const registroRef=useRef(registro);registroRef.current=registro;const [baseImagem,setBaseImagem]=useState<HTMLImageElement|null>(null);const [pronto,setPronto]=useState(false);
 const fotos=useQuery({queryKey:['quadro-fotos',userId,ficha.paciente_id],queryFn:()=>terapia.fotosPaciente(ficha.paciente_id),enabled:ficha.permissoes.fotos&&!treino});
 const config=useQuery({queryKey:['sala-treino-config'],queryFn:terapia.config,staleTime:10*60*1000});
 useEffect(()=>{let ativo=true;setPronto(false);setBaseImagem(null);const abrir=(src:string,falha:string)=>{const img=new Image();if(!src.startsWith('data:'))img.crossOrigin='anonymous';img.onload=()=>{if(ativo){setBaseImagem(img);setPronto(true);}};img.onerror=()=>{if(ativo)setErro(falha);};img.src=src;};
  if(estado.base.desenho==='lingua'){const css=getComputedStyle(document.documentElement);abrir(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgLingua(`hsl(${css.getPropertyValue('--primary').trim()})`,`hsl(${css.getPropertyValue('--muted-foreground').trim()})`))}`,'Não foi possível abrir o desenho.');return()=>{ativo=false;};}
  if(estado.base.url){abrir(estado.base.url,'Não foi possível abrir o modelo.');return()=>{ativo=false;};}
  if(!estado.base.foto){setPronto(true);return;}if(!ficha.permissoes.fotos||fotos.data?.permitido===false){setErro('Ela não liberou as fotos');return;}if(!fotos.data)return;
  terapia.fotoAssinada(estado.base.foto).then(url=>abrir(url,'Não foi possível abrir a foto.')).catch(e=>{if(ativo)setErro(e.message);});return()=>{ativo=false;};},[estado.base,ficha.permissoes.fotos,fotos.data]);
 useEffect(()=>{const el=canvas.current;if(!el||!pronto)return;const ctx=el.getContext('2d');if(!ctx)return;const css=getComputedStyle(document.documentElement);const tinta=(c:string)=>`hsl(${css.getPropertyValue(`--${c}`)})`;
  ctx.fillStyle=tinta('card');ctx.fillRect(0,0,el.width,el.height);const b=estado.base;
  if(baseImagem){const area=.9;const scale=Math.min(el.width*area/baseImagem.width,el.height*area/baseImagem.height);ctx.drawImage(baseImagem,(el.width-baseImagem.width*scale)/2,(el.height-baseImagem.height*scale)/2,baseImagem.width*scale,baseImagem.height*scale);if(b.desenho){ctx.fillStyle=tinta('primary');ctx.font="bold 28px 'Roboto Serif', Georgia, serif";ctx.textAlign='center';ctx.fillText(b.nome,el.width/2,48);ctx.textAlign='left';}}
  else if(b.chave!=='vazio'){const x0=60,w=el.width-120;const linhas=b.linhas??[];const quebrar=(t:string,max:number,fonte:string)=>{ctx.font=fonte;const out:string[]=[];for(const par of t.split('\n')){let l='';for(const p of par.split(' ')){if(ctx.measureText(`${l} ${p}`.trim()).width>max&&l){out.push(l);l=p;}else l=`${l} ${p}`.trim();}out.push(l);}return out;};
   const corpo="19px 'DM Sans', sans-serif";const linhasTexto=linhas.map(l=>quebrar([l.b,l.t].filter(Boolean).join(' · ')+(l.m?` · ${l.m}`:''),w-30,corpo));const livre=b.texto?quebrar(b.texto,w-30,corpo):[];const altura=70+linhasTexto.reduce((n,l)=>n+l.length*25+14,0)+livre.length*26+(livre.length?14:0);const y0=Math.max(20,(el.height-altura)/2);const fit=Math.min(1,(el.height*.9)/altura);ctx.save();ctx.translate(el.width/2,el.height/2);ctx.scale(fit,fit);ctx.translate(-el.width/2,-(y0+altura/2));
   ctx.fillStyle=tinta('card');ctx.strokeStyle=tinta('border');ctx.lineWidth=2;ctx.beginPath();ctx.roundRect(x0,y0,w,altura,16);ctx.fill();ctx.stroke();
   ctx.fillStyle=tinta('primary');ctx.font="bold 28px 'Roboto Serif', Georgia, serif";ctx.fillText(b.nome,x0+16,y0+44);let y=y0+70;
   linhasTexto.forEach((ls,n)=>{ctx.strokeStyle=tinta('muted');ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x0+16,y-4);ctx.lineTo(x0+w-16,y-4);ctx.stroke();ls.forEach((t,k)=>{y+=24;const l=linhas[n];if(k===0&&t.startsWith(l.b)){ctx.font="bold 19px 'DM Sans', sans-serif";ctx.fillStyle=tinta('primary');ctx.fillText(l.b,x0+16,y);const wb=ctx.measureText(l.b).width;ctx.font=corpo;ctx.fillStyle=tinta('foreground');ctx.fillText(t.slice(l.b.length),x0+16+wb,y);}else{ctx.font=corpo;ctx.fillStyle=tinta('muted-foreground');ctx.fillText(t,x0+16,y);}});y+=14;});
   if(livre.length){ctx.font=corpo;ctx.fillStyle=tinta('foreground');livre.forEach(t=>{y+=26;ctx.fillText(t,x0+16,y);});}ctx.restore();}
  for(const d of estado.desenhos){ctx.strokeStyle=tinta(d.cor);ctx.fillStyle=tinta(d.cor);ctx.lineWidth=d.w??5;ctx.lineCap='round';ctx.lineJoin='round';if(d.tipo==='texto'){const p=d.pontos[0];if(p){ctx.font="bold 26px 'DM Sans', sans-serif";ctx.fillText(d.texto??'',p.x*el.width,p.y*el.height);}}else{ctx.beginPath();d.pontos.forEach((p,n)=>{if(n===0)ctx.moveTo(p.x*el.width,p.y*el.height);else ctx.lineTo(p.x*el.width,p.y*el.height);});ctx.stroke();}}
 },[estado,baseImagem,pronto]);
 const guardar=async()=>{if(!dirty.current&&registroRef.current){if(consulta&&exibindoRef.current&&!treino){const {sala}=await import('@/lib/consultaSala');await sala.mostrar(consulta,registroRef.current.id);}return true;}if(salvandoRef.current)return false;if((!userId&&!treino)||!canvas.current||!pronto){setErro('Espere o quadro carregar antes de guardar.');return false;}const snapshot=atual.current;const reg=registroRef.current;const el=canvas.current;salvandoRef.current=true;setOcupado(true);setErro('');try{if(treino){const local={id:reg?.id??crypto.randomUUID(),item:snapshot.base.nome,imagem_path:el.toDataURL('image/png'),tracos:snapshot,mostrar_paciente:exibindoRef.current,criado_em:reg?.criado_em??new Date().toISOString(),atualizado_em:new Date().toISOString()};registroRef.current=local;setRegistro(local);onLocalSave?.(local);dirty.current=false;return true;}const blob=await new Promise<Blob>((resolve,reject)=>el.toBlob(b=>b?resolve(b):reject(new Error('Não foi possível gerar a imagem.')),'image/png'));const path=reg?.imagem_path??`${userId}/${crypto.randomUUID()}.png`;await terapia.arquivoEnviar('terapia-quadros',path,blob);const id=await terapia.quadroGuardar(avaliacao,snapshot.base.nome,path,snapshot,reg?.id);const novo={id,item:snapshot.base.nome,imagem_path:path,tracos:snapshot,mostrar_paciente:reg?.mostrar_paciente??false,criado_em:reg?.criado_em??new Date().toISOString(),atualizado_em:new Date().toISOString()};registroRef.current=novo;setRegistro(novo);dirty.current=atual.current!==snapshot;if(consulta&&exibindoRef.current){const {sala}=await import('@/lib/consultaSala');await sala.mostrar(consulta,id);}await qc.invalidateQueries({queryKey:['terapia-quadros',userId,avaliacao]});return true;}catch(e){setErro(e instanceof Error?e.message:String(e));return false;}finally{salvandoRef.current=false;setOcupado(false);}};
 guardarRef.current=guardar;
 useEffect(()=>{if(!exibindo||!pronto||(!dirty.current&&registroRef.current))return;const timer=setTimeout(()=>void guardarRef.current(),2000);return()=>clearTimeout(timer);},[estado,exibindo,pronto]);
 const mostrar=async(v:boolean)=>{exibindoRef.current=v;setExibindo(v);onExibir?.(v);if(v){if(!(await guardarRef.current())){exibindoRef.current=false;setExibindo(false);onExibir?.(false);}}else if(consulta&&!treino){try{const {sala}=await import('@/lib/consultaSala');await sala.mostrar(consulta,null);}catch(e){setErro(e instanceof Error?e.message:String(e));}}};
 const escolher=(base:BaseQuadro)=>{fila.current=fila.current.then(async()=>{if(salvandoRef.current)return;if(dirty.current&&!(await guardar()))return;if(base.chave===atual.current.base.chave)return;const existentes=qc.getQueryData<QuadroSalvo[]>(['terapia-quadros',userId,avaliacao])??[];const existente=existentes.find(q=>!Array.isArray(q.tracos)&&q.tracos.base?.chave===base.chave);setErro('');setPronto(false);setEstado(!exibindoRef.current&&existente&&!Array.isArray(existente.tracos)?existente.tracos:{base,desenhos:[]});const seguinte=consulta&&exibindoRef.current?undefined:existente;setRegistro(seguinte);registroRef.current=seguinte;setHist(historicoVazio());dirty.current=consulta&&exibindoRef.current?true:false;});};
 const editar=(desenhos:TracoQuadro[])=>{dirty.current=true;setEstado(e=>({...e,desenhos}));};
 /** Guarda o passo atual antes de mudar o desenho, para o Voltar. */
 const passo=()=>{const h=registrar(histRef.current,atual.current.desenhos);histRef.current=h;setHist(h);};
 const voltar=()=>{const r=desfazer(histRef.current,atual.current.desenhos);if(!r)return;histRef.current=r.h;setHist(r.h);editar(r.desenhos);};
 const avancar=()=>{const r=refazer(histRef.current,atual.current.desenhos);if(!r)return;histRef.current=r.h;setHist(r.h);editar(r.desenhos);};
 const limpar=()=>{if(!atual.current.desenhos.length)return;passo();editar([]);};
 const atalhos=useRef({voltar,avancar});atalhos.current={voltar,avancar};
 useEffect(()=>{const tecla=(e:KeyboardEvent)=>{if(!(e.ctrlKey||e.metaKey))return;const alvo=e.target as HTMLElement|null;if(alvo&&(alvo.isContentEditable||/^(INPUT|TEXTAREA|SELECT)$/.test(alvo.tagName)))return;const k=e.key.toLowerCase();if(k==='z'&&!e.shiftKey){e.preventDefault();atalhos.current.voltar();}else if(k==='y'||(k==='z'&&e.shiftKey)){e.preventDefault();atalhos.current.avancar();}};window.addEventListener('keydown',tecla);return()=>window.removeEventListener('keydown',tecla);},[]);
 const pranchas=(config.data?.quadro_pranchas??[]).map(p=>({p,base:basePrancha(p,conteudo)}));
 useEffect(()=>{const onUnload=(e:BeforeUnloadEvent)=>{if(dirty.current&&!treino){e.preventDefault();e.returnValue='';}};window.addEventListener('beforeunload',onUnload);const overflow=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{document.body.style.overflow=overflow;window.removeEventListener('beforeunload',onUnload);};},[]);
 const dimensoes=tamanhoQuadro(800,650);
 const guiadas=config.data?.fotos_guiadas??[];const lista=fotos.data?fotosDoQuadro(fotos.data):[];const usadas=new Set<string>();
 const tiles=treino?fotosTreino.map(f=><FotoTile key={f.tipo} nome={f.titulo} modelo={f.url} escolher={escolher} ocupado={ocupado}/>):[...guiadas.map(g=>{const f=lista.filter(x=>x.tipo===g.chave).sort((a,b)=>Date.parse(b.criado_em)-Date.parse(a.criado_em))[0];if(f)usadas.add(f.id);return <FotoTile key={g.chave} nome={g.titulo} foto={f} modelo={g.modelo} escolher={escolher} ocupado={ocupado}/>;}),...lista.filter(f=>!usadas.has(f.id)).map(f=><FotoTile key={f.id} nome={f.titulo??f.tipo??'Foto'} foto={f} escolher={escolher} ocupado={ocupado}/>)];
 const ultima=lista.map(f=>f.criado_em).sort().at(-1);
 const sairQuadro=async()=>{if(!dirty.current||await guardar()){if(exibindoRef.current)await mostrar(false);fechar();}};
 const ponto=(e:React.PointerEvent<HTMLCanvasElement>)=>{const r=e.currentTarget.getBoundingClientRect();return {x:(e.clientX-r.left)/r.width,y:(e.clientY-r.top)/r.height};};
 const borrar=(p:{x:number;y:number})=>{const antes=atual.current.desenhos;const depois=apagarPerto(antes,p);if(depois.length!==antes.length){apagou.current=true;editar(depois);}};
 const tipoBase=estado.base.foto||estado.base.url?'fotos':estado.base.chave==='vazio'?'vazio':'pranchas';
 const semFotos=!treino&&(!ficha.permissoes.fotos||fotos.data?.permitido===false);
 return <div role={consulta||treino?'region':'dialog'} aria-modal={consulta||treino?undefined:true} aria-label="Quadro de aula" className="mesa-qa qb">
  <header className="qb-topo">
   {videoTopo&&<div className="qa-video">{videoTopo}</div>}
   {(consulta||treino)?<div className={`qb-aviso ${exibindo?'on':''}`}><span role="status" aria-live="polite">{exibindo?'A pessoa está vendo':'Só você está vendo'}</span><label><Switch checked={exibindo} onCheckedChange={v=>void mostrar(v)} disabled={ocupado||!pronto} aria-label="Mostrar o quadro para a pessoa"/>{exibindo?'Esconder':'Mostrar'}</label></div>:<span className="qb-titulo">Quadro de aula</span>}
   <button type="button" className="qb-guardar" disabled={ocupado||!pronto} onClick={()=>void guardar()}>{ocupado?'Guardando…':'Guardar quadro'}</button>
   <button type="button" className="qb-fechar" disabled={ocupado} onClick={()=>void sairQuadro()}><X className="h-5 w-5" aria-hidden/>Fechar</button>
  </header>
  <nav className="qb-bases" aria-label="Base do quadro">
   <button type="button" aria-pressed={tipoBase==='vazio'} disabled={ocupado} onClick={()=>{setEscolha(null);escolher(QUADRO_VAZIO);}}>Quadro em branco</button>
   <button type="button" aria-pressed={tipoBase==='fotos'} aria-expanded={escolha==='fotos'} disabled={ocupado} onClick={()=>setEscolha(escolha==='fotos'?null:'fotos')}>Foto da pessoa</button>
   <button type="button" aria-pressed={tipoBase==='pranchas'} aria-expanded={escolha==='pranchas'} disabled={ocupado} onClick={()=>setEscolha(escolha==='pranchas'?null:'pranchas')}>Pranchas</button>
  </nav>
  {escolha&&<div className="qb-escolha">{escolha==='fotos'?(semFotos?<p className="text-sm">Ela não liberou as fotos</p>:fotos.error?<p role="alert">{fotos.error.message}</p>:!treino&&!fotos.data?<p role="status">Carregando fotos…</p>:tiles.length?<div className="qb-tiras">{tiles}</div>:<p className="text-sm">Nenhuma foto ainda.</p>):config.error?<p role="alert">{config.error.message}</p>:pranchas.length?<div className="qb-tiras">{pranchas.map(({p,base})=><button type="button" key={base.chave} className="qb-prancha" aria-pressed={estado.base.chave===base.chave} disabled={ocupado} onClick={()=>{setEscolha(null);escolher(base);}}><b>{p.titulo}</b>{p.subtitulo&&<span>{p.subtitulo}</span>}</button>)}</div>:<p className="text-sm">Nenhuma prancha ainda.</p>}</div>}
  {erro&&<p role="alert" className="qb-erro">{erro}</p>}
  <div ref={palco} className="qb-palco palcoq">
   <div className="tela" style={{width:`${larguraBase}px`,flexShrink:0}}><canvas ref={canvas} width={dimensoes.width} height={dimensoes.height} className={`quadro-canvas ${ferramenta==='borracha'?'borracha':''}`} aria-label={`Quadro: ${estado.base.nome}`}
    onPointerDown={e=>{if(salvandoRef.current||!pronto)return;const p=ponto(e);e.currentTarget.setPointerCapture(e.pointerId);desenhando.current=true;passo();if(ferramenta==='borracha'){apagou.current=false;borrar(p);return;}editar([...atual.current.desenhos,{tipo:'pincel',cor,w:largura,pontos:[p,{x:p.x+.0001,y:p.y+.0001}]}]);}}
    onPointerMove={e=>{if(!desenhando.current)return;const p=ponto(e);if(ferramenta==='borracha'){borrar(p);return;}editar(atual.current.desenhos.map((d,n,a)=>n===a.length-1?{...d,pontos:[...d.pontos,p]}:d));}}
    onPointerUp={()=>{if(desenhando.current&&ferramenta==='borracha'&&!apagou.current){const h={...histRef.current,passado:histRef.current.passado.slice(0,-1)};histRef.current=h;setHist(h);}desenhando.current=false;}} onPointerCancel={()=>{desenhando.current=false;}}/></div>
   {estado.base.chave==='vazio'&&estado.desenhos.length===0&&<div className="vazio">Desenhe aqui, ou escolha acima uma foto da pessoa ou uma prancha.</div>}
  </div>
  <div className="qb-barra" role="toolbar" aria-label="Ferramentas do quadro">
   <div className="qb-grupo">{CORES_QUADRO.map(c=><button type="button" key={c} aria-label={NOMES_CORES[c]} title={NOMES_CORES[c]} aria-pressed={ferramenta==='pincel'&&cor===c} className={`q-cor quadro-cor-${c}`} onClick={()=>{setCor(c);setFerramenta('pincel');}}/>)}</div>
   <div className="qb-grupo">{([['fino','Fino'],['grosso','Grosso']] as const).map(([k,n])=><button type="button" key={k} className="q" aria-pressed={ferramenta==='pincel'&&largura===TRACOS_QUADRO[k]} onClick={()=>{setLargura(TRACOS_QUADRO[k]);setFerramenta('pincel');}}><i className={`qb-espessura ${k}`} aria-hidden/>{n}</button>)}
    <button type="button" className="q" aria-pressed={ferramenta==='borracha'} onClick={()=>setFerramenta(ferramenta==='borracha'?'pincel':'borracha')}><Eraser className="h-4 w-4" aria-hidden/>Borracha</button></div>
   <div className="qb-grupo">
    <button type="button" className="q" disabled={!hist.passado.length} onClick={voltar} title="Ctrl+Z"><Undo2 className="h-4 w-4" aria-hidden/>Voltar</button>
    <button type="button" className="q" disabled={!hist.futuro.length} onClick={avancar} title="Ctrl+Y"><Redo2 className="h-4 w-4" aria-hidden/>Avançar</button>
    <button type="button" className="q" disabled={!estado.desenhos.length} onClick={limpar}><Trash2 className="h-4 w-4" aria-hidden/>Limpar tudo</button></div>
  </div>
 </div>;
}
