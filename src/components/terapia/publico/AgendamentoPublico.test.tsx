import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
const api=vi.hoisted(()=>({reservar:vi.fn(),marcarPublico:vi.fn()}));
vi.mock('@/lib/terapia',async importOriginal=>({...await importOriginal<typeof import('@/lib/terapia')>(),terapia:api}));
vi.mock('@/contexts/UserContext',()=>({useUser:()=>({user:{id:'paciente'},isAnonymous:false,profile:{nome:'Ana'}})}));
vi.mock('@/components/terapia/meu/Nascimento',()=>({default:()=>null}));
import AgendamentoPublico from './AgendamentoPublico';
beforeEach(()=>{sessionStorage.clear();vi.clearAllMocks();api.reservar.mockResolvedValue('2099-10-27T12:15:00Z');api.marcarPublico.mockResolvedValue({consulta:'c',inicio:'2099-10-27T12:00:00Z',fim:'2099-10-27T13:00:00Z'});});
afterEach(cleanup);
describe('agendamento público',()=>{
  it('reserva antes de confirmar e cria consulta pública com motivo e Akasha desmarcada',async()=>{
    sessionStorage.setItem('agenda-escolha:juliana','2099-10-27T12:00:00Z');
    const atualizar=vi.fn().mockResolvedValue(undefined);
    render(<MemoryRouter><QueryClientProvider client={new QueryClient({defaultOptions:{queries:{retry:false}}})}><AgendamentoPublico slug="juliana" nome="Juliana" agenda={{no_sistema:true,pedir_nascimento:false,horarios:[]}} atualizar={atualizar} /></QueryClientProvider></MemoryRouter>);
    await waitFor(()=>expect(api.reservar).toHaveBeenCalledWith('juliana','2099-10-27T12:00:00Z'));
    await waitFor(()=>expect(screen.getByRole('button',{name:'Confirmar consulta'})).toBeEnabled());
    fireEvent.change(screen.getByRole('textbox'),{target:{value:'Sono'}});
    fireEvent.click(screen.getByRole('button',{name:'Confirmar consulta'}));
    await waitFor(()=>expect(api.marcarPublico).toHaveBeenCalledWith('juliana','2099-10-27T12:00:00Z','Sono',{teste:true,fotos:true,rotina:true,akasha:false}));
    await waitFor(()=>expect(atualizar).toHaveBeenCalledTimes(1));
    expect(sessionStorage.getItem('agenda-escolha:juliana')).toBeNull();
  });
  it('reserva expirada não permite confirmação',async()=>{
    api.reservar.mockResolvedValueOnce('2020-01-01T00:00:00Z');
    sessionStorage.setItem('agenda-escolha:juliana','2099-10-27T12:00:00Z');
    render(<MemoryRouter><QueryClientProvider client={new QueryClient()}><AgendamentoPublico slug="juliana" nome="Juliana" agenda={{no_sistema:true}} atualizar={vi.fn()} /></QueryClientProvider></MemoryRouter>);
    await waitFor(()=>expect(api.reservar).toHaveBeenCalled());
    expect(screen.getByRole('button',{name:'Confirmar consulta'})).toBeDisabled();
    expect(api.marcarPublico).not.toHaveBeenCalled();
  });
});