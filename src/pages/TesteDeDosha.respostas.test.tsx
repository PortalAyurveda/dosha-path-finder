import { beforeEach, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import TesteDeDosha from './TesteDeDosha';

const mocks = vi.hoisted(() => ({ insert: vi.fn(), resultado: vi.fn() }));
vi.mock('@/integrations/supabase/client', () => ({ supabase: { from: () => ({ insert: mocks.insert }) } }));
vi.mock('@/contexts/UserContext', () => ({ useUser: () => ({ setDoshaResultFromId: mocks.resultado, user: null, profile: null, isAnonymous: true }) }));
vi.mock('@/lib/anonSession', () => ({ ensureAnonSession: vi.fn().mockResolvedValue(null), setSessionNome: vi.fn(), currentUserId: vi.fn().mockResolvedValue(null) }));
vi.mock('@/hooks/use-toast', () => ({ useToast: () => ({ toast: vi.fn() }) }));
vi.mock('react-helmet-async', () => ({ Helmet: () => null }));
vi.mock('@/components/PageContainer', () => ({ default: ({ children }: { children: React.ReactNode }) => <div>{children}</div> }));
vi.mock('@/components/dosha/InterstitialLoading', () => ({ default: () => <div>resultado</div> }));
vi.mock('@/lib/doshaTest', async importOriginal => {
  const original = await importOriginal<typeof import('@/lib/doshaTest')>();
  return { ...original, useDoshaTestContent: () => ({ loading: false, content: {
    part1: [{ id: 'part1_0', text: 'Pergunta de teste', options: [{ label: 'Resposta A', scores: { v: 2 } }, { label: 'Resposta B', scores: { p: 1 } }, { label: 'Resposta C', scores: { k: 2 } }] }],
    part2: [], part3: [], part4: [], part5: [], part6: [], part7: [], foodTags: [], agravamentosVata: [], agravamentosPitta: [], agravamentosKapha: [],
  } }) };
});
beforeEach(() => {
  localStorage.clear();
  localStorage.setItem('dosha_test_info', JSON.stringify({ nome: 'Pessoa de teste', idade: '41', nivel: 'Iniciante', email: 'teste@example.com', altura: '1.70', peso: '70', estado: 'SP', cidade: 'São Paulo' }));
  mocks.insert.mockReturnValue({ select: () => ({ maybeSingle: async () => ({ data: { user_id: null }, error: null }) }) });
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ json: async () => [] }));
  window.scrollTo = vi.fn();
});
it('envia o objeto answers com os índices das múltiplas respostas sem mudar a pontuação ou o webhook', async () => {
  render(<MemoryRouter><TesteDeDosha /></MemoryRouter>);
  fireEvent.click(await screen.findByRole('button', { name: 'Resposta A' }));
  fireEvent.click(screen.getByRole('button', { name: 'Resposta C' }));
  for (let i = 0; i < 8; i++) fireEvent.click(screen.getByRole('button', { name: /Próximo/ }));
  await waitFor(() => expect(screen.getByLabelText('Cidade')).not.toBeDisabled());
  fireEvent.click(screen.getByRole('button', { name: /Calcular Resultado/ }));
  await waitFor(() => expect(mocks.insert).toHaveBeenCalledOnce());
  const payload = mocks.insert.mock.calls[0][0];
  expect(payload.respostas).toEqual({ part1_0: [0, 2] });
  expect(payload.vatascore).toBe(2);
  expect(payload.pittascore).toBe(3);
  expect(payload.kaphascore).toBe(3);
  expect(JSON.parse(vi.mocked(fetch).mock.calls.at(-1)?.[1]?.body as string).respostas).toBeUndefined();
});