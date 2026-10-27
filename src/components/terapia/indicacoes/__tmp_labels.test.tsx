import { cleanup, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, describe, expect, it, vi } from 'vitest';
vi.mock('@/lib/terapia', () => ({ terapia: { buscaPortal: vi.fn(), painel: vi.fn(), arquivoAssinado: vi.fn() } }));
import Catalogo from './Catalogo';
import Conteudo from '../acervo/Conteudo';
import type { FontesIndicacoes } from '@/lib/terapiaIndicacoes';
import type { ItemAcervo } from '@/lib/terapiaAcervo';
const fontes: FontesIndicacoes = { para_ela: [], rotina_dela: [], rotina: {}, samkhya: [], aulas: [], versos: [] };
afterEach(cleanup);
const montar = (node: React.ReactNode) => render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>{node}</QueryClientProvider>);
const item = (tipo: string): ItemAcervo => ({ tipo, titulo: 'T', resumo: '', subcategoria: '', periodo: '', vata: 0, pitta: 0, kapha: 0, tags: [], serve_para: [], conteudo: {}, arquivo_path: null, visibilidade: 'meus_pacientes' });
describe('rótulos da Parte 27', () => {
  it('aba do catálogo sem geral diz Biblioteca pessoal', () => { montar(<Catalogo fontes={fontes} nome="Ana" adicionar={vi.fn()} />); expect(screen.getByRole('button', { name: 'Biblioteca pessoal' })).toBeTruthy(); expect(screen.queryByText('Minha biblioteca')).toBeNull(); });
  it('aba do catálogo com geral diz Biblioteca pessoal', () => { montar(<Catalogo geral fontes={fontes} nome="Ana" adicionar={vi.fn()} />); expect(screen.getAllByRole('button', { name: 'Biblioteca pessoal' }).length).toBeGreaterThan(0); expect(screen.queryByText('Minha biblioteca')).toBeNull(); });
  it.each([['texto', 'Texto'], ['arquivo', 'PDF'], ['aula', 'Vídeo'], ['foto', 'Foto'], ['link', 'Link']])('prévia mostra %s como %s', (t, n) => { montar(<Conteudo item={item(t)} />); expect(screen.getByText(n, { exact: false })).toBeTruthy(); });
});
