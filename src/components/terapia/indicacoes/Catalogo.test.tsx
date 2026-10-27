import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('@/lib/terapia', () => ({ terapia: { buscaPortal: vi.fn(), painel: vi.fn() } }));
import { terapia } from '@/lib/terapia';
import Catalogo from './Catalogo';
import type { FontesIndicacoes } from '@/lib/terapiaIndicacoes';
const fontes: FontesIndicacoes = { para_ela: [], rotina_dela: [], rotina: {}, samkhya: [], aulas: [], versos: [] };
beforeEach(() => { vi.useFakeTimers(); vi.mocked(terapia.buscaPortal).mockReset().mockResolvedValue({ q: 'yoga', total: 17, grupos: [{ tipo: 'aula', titulo: 'Aulas e vídeos', total: 17, itens: [{ tipo: 'aula', titulo: 'Yoga', link: '/video/yoga' }] }] }); });
afterEach(() => { cleanup(); vi.useRealTimers(); });
const montar = () => render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}><Catalogo fontes={fontes} nome="Ana" adicionar={vi.fn()}/></QueryClientProvider>);
const esperar = async (ms: number) => { await act(async () => { await vi.advanceTimersByTimeAsync(ms); }); };
describe('Busca do catálogo em todo o Portal', () => {
  it('não consulta com apenas uma letra', async () => { montar(); fireEvent.change(screen.getByRole('textbox'), { target: { value: 'y' } }); await esperar(400); expect(terapia.buscaPortal).not.toHaveBeenCalled(); });
  it('aguarda 350 ms desde a última tecla e pede seis por grupo', async () => { montar(); fireEvent.change(screen.getByRole('textbox'), { target: { value: 'yo' } }); await esperar(200); fireEvent.change(screen.getByRole('textbox'), { target: { value: 'yoga' } }); await esperar(349); expect(terapia.buscaPortal).not.toHaveBeenCalled(); await esperar(1); expect(terapia.buscaPortal).toHaveBeenCalledExactlyOnceWith('yoga', 6); });
  it('amplia o grupo para trinta sem repetir a consulta inicial', async () => { montar(); fireEvent.change(screen.getByRole('textbox'), { target: { value: 'yoga' } }); await esperar(350); await esperar(10); fireEvent.click(screen.getByRole('button', { name: 'Ver todos (17)' })); await esperar(10); expect(terapia.buscaPortal).toHaveBeenLastCalledWith('yoga', 30); expect(terapia.buscaPortal).toHaveBeenCalledTimes(2); });
  it('limpar impede a busca pendente de ser enviada', async () => { montar(); fireEvent.change(screen.getByRole('textbox'), { target: { value: 'yoga' } }); await esperar(200); fireEvent.click(screen.getByRole('button', { name: 'Limpar busca' })); await esperar(400); expect(terapia.buscaPortal).not.toHaveBeenCalled(); });
});