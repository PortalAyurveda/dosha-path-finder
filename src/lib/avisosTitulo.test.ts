import {afterEach,beforeEach,expect,it,vi} from 'vitest';
import {avisoTitulo} from './avisosTitulo';
beforeEach(()=>{vi.useFakeTimers();document.title='Portal';Object.defineProperty(document,'hidden',{configurable:true,value:true});});
afterEach(()=>{avisoTitulo('mensagem',null);avisoTitulo('consulta',null);vi.useRealTimers();});
it('mensagem escondida alterna e restaura título',()=>{avisoTitulo('mensagem','(1) Nova mensagem');vi.advanceTimersByTime(1000);expect(document.title).toBe('(1) Nova mensagem');vi.advanceTimersByTime(1000);expect(document.title).toBe('Portal');avisoTitulo('mensagem',null);expect(document.title).toBe('Portal');});
it('consulta tem prioridade sem disputar título',()=>{avisoTitulo('mensagem','(1) Nova mensagem');avisoTitulo('consulta','(1) Pedido de consulta');vi.advanceTimersByTime(1000);expect(document.title).toBe('(1) Pedido de consulta');avisoTitulo('consulta',null);vi.advanceTimersByTime(1000);expect(document.title).toBe('(1) Nova mensagem');});
it('não sobrescreve novo título de página ao limpar',()=>{avisoTitulo('mensagem','(1) Nova mensagem');vi.advanceTimersByTime(1000);document.title='Minha Rotina';avisoTitulo('mensagem',null);expect(document.title).toBe('Minha Rotina');});
it('visível não pisca',()=>{Object.defineProperty(document,'hidden',{configurable:true,value:false});avisoTitulo('mensagem','(1) Nova mensagem');vi.advanceTimersByTime(1000);expect(document.title).toBe('Portal');});
