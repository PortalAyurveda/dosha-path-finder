import {describe,it,expect} from 'vitest';
import {sugereNivel} from './terapiaAvaliacao';
import {basePrancha,CORES_QUADRO} from './terapiaQuadro';
import {enderecoTreinoPessoa} from './consultaSala';
import type {ConteudoFicha} from './terapiaAvaliacao';
const c={DHATUS:[{n:'Rasa',t:'Plasma',f:'fornecer alimento'}],SD_ROWS:[['Movimento','prana','sadhaka','tarpaka']],SD:{prana:{n:'Prana'},sadhaka:{n:'Sadhaka'},tarpaka:{n:'Tarpaka'}},MALAS:[['Fezes','secas','soltas','pesadas']]} as unknown as ConteudoFicha;
describe('Parte 14 · mesa de trabalho',()=>{
 it('a soma sugere de 0 a 3, proporcional ao maior dos três',()=>{expect(sugereNivel(0,4)).toBe(0);expect(sugereNivel(-2,4)).toBe(0);expect(sugereNivel(4,4)).toBe(3);expect(sugereNivel(2,4)).toBe(2);expect(sugereNivel(1,6)).toBe(1);});
 it('prancha com fonte DHATUS, SD_ROWS ou MALAS lê as linhas da ficha',()=>{expect(basePrancha({titulo:'Os 7 dhatus',fonte:'DHATUS'},c).linhas).toEqual([{b:'Rasa',t:'Plasma',m:'fornecer alimento'}]);expect(basePrancha({titulo:'Subdoshas',fonte:'SD_ROWS'},c).linhas?.[0]).toEqual({b:'Prana · Sadhaka · Tarpaka',m:'Movimento'});expect(basePrancha({titulo:'Malas',fonte:'MALAS'},c).linhas?.[0].t).toBe('V secas · P soltas · K pesadas');});
 it('prancha "desenho" é o mapa da língua; linhas e texto vêm da própria prancha',()=>{expect(basePrancha({titulo:'Mapa da língua',fonte:'desenho'},c).desenho).toBe('lingua');const p=basePrancha({titulo:'Agni x Ama',linhas:[['Agni','transformação']],texto:'Ama é o que não foi digerido.'},c);expect(p.linhas).toEqual([{b:'Agni',t:'transformação',m:undefined}]);expect(p.texto).toBe('Ama é o que não foi digerido.');});
 it('quatro cores no quadro: vermelho, amarelo, azul e roxo escuro',()=>expect(CORES_QUADRO).toEqual(['destructive','accent','vata','primary']));
 it('o endereço da pessoa no treino usa o código da pessoa',()=>expect(enderecoTreinoPessoa('https://x.com','ab c')).toBe('https://x.com/consulta/treino/pessoa?c=ab%20c'));
});
