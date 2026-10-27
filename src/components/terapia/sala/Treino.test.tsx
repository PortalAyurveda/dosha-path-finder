import {describe,it,expect,vi} from 'vitest';
import {render,screen,fireEvent,waitFor} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import {QueryClient,QueryClientProvider} from '@tanstack/react-query';
vi.mock('@/lib/terapia',()=>({terapia:{avaliacaoSalvar:vi.fn(),bibliotecaSalvar:vi.fn()},diaBR:()=>''}));
vi.mock('@/components/terapia/avaliacao/Setores',()=>({default:()=>null}));
import {terapia} from '@/lib/terapia';
import {Editor} from '@/pages/AvaliacaoTerapeuta';
import {fichaTreino} from '@/lib/consultaSala';
import type {ConteudoFicha} from '@/lib/terapiaAvaliacao';
describe('Sala de treino',()=>{
 it('concluir no treino não escreve na avaliação real',async()=>{
  window.matchMedia=vi.fn().mockReturnValue({matches:true});
  const ficha=fichaTreino({titulo:'Treino',texto:'',fotos:[],paciente:{nome:'Paciente exemplo',teste:{vata:41,pitta:22,kapha:30,dosha:'Vata',agni:'Irregular',queixas:[]}}});
  render(<QueryClientProvider client={new QueryClient()}><MemoryRouter><Editor embedded treino ficha={ficha} userId="treino" biblioteca={{}} conteudo={{AGNIS:[],DEF:{},SINT:{}} as unknown as ConteudoFicha} avaliacao={{id:'treino',paciente_id:'treino',paciente_nome:'Paciente exemplo',consulta_id:null,consulta_inicio:null,dados:{},leitura:null,resumo:'',criado_em:'2026-10-26',atualizado_em:'2026-10-26'}}/></MemoryRouter></QueryClientProvider>);
  fireEvent.click(screen.getAllByRole('button',{name:'Concluir avaliação'})[0]);
  await waitFor(()=>expect(terapia.avaliacaoSalvar).not.toHaveBeenCalled());
  expect(terapia.bibliotecaSalvar).not.toHaveBeenCalled();
 });
});