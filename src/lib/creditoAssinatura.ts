export type PlanoCredito = "rotina" | "mensal" | "anual";
export type StatusAssinatura = { plano: PlanoCredito | null; premium: boolean; via: "cartao" | "pix" | "credito" | "cortesia" | null; pago_ate: string | null };

export const PRECO_PLANO: Record<PlanoCredito, number> = { rotina: 30, mensal: 79.9, anual: 597 };
export const NOME_PLANO: Record<PlanoCredito, string> = { rotina: "Minha Rotina", mensal: "Premium mensal", anual: "Premium Anual" };

export const totalPlano = (p: PlanoCredito, meses: number) => (p === "anual" ? PRECO_PLANO.anual : Math.round(PRECO_PLANO[p] * meses * 100) / 100);

export function somarMeses(base: Date, meses: number) {
  const d = new Date(base.getFullYear(), base.getMonth(), base.getDate());
  const dia = d.getDate();
  d.setDate(1); d.setMonth(d.getMonth() + meses);
  d.setDate(Math.min(dia, new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()));
  return d;
}

export const dataBR = (d: Date | string) => {
  const x = typeof d === "string" ? new Date(d.length === 10 ? d + "T12:00:00" : d) : d;
  return x.toLocaleDateString("pt-BR");
};

export type CartaoPlano = { plano: PlanoCredito; titulo: string; ligado: boolean; aviso: string | null; rotuloData: string; data: Date };

/** Regras dos três cartões de assinatura conforme o que a pessoa assina hoje. */
export function cartoesAssinatura(s: StatusAssinatura | null, meses: Record<PlanoCredito, number>, hoje = new Date()): CartaoPlano[] {
  const plano = s?.plano ?? null;
  const premium = !!s?.premium || plano === "mensal" || plano === "anual";
  const cartao = s?.via === "cartao";
  const pago = s?.pago_ate ? new Date(s.pago_ate.length === 10 ? s.pago_ate + "T12:00:00" : s.pago_ate) : null;
  const fim = pago && pago > hoje ? pago : hoje;
  const base = (p: PlanoCredito) => {
    const mesmo = p === "rotina" ? plano === "rotina" && !premium : premium;
    return mesmo ? fim : hoje;
  };
  const m = (p: PlanoCredito) => (p === "anual" ? 12 : meses[p]);
  const c = (p: PlanoCredito): CartaoPlano => ({ plano: p, titulo: NOME_PLANO[p], ligado: true, aviso: null, rotuloData: "Liberado até", data: somarMeses(base(p), m(p)) });
  const rotina = c("rotina"), mensal = c("mensal"), anual = c("anual");
  if (premium) {
    rotina.ligado = false; rotina.aviso = "O Premium já inclui a Minha Rotina.";
    mensal.titulo = "Somar mais meses ao seu Premium";
    anual.titulo = "Somar 12 meses ao seu Premium";
  }
  if (cartao && plano === "rotina") {
    rotina.aviso = "Sua Rotina é paga no cartão. Com o crédito, as próximas cobranças ficam paradas por esses meses e voltam sozinhas depois.";
    rotina.rotuloData = "O cartão volta a cobrar em";
    mensal.ligado = false; mensal.aviso = "Sua assinatura no cartão é da Minha Rotina. Para o Premium, use o crédito no Premium Anual.";
    anual.aviso = "Ao usar o crédito no Premium Anual, a cobrança do seu cartão para no fim do período já pago.";
  }
  if (cartao && plano === "mensal") {
    mensal.aviso = "Seu Premium é pago no cartão. Com o crédito, as próximas cobranças ficam paradas por esses meses e voltam sozinhas depois.";
    mensal.rotuloData = "O cartão volta a cobrar em";
    anual.aviso = "Ao usar o crédito no Premium Anual, a cobrança do seu cartão para no fim do período já pago.";
  }
  return [rotina, mensal, anual];
}

/** Linha "Sua assinatura hoje" do topo, ou null para quem não assina. */
export function linhaAssinatura(s: StatusAssinatura | null) {
  if (!s?.plano || !s.pago_ate) return null;
  const nome = NOME_PLANO[s.plano];
  return s.via === "cartao"
    ? `Sua assinatura hoje: ${nome}, no cartão, paga até ${dataBR(s.pago_ate)}.`
    : `Sua assinatura hoje: ${nome}, liberado até ${dataBR(s.pago_ate)}.`;
}
