import { createRoot } from 'react-dom/client';
import { QueryClient,QueryClientProvider } from '@tanstack/react-query';
import Quadro from '@/components/terapia/quadro/Quadro';
import './index.css';
const qc=new QueryClient();
qc.setQueryData(['sala-treino-config'],{quadro_pranchas:[{titulo:'Mapa da língua',fonte:'DESENHO'},{titulo:'Corpo',subtitulo:'regiões',linhas:['Cabeça','Peito']}]});
const ficha={nome:'Maria Exemplo',paciente_id:'x',permissoes:{fotos:true,teste:true}} as never;
const conteudo={DHATUS:[],SD:{},SD_ROWS:[],MALAS:[],DEF:{}} as never;
createRoot(document.getElementById('root')!).render(<QueryClientProvider client={qc}><div className="mesa" style={{['--mesa-hdr' as string]:'0px'}}><Quadro treino avaliacao="t" ficha={ficha} conteudo={conteudo} fechar={()=>alert('fechar')} fotosTreino={[{tipo:'lingua',titulo:'Língua',url:'/placeholder.svg'}]} videoTopo={<><div className="slot"/><div className="ctl"/></>}/></div></QueryClientProvider>);
