import {useState} from 'react';
import {Navigate,useSearchParams} from 'react-router-dom';
import {Helmet} from 'react-helmet-async';
import {useUser} from '@/contexts/UserContext';
import VideoConsulta from '@/components/terapia/sala/VideoConsulta';
import '@/components/terapia/mesa/mesa.css';
import '@/components/terapia/sala/sala.css';
/** Sala de treino vista como a pessoa, em outro aparelho: só o vídeo, com a faixa "Sala de treino". */
export default function ConsultaTreinoPessoa() {
 const [params]=useSearchParams();const codigo=params.get('c')??'';const {user,loading,isAnonymous}=useUser();const [saiu,setSaiu]=useState(false);
 if(loading)return <p role="status" className="p-8">Carregando…</p>;
 if(!user||isAnonymous)return <Navigate to={`/entrar?redirect=${encodeURIComponent(`/consulta/treino/pessoa?c=${codigo}`)}`} replace/>;
 return <div className="mesa sala-p"><Helmet><title>Sala de treino | Portal Ayurveda</title><meta name="robots" content="noindex, nofollow"/></Helmet><div className="sala-p-faixa">Sala de treino</div><header className="sala-p-hdr"><b>Consulta de treino</b></header>{!codigo?<p role="alert" className="p-6">Endereço de treino incompleto. Copie de novo na sala de treino.</p>:saiu?<div className="sala-p-centro"><div className="sala-fim"><h1>Você saiu do treino</h1><button type="button" className="m-btn pri" onClick={()=>setSaiu(false)}>Entrar de novo</button></div></div>:<main className="sala-p-main"><VideoConsulta codigo={codigo} consulta="treino" treino terapeuta={false} sair={()=>setSaiu(true)}/></main>}</div>;
}
