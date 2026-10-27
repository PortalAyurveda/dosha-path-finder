import { describe,it,expect,vi,beforeEach } from 'vitest';
import { conteudoUnico, novoAcervo, textoDoAcervo, tipoDoAnexo } from './terapiaAcervo';
import { modelosTerapia, ordenarPorTeste, alternarDoshaModelo, DURACOES_FOLHA } from './terapiaModelos';
const mocks=vi.hoisted(()=>({rpc:vi.fn()}));
vi.mock('@/integrations/supabase/client',()=>({supabase:{rpc:mocks.rpc}}));
describe('Parte 26: conteúdo único',()=>{
 it.each([['','', 'texto'],['foto','','foto'],['pdf','','arquivo'],['link','https://youtu.be/abc','aula'],['link','https://example.com','link']] as const)('anexo %s e link %s gravam tipo %s',(a,l,t)=>expect(tipoDoAnexo(a,l)).toBe(t));
 it('preserva ingredientes, preparo, duração e dica no texto',()=>{const i={...novoAcervo(),resumo:'Introdução',periodo:'Manhã',conteudo:{ingredientes:[{quantidade:'2',item:'maçãs'}],passos:['Cozinhar'],duracao:'10 minutos',dica:'Morno',esperar:'Conforto'}};const t=textoDoAcervo(i);expect(t).toContain('Ingredientes\n2 maçãs');expect(t).toContain('Modo de preparo\n1. Cozinhar');expect(t).toContain('Duração\n10 minutos');expect(t).toContain('Dica\nMorno');expect(t).toContain('O que esperar\nConforto');expect(t).toContain('Melhor horário\nManhã');});
 it('substitui campos específicos pelo texto e não duplica na próxima abertura',()=>{const p=conteudoUnico({...novoAcervo(),resumo:'Antigo',conteudo:{ingredientes:[{quantidade:'1',item:'água'}]}},'Ingredientes\n1 água','','');expect(p.conteudo).toEqual({texto:'Ingredientes\n1 água'});expect(textoDoAcervo(p)).toBe('Ingredientes\n1 água');expect(p.resumo).toBe('');});
 it('retirar anexo remove arquivo da referência salva',()=>expect(conteudoUnico({...novoAcervo(),arquivo_path:'u/a.pdf'},'Texto','','').arquivo_path).toBeNull());
});
describe('Parte 26: folhas prontas',()=>{
 it('limita a seleção a um ou dois doshas e mantém a ordem aceita pelo banco',()=>{expect(alternarDoshaModelo('vata-pitta','kapha')).toBe('vata-pitta');expect(alternarDoshaModelo('kapha','vata')).toBe('vata-kapha');expect(alternarDoshaModelo('vata-pitta','pitta')).toBe('vata');});
 it('oferece somente 7, 14, 21 ou 30 dias',()=>expect(DURACOES_FOLHA).toEqual([7,14,21,30]));
 beforeEach(()=>{mocks.rpc.mockReset();mocks.rpc.mockResolvedValue({data:'novo-id',error:null});});
 it('grava diretamente com os cinco momentos, tratamento e duração',async()=>{const p={nome:'Vata',dosha:'vata-pitta',serve_para:['Gases'],duracao_dias:21,tratamento:'Dar ritmo',dados:{secoes:{manha:[],refeicoes:[],noite:[],todo_dia:[],ler:[]}}};await modelosTerapia.gravar(p);expect(mocks.rpc).toHaveBeenCalledWith('terapia_modelo_gravar',{p});});
 it('copia por id e devolve id da cópia',async()=>{expect(await modelosTerapia.copiar('portal-id')).toBe('novo-id');expect(mocks.rpc).toHaveBeenCalledWith('terapia_modelo_copiar',{p_id:'portal-id'});});
 it('marca folha com sintomas correspondentes mesmo sem dosha igual',()=>{const lista=[{id:'1',nome:'Uma',itens:1,usos:0,dosha:'kapha',serve_para:['Azia']},{id:'2',nome:'Outra',itens:1,usos:0,dosha:'kapha',serve_para:['Gases']}];const r=ordenarPorTeste(lista,'pitta',['Gases']);expect(r.map(m=>[m.id,m.combina])).toEqual([['2',true],['1',false]]);});
});