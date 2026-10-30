import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
const api=vi.hoisted(()=>({solicitar:vi.fn(),meu:vi.fn(),salvar:vi.fn(),enviar:vi.fn(),cancelar:vi.fn(),sugestao:vi.fn()}));
vi.mock('@/lib/terapiaPedidos',async importOriginal=>({...await importOriginal<typeof import('@/lib/terapiaPedidos')>(),pedidos:api}));
vi.mock('@/contexts/UserContext',()=>({useUser:()=>({user:{id:'paciente'},isAnonymous:false,profile:{nome:'Ana'}})}));
vi.mock('@/components/terapia/meu/Nascimento',()=>({default:()=>null}));
vi.mock('@/components/terapia/meu/MeuTerapeutaFotos',()=>({default:()=>null}));
import AgendamentoPublico from './AgendamentoPublico';
const base={id:'p',inicio:'2099-10-27T12:00:00Z',fim:'2099-10-27T13:00:00Z',pedido_inicio:'2099-10-27T12:00:00Z',motivo:null,permissoes:{teste:true,fotos:false,rotina:true,akasha:false},terapeuta:{id:'t',nome:'Juliana',primeiro_nome:'Juliana',imagem:null,slug:'juliana'}};
const tela=()=>render(<MemoryRouter><QueryClientProvider client={new QueryClient({defaultOptions:{queries:{retry:false}}})}><AgendamentoPublico slug="juliana" nome="Juliana" agenda={{no_sistema:true,pedir_nascimento:false,horarios:[]}} atualizar={vi.fn().mockResolvedValue(undefined)} /></QueryClientProvider></MemoryRouter>);
beforeEach(()=>{sessionStorage.clear();vi.clearAllMocks();api.meu.mockResolvedValue(null);});
afterEach(cleanup);
describe('pedido de consulta',()=>{
  it('guarda o horário, envia o pedido e não marca direto',async()=>{
    api.solicitar.mockResolvedValue({...base,status:'preenchendo',guardado_ate:'2099-10-27T11:00:00Z'});
    api.enviar.mockResolvedValue({...base,status:'aguardando',guardado_ate:base.inicio,motivo:'Sono'});
    sessionStorage.setItem('agenda-escolha:juliana',base.inicio);
    tela();
    await waitFor(()=>expect(api.solicitar).toHaveBeenCalledWith('juliana',base.inicio));
    fireEvent.change(await screen.findByRole('textbox'),{target:{value:'Sono'}});
    fireEvent.click(screen.getByRole('button',{name:'Enviar pedido para Juliana'}));
    await waitFor(()=>expect(api.enviar).toHaveBeenCalledWith('p','Sono',{teste:true,fotos:false,rotina:true,akasha:false}));
    expect(await screen.findByText('Pedido enviado. Juliana vai confirmar.')).toBeInTheDocument();
  });
  it('horário guardado vencido não deixa enviar',async()=>{
    api.solicitar.mockResolvedValue({...base,status:'preenchendo',guardado_ate:'2020-01-01T00:00:00Z'});
    sessionStorage.setItem('agenda-escolha:juliana',base.inicio);
    tela();
    expect(await screen.findByRole('button',{name:'Enviar pedido para Juliana'})).toBeDisabled();
  });
  it('sugestão da terapeuta pode ser aceita',async()=>{
    api.meu.mockResolvedValue({...base,status:'sugerida',guardado_ate:base.inicio,sugerido_inicio:'2099-10-28T12:00:00Z',sugerido_fim:'2099-10-28T13:00:00Z'});
    api.sugestao.mockResolvedValue({...base,status:'confirmada',consulta_id:'c',guardado_ate:base.inicio});
    tela();
    fireEvent.click(await screen.findByRole('button',{name:'Aceitar este horário'}));
    await waitFor(()=>expect(api.sugestao).toHaveBeenCalledWith('p',true));
    expect(await screen.findByText('Consulta confirmada')).toBeInTheDocument();
    expect(api.solicitar).not.toHaveBeenCalled();
  });
});
