const avisos=new Map<string,string>();
let timer:ReturnType<typeof setInterval>|undefined, original='', ultimo='';
function restaurar(){if(document.title===ultimo)document.title=original;}
export function avisoTitulo(chave:string,texto:string|null){
 if(texto)avisos.set(chave,texto);else avisos.delete(chave);
 if(!avisos.size){if(timer)clearInterval(timer);timer=undefined;restaurar();return;}
 if(timer)return;
 original=document.title;
 timer=setInterval(()=>{if(!document.hidden){restaurar();return;}if(document.title!==ultimo)original=document.title;const mensagem=avisos.get('consulta')??avisos.values().next().value??'';ultimo=document.title===mensagem?original:mensagem;document.title=ultimo;},1000);
}
