import type { AkashaRichCard } from "@/components/akasha/AkashaMessageContent";

/** Envio único da Akasha: conversa normal e modo Biblioteca do Portal. */
export const AKASHA_CHAT_URL = "https://n8n.portalayurveda.com/webhook/chat-ayurveda";
export const AKASHA_BIBLIOTECA_URL = "https://n8n.portalayurveda.com/webhook/akasha-biblioteca";

export type AkashaModo = "conversa" | "biblioteca";
export type TipoBiblioteca = "receita" | "video" | "artigo" | "produto";

export const TIPOS_BIBLIOTECA: { tipo: TipoBiblioteca; rotulo: string }[] = [
  { tipo: "receita", rotulo: "Receitas" },
  { tipo: "video", rotulo: "Aulas" },
  { tipo: "artigo", rotulo: "Artigos" },
  { tipo: "produto", rotulo: "Produtos" },
];

export const TODOS_TIPOS: TipoBiblioteca[] = TIPOS_BIBLIOTECA.map((t) => t.tipo);
export const SUGESTOES_BIBLIOTECA = ["Chá para dormir", "Kitchari", "Abhyanga"];
export const PLACEHOLDER_BIBLIOTECA = "O que você quer encontrar? Ex.: sopa para digestão, chá para dormir";
export const ERRO_BIBLIOTECA = "Não consegui abrir a Biblioteca do Portal agora. Tente de novo em instantes.";
export const MAX_CARDS_BIBLIOTECA = 4;

/** Alterna uma ficha mantendo pelo menos uma marcada, na ordem fixa. */
export const alternarTipo = (atuais: TipoBiblioteca[], tipo: TipoBiblioteca): TipoBiblioteca[] => {
  if (atuais.includes(tipo)) {
    return atuais.length <= 1 ? atuais : atuais.filter((t) => t !== tipo);
  }
  return TODOS_TIPOS.filter((t) => t === tipo || atuais.includes(t));
};

export interface AkashaResposta {
  resposta: string;
  cards: AkashaRichCard[];
}

const postJson = async (url: string, body: unknown) => {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
};

/** Conversa normal: mesmo endereço e mesmo pedido de antes. */
export const enviarConversa = async (payload: Record<string, unknown>): Promise<AkashaResposta> => {
  const response = await fetch(AKASHA_CHAT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  return {
    resposta: data?.resposta || data?.output || data?.text || "Desculpe, não consegui processar sua mensagem.",
    cards: Array.isArray(data?.cards) ? data.cards : [],
  };
};

/** Biblioteca do Portal: não desconta token. Lança erro se falhar. */
export const enviarBiblioteca = async (params: {
  message: string;
  email: string | null | undefined;
  contactId: string | null | undefined;
  tipos: TipoBiblioteca[];
}): Promise<AkashaResposta> => {
  const data = await postJson(AKASHA_BIBLIOTECA_URL, {
    message: params.message,
    email: params.email ?? null,
    contactId: params.contactId ?? null,
    tipos: params.tipos,
  });
  const resposta = typeof data?.resposta === "string" ? data.resposta.trim() : "";
  const cards: AkashaRichCard[] = Array.isArray(data?.cards)
    ? data.cards.filter((c: any) => c && typeof c === "object").slice(0, MAX_CARDS_BIBLIOTECA)
    : [];
  if (!resposta && cards.length === 0) throw new Error("Resposta vazia");
  return { resposta: resposta || "Encontrei isto na Biblioteca do Portal:", cards };
};
