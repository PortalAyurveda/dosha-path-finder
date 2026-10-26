import type { ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { terapia,diaBR } from '@/lib/terapia';
import { textosMarcados } from '@/lib/terapiaPaciente';
import type { FichaPaciente } from '@/lib/terapiaPaciente';
import type { AvaliacaoLista } from '@/lib/terapiaAvaliacao';
import './mesa.css';

/** Barra fina e escura da mesa de trabalho. Sem `nome`, lê o primeiro nome da terapeuta logada. */
export function MesaHeader({nome,userId,direita}:{nome?:string;userId?:string;direita?:ReactNode}) {
 const painel=useQuery({queryKey:['mesa-terapeuta',userId],queryFn:terapia.painel,enabled:!nome&&!!userId,staleTime:10*60*1000});
 return <header className="mesa-hdr"><b>Portal Ayurveda · Portal do terapeuta</b>{direita??<span>{nome??painel.data?.terapeuta.primeiro_nome??''}</span>}</header>;
}

const PONTOS=[['V','vata','Vata'],['P','pitta','Pitta'],['K','kapha','Kapha']] as const;
/** Corpo do teste da pessoa (só leitura), usado na coluna da ficha, na sala e na aba Teste do quadro. */
export function TesteCorpo({ficha,anterior}:{ficha:FichaPaciente;anterior?:AvaliacaoLista}) {
 const t=ficha.teste;
 return <>
  {ficha.permissoes.teste&&t&&<p className="m-muted">{[t.idade!=null?`${t.idade} anos`:null,[t.cidade,t.estado].filter(Boolean).join('/')||null,t.data?`teste de ${diaBR(t.data)}`:null].filter(Boolean).join(' · ')}</p>}
  {!ficha.permissoes.teste||!t?<p className="m-muted">{!ficha.permissoes.teste?"A pessoa não liberou o teste.":"Ainda não fez o teste"}</p>:<>
   <section><h3 className="m-eti">Teste de dosha (pontos)</h3><div><span className="m-tag">{PONTOS.map(([,k,n])=>`${n} ${t[k]??''}`).join(' · ')}</span>{t.agni&&<span className="m-tag">{t.agni}</span>}</div></section>
   {(ficha.pontos_atencao??[]).some(p=>p.completo)&&<section><h3 className="m-eti">Pontos de atenção</h3><div>{(ficha.pontos_atencao??[]).filter(p=>p.completo).map(p=><span key={p.slug} className="m-tag at" title={`Marcou ${p.marcou.length} de ${p.total}: ${p.marcou.join(', ')}`}>{p.nome}</span>)}</div></section>}
   {([['Queixas que marcou',textosMarcados(t.queixas)],['Come muito',textosMarcados(t.alimentos)]] as const).map(([titulo,itens])=>itens.length>0&&<section key={titulo}><h3 className="m-eti">{titulo}</h3><div>{itens.map(i=><span key={i} className="m-tag">{i}</span>)}</div></section>)}
   {t.relato&&<section><h3 className="m-eti">O que escreveu</h3><p className="m-rel whitespace-pre-wrap">“{t.relato}”</p></section>}
  </>}
  {anterior&&<section><h3 className="m-eti">Avaliação anterior · {diaBR(anterior.criado_em)}</h3><div><span className="m-tag">{PONTOS.map(([d])=>`${d}${anterior.leitura?.[d]??0}`).join(' · ')}</span></div>{anterior.resumo&&<p className="m-muted whitespace-pre-wrap">{anterior.resumo}</p>}</section>}
 </>;
}
