import {describe,it,expect} from 'vitest';
import {novaMensagemDaOutra,type Mensagem} from './terapiaChat';
import {tempoPedido} from './terapiaPublica';
import {origemIndicacao} from './terapiaIndicacoes';
const mensagem=(id:number,autor:Mensagem['autor']):Mensagem=>({id,autor,texto:'',criado_em:'',lida_em:null});
describe('Regras da Parte 16',()=>{
 it('chat só marca leitura com mensagem nova da outra pessoa',()=>{expect(novaMensagemDaOutra([mensagem(1,'paciente'),mensagem(2,'terapeuta')],'terapeuta',1)).toBeUndefined();expect(novaMensagemDaOutra([mensagem(3,'paciente')],'terapeuta',1)?.id).toBe(3);expect(novaMensagemDaOutra([mensagem(4,'sistema')],'terapeuta',1)).toBeUndefined();});
 it('tempo do pedido usa expira_em e para em zero',()=>{const agora=Date.parse('2026-10-26T21:00:00Z');expect(tempoPedido('2026-10-26T21:02:15Z',agora)).toBe('2:15');expect(tempoPedido('2026-10-26T20:59:00Z',agora)).toBe('0:00');});
 it('origem do material preserva acervo sem atribuir texto livre ao Portal',()=>{expect(origemIndicacao({tipo:'texto'})).toBe('');expect(origemIndicacao({tipo:'material',origem:'acervo'})).toBe('Do seu acervo');expect(origemIndicacao({tipo:'produto'})).toBe('Produto Samkhya');expect(origemIndicacao({tipo:'receita',favorito:true})).toBe('Receita do Portal');});
});