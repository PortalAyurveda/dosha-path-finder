import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
vi.mock('@/integrations/supabase/client', () => ({ supabase: { rpc: vi.fn() } }));
import Configuracoes from './Participar';
import type { Painel } from '@/lib/terapia';
afterEach(cleanup);
const painel = { sistema: { participa: false, no_sistema: false, falta: [], valor_consulta: 180 } } as unknown as Painel;
describe('Participação nas configurações', () => {
 it('permite ligar com todos os passos completos mesmo estando desligada', () => { const mudar = vi.fn(); render(<BrowserRouter><Configuracoes painel={painel} ocupado={false} mudar={mudar} executar={vi.fn()} atualizar={vi.fn()}/></BrowserRouter>); fireEvent.click(screen.getByRole('switch')); expect(mudar).toHaveBeenCalledWith(true); });
 it('não oferece a chave quando falta configurar agenda', () => { render(<BrowserRouter><Configuracoes painel={{ ...painel, sistema: { ...painel.sistema, falta: ['agenda'] } }} ocupado={false} mudar={vi.fn()} executar={vi.fn()} atualizar={vi.fn()}/></BrowserRouter>); expect(screen.queryByRole('switch')).toBeNull(); });
});