import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
vi.mock('@/hooks/useMeuAcompanhamento', () => ({ useMeuAcompanhamento: () => ({ ligacoes: { data: [{ terapeuta: { primeiro_nome: 'Ana' } }] } }) }));
vi.mock('@/lib/terapiaMeu', () => ({ meu: { indicacoes: async () => [{ id: 'f', terapeuta: { primeiro_nome: 'Ana' } }] } }));
vi.mock('./FolhasDoTerapeuta', () => ({ default: () => <div>folha</div> }));
import LinhaAcompanhamento from './LinhaAcompanhamento';
import IndicacoesNaRotina from './IndicacoesNaRotina';
const envolver = (n: JSX.Element) => render(<QueryClientProvider client={new QueryClient()}><MemoryRouter>{n}</MemoryRouter></QueryClientProvider>);
describe('quem tem terapeuta', () => {
  it('Meu Dosha mostra a linha do acompanhamento', () => {
    envolver(<LinhaAcompanhamento />);
    expect(screen.getByTestId('linha-acompanhamento').textContent).toBe('Você está em acompanhamento com Ana. Ver Meu Acompanhamento ›');
    expect(screen.getByRole('link').getAttribute('href')).toBe('/meu-acompanhamento');
  });
  it('Minha Rotina ganha o título da folha', async () => {
    envolver(<IndicacoesNaRotina />);
    expect(await screen.findByRole('heading', { name: 'Orientações do seu terapeuta Ana' })).toBeTruthy();
  });
});
