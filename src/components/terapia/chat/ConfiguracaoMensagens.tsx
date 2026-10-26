import {useState} from 'react';
import {Textarea} from '@/components/ui/textarea';
import {Button} from '@/components/ui/button';
import {chat} from '@/lib/terapiaChat';
import type {Painel} from '@/lib/terapia';
export default function ConfiguracaoMensagens({painel,atualizar}:{painel:Painel;atualizar:()=>Promise<unknown>}){
 const [boas,setBoas]=useState(painel.sistema.boas_vindas??'');const [fora,setFora]=useState(painel.sistema.msg_ausente??'');const [erro,setErro]=useState('');const [ocupado,setOcupado]=useState(false);const [salvo,setSalvo]=useState(false);
 return <form className="space-y-3 border-t border-border pt-5" onSubmit={async e=>{e.preventDefault();setOcupado(true);setErro('');setSalvo(false);try{await chat.preferencias(boas,fora);await atualizar();setSalvo(true);}catch(e){setErro(e instanceof Error?e.message:String(e));}finally{setOcupado(false);}}}><h2 className="font-serif font-semibold">Mensagens</h2><label className="block text-sm">Boas-vindas (aparece quando alguém abre uma conversa com você)<Textarea className="mt-2" value={boas} onChange={e=>{setBoas(e.target.value);setSalvo(false);}}/></label><label className="block text-sm">Resposta de ausente (vai quando você está fora do site, no máximo uma vez a cada 12 horas)<Textarea className="mt-2" value={fora} onChange={e=>{setFora(e.target.value);setSalvo(false);}}/></label><Button variant="secondary" disabled={ocupado}>Salvar mensagens</Button>{erro&&<p role="alert">{erro}</p>}{salvo&&<p role="status" className="text-sm">Mensagens salvas.</p>}</form>;
}
