import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus,Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import CTAButton from '@/components/CTAButton';
import { terapia } from '@/lib/terapia';
import type { Painel } from '@/lib/terapia';
import { novoAcervo } from '@/lib/terapiaAcervo';
import type { ItemAcervo } from '@/lib/terapiaAcervo';
import ModelosPessoais from './ModelosPessoais';
import Editor from './Editor';
import { EfeitosAcervo } from './Conteudo';
export default function MeuAcervo({userId,painel}:{userId?:string;painel:Painel}) {
 const q=useQuery({queryKey:['terapia-acervo',userId],queryFn:terapia.acervo});const cfg=useQuery({queryKey:['terapia-config'],queryFn:terapia.config});const [busca,setBusca]=useState('');const [tipo,setTipo]=useState('');const [editor,setEditor]=useState<ItemAcervo|null>(null);const [erro,setErro]=useState('');const [ocupado,setOcupado]=useState(false);
 const slug=painel.terapeuta.link_perfil.replace(/\/$/,'').split('/').pop()??painel.terapeuta.id;
 const apagar=async(i:ItemAcervo)=>{if(!i.id||!window.confirm(`Apagar “${i.titulo}”?`))return;setOcupado(true);try{const path=await terapia.acervoApagar(i.id);if(path)await terapia.arquivoApagar('terapeutas-acervo',path);await q.refetch();}catch(e){setErro(e instanceof Error?e.message:String(e));}finally{setOcupado(false);}};
 if(q.error||cfg.error)return <p role="alert">{q.error?.message??cfg.error?.message}</p>;
 if(!q.data||!cfg.data)return <p role="status">Carregando acervo…</p>;
 if(editor&&userId)return <Editor key={editor.id??'novo'} inicial={editor} opcoes={cfg.data.acervo_opcoes} userId={userId} slug={slug} cancelar={()=>setEditor(null)} salvo={()=>{setEditor(null);void q.refetch();}}/>;
 const itens=q.data.filter(i=>(!tipo||i.tipo===tipo)&&`${i.titulo} ${i.resumo} ${i.tags.join(' ')}`.toLowerCase().includes(busca.toLowerCase()));
 return <><div className="flex flex-wrap items-center gap-3"><Input aria-label="Buscar no meu acervo" placeholder="Buscar no meu acervo" value={busca} onChange={e=>setBusca(e.target.value)} className="min-w-0 flex-1"/><CTAButton className="h-10 px-4 py-2 text-sm" onClick={()=>setEditor(novoAcervo())}><Plus className="mr-2 h-4 w-4"/>Criar</CTAButton></div><nav aria-label="Filtrar acervo" className="my-5 flex flex-wrap gap-2">{[{chave:'',nome:'Tudo'},...cfg.data.acervo_opcoes.tipos,{chave:'modelos',nome:'Modelos'}].map(t=><Button key={t.chave} variant="outline" size="sm" aria-pressed={tipo===t.chave} className={tipo===t.chave?'border-secondary bg-secondary/10':''} onClick={()=>setTipo(t.chave)}>{t.nome}</Button>)}</nav>{erro&&<p role="alert">{erro}</p>}{tipo==='modelos'?<ModelosPessoais busca={busca} userId={userId}/>:<><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{itens.map(i=><article key={i.id} className="min-w-0 rounded-lg border border-border bg-card p-4"><p className="text-xs text-muted-foreground">{i.tipo} · {i.revisao}</p><h2 className="mt-2 break-words font-serif text-lg font-bold">{i.titulo}</h2><p className="mt-2 text-sm text-muted-foreground">{i.resumo}</p><EfeitosAcervo item={i}/><div className="flex justify-between"><Button variant="outline" size="sm" onClick={()=>setEditor(i)}>Editar</Button><Button variant="ghost" size="icon" aria-label={`Apagar ${i.titulo}`} disabled={ocupado} onClick={()=>void apagar(i)}><Trash2 className="h-4 w-4"/></Button></div></article>)}</div>{!itens.length&&<p className="py-8 text-sm text-muted-foreground">Nenhum item encontrado.</p>}</>}</>;
}