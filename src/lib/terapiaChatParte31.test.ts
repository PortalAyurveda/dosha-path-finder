import {describe,it,expect} from 'vitest';
import {linkConversa,primeirasPalavras,marcarAberta,estaAberta} from './terapiaChat';
const c={id:'c1',terapeuta:{id:'t',nome:'Ana',primeiro_nome:'Ana',imagem:null,slug:'ana-silva',online:false}};
describe('Parte 31',()=>{
 it('terapeuta abre a conversa nas mensagens',()=>expect(linkConversa('terapeuta',c)).toBe('/painel-terapeuta?aba=mensagens&conversa=c1'));
 it('pessoa abre o bloco da conversa com a terapeuta',()=>expect(linkConversa('paciente',c)).toBe('/meu-acompanhamento?aba=conversa&terapeuta=ana-silva'));
 it('corta nas primeiras palavras',()=>expect(primeirasPalavras('um dois tres quatro',9)).toBe('um dois…'));
 it('conversa aberta conta até sair',()=>{const sair=marcarAberta('x');expect(estaAberta('x')).toBe(true);sair();expect(estaAberta('x')).toBe(false);});
});
