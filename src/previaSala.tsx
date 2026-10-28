import { createRoot } from 'react-dom/client';
import { useState } from 'react';
import { QueryClient,QueryClientProvider,useQuery } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { Editor } from '@/pages/AvaliacaoTerapeuta';
import { fichaTreino } from '@/lib/consultaSala';
import { terapia } from '@/lib/terapia';
import '@/components/terapia/sala/sala.css';
import './index.css';
const qc=new QueryClient({defaultOptions:{queries:{retry:false}}});
qc.setQueryData(['sala-treino-config'],{quadro_pranchas:[{titulo:'Mapa da língua',fonte:'DESENHO'}]});
const t={titulo:'Treino',texto:'',paciente:{nome:'Ana Exemplo',teste:{vata:12,pitta:8,kapha:5,dosha:'Vata',agni:'Agni irregular',queixas:['Insônia','Prisão de ventre']}},fotos:[{tipo:'lingua',titulo:'Língua',url:'/placeholder.svg'}]};
const VAZIO={SIST:{},SINT:{},DEF:{},COMUNS:[],DHATUS:[],SD_ROWS:[],SD:{},MALAS:[]} as never;
function App(){const c=useQuery({queryKey:['c'],queryFn:terapia.fichaConteudo});const [p,setP]=useState(0);if(c.isPending)return <p>…</p>;
 const ficha=fichaTreino(t);const a={id:'treino',paciente_id:'treino',paciente_nome:'Ana Exemplo',consulta_id:null,consulta_inicio:null,dados:{},leitura:null,resumo:'',criado_em:new Date().toISOString(),atualizado_em:new Date().toISOString()};
 return <div className="mesa"><main className="mesa-sala"><section className="mesa-sala-video"><div style={{padding:12}}><button className="m-grav-btn" onClick={()=>setP(n=>n+1)}>Mostrar na tela</button></div><div style={{flex:1,minHeight:200}}>vídeo</div></section><aside className="mesa-sala-ficha"><Editor embedded treino pedirQuadro={p} avaliacao={a as never} ficha={ficha} conteudo={c.data??VAZIO} biblioteca={{}} fotosTreino={t.fotos}/></aside></main></div>;}
createRoot(document.getElementById('root')!).render(<QueryClientProvider client={qc}><BrowserRouter><App/></BrowserRouter></QueryClientProvider>);
