/** Prévia do frete; após resgatar, a resposta do banco é a autoridade. */
export function totaisCreditoSamkhya(samkhyaEPortal: number, produtos: number, frete: number) {
  const freteCoberto = Math.max(0, Math.min(frete, samkhyaEPortal - produtos));
  return { freteCoberto, totalAPagar: frete - freteCoberto };
}

export type ResgateSamkhya = {
  pedido_id: string;
  frete_coberto: number;
  total_a_pagar: number;
  precisa_pagar: boolean;
};

export async function prepararPedidoSamkhya(
  resgate: ResgateSamkhya,
  gerarPix: (pedidoId: string) => Promise<unknown>,
) {
  if (resgate.precisa_pagar) await gerarPix(resgate.pedido_id);
  return `/samkhya/pedido/${resgate.pedido_id}`;
}