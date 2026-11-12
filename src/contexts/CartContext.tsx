import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lojaSupabase } from "@/integrations/supabase/loja-client";

export type CartItem = {
  id: number;
  slug: string;
  nome: string;
  preco_normal: number;
  preco_pix: number;
  stripe_price_id: string | null;
  imagem_url: string | null;
  peso_gramas: number;
  quantidade: number;
  tipo: "produto" | "kit";
  /** Escolhas do cliente para kits com opções ({ grupo: produto_id }). */
  escolhas?: Record<string, number>;
  /** Descrição legível das escolhas (ex.: "Massala Chai"). */
  escolhas_label?: string;
};

export const getCartKey = (
  it: Pick<CartItem, "slug" | "tipo" | "escolhas">,
): string => {
  const esc = it.escolhas && Object.keys(it.escolhas).length > 0
    ? JSON.stringify(
        Object.keys(it.escolhas).sort().reduce<Record<string, number>>((acc, k) => {
          acc[k] = it.escolhas![k];
          return acc;
        }, {}),
      )
    : "";
  return `${it.tipo}::${it.slug}::${esc}`;
};

type CartContextType = {
  itens: CartItem[];
  isOpen: boolean;
  abrirCarrinho: () => void;
  fecharCarrinho: () => void;
  adicionarItem: (item: Omit<CartItem, "quantidade"> & { quantidade?: number }) => void;
  removerItem: (key: string) => void;
  atualizarQuantidade: (key: string, quantidade: number) => void;
  limparCarrinho: () => void;
  totalItens: number;
  subtotal: number;
};

const STORAGE_KEY = "samkhya:cart:v1";

export const PIX_PENDENTE_KEY = "samkhya:pix-pendente";

const CartContext = createContext<CartContextType | null>(null);

const loadInitial = (): CartItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [itens, setItens] = useState<CartItem[]>(loadInitial);
  const [isOpen, setIsOpen] = useState(false);
  const itensRef = useRef(itens);
  itensRef.current = itens;

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(itens));
    } catch {
      /* ignore */
    }
  }, [itens]);

  useEffect(() => {
    let conferindo = false;
    const conferirPixPendente = async () => {
      if (conferindo) return;
      let pedidoId: string | null = null;
      try {
        pedidoId = localStorage.getItem(PIX_PENDENTE_KEY);
      } catch {
        return;
      }
      if (!pedidoId) return;
      conferindo = true;
      try {
        const { data, error } = await supabase.functions.invoke("conferir-pix", {
          body: { pedido_id: pedidoId },
        });
        if (error) return;
        if (data?.status === "pago") {
          setItens([]);
          localStorage.removeItem(PIX_PENDENTE_KEY);
        } else if (data?.status === "expirado") {
          localStorage.removeItem(PIX_PENDENTE_KEY);
        }
      } catch {
        /* ignore */
      } finally {
        conferindo = false;
      }
    };
    conferirPixPendente();
    const aoVoltarNaAba = () => {
      if (document.visibilityState === "visible") conferirPixPendente();
    };
    document.addEventListener("visibilitychange", aoVoltarNaAba);
    return () => document.removeEventListener("visibilitychange", aoVoltarNaAba);
  }, []);

  // Ao abrir o carrinho, atualiza preço normal e Pix de cada item com o valor atual
  // (mesmas fontes das páginas de produto e kit); o carrinho salvo é regravado pelo efeito acima.
  useEffect(() => {
    if (!isOpen) return;
    let cancelado = false;
    (async () => {
      const atuais = itensRef.current;
      if (atuais.length === 0) return;
      const precos = new Map<string, { n: number; p: number }>();
      const slugsProd = [...new Set(atuais.filter((i) => i.tipo === "produto").map((i) => i.slug))];
      const slugsKit = [...new Set(atuais.filter((i) => i.tipo === "kit").map((i) => i.slug))];
      try {
        if (slugsProd.length) {
          const { data } = await lojaSupabase.from("produtos").select("slug, preco_normal, preco_pix").in("slug", slugsProd);
          for (const r of (data ?? []) as { slug: string; preco_normal: number; preco_pix: number }[]) {
            precos.set(`produto::${r.slug}`, { n: Number(r.preco_normal), p: Number(r.preco_pix) });
          }
        }
        await Promise.all(slugsKit.map(async (slug) => {
          const { data } = await supabase.rpc("kit_detalhe" as never, { p_slug: slug } as never);
          const d = data as unknown;
          const k = (Array.isArray(d) ? d[0] : d) as { preco_normal?: number; preco_pix?: number } | null;
          if (k && k.preco_normal != null && k.preco_pix != null) {
            precos.set(`kit::${slug}`, { n: Number(k.preco_normal), p: Number(k.preco_pix) });
          }
        }));
      } catch {
        return;
      }
      if (cancelado || precos.size === 0) return;
      setItens((prev) => {
        let mudou = false;
        const next = prev.map((it) => {
          const v = precos.get(`${it.tipo}::${it.slug}`);
          if (!v || !Number.isFinite(v.n) || !Number.isFinite(v.p)) return it;
          if (Number(it.preco_normal) === v.n && Number(it.preco_pix) === v.p) return it;
          mudou = true;
          return { ...it, preco_normal: v.n, preco_pix: v.p };
        });
        return mudou ? next : prev;
      });
    })();
    return () => { cancelado = true; };
  }, [isOpen]);

  const abrirCarrinho = useCallback(() => setIsOpen(true), []);
  const fecharCarrinho = useCallback(() => setIsOpen(false), []);

  const adicionarItem: CartContextType["adicionarItem"] = useCallback((item) => {
    const qty = item.quantidade ?? 1;
    const key = getCartKey(item);
    setItens((prev) => {
      const idx = prev.findIndex((p) => getCartKey(p) === key);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantidade: next[idx].quantidade + qty };
        return next;
      }
      return [...prev, { ...item, quantidade: qty }];
    });
  }, []);

  const removerItem: CartContextType["removerItem"] = useCallback((key) => {
    setItens((prev) => prev.filter((p) => getCartKey(p) !== key));
  }, []);

  const atualizarQuantidade: CartContextType["atualizarQuantidade"] = useCallback((key, quantidade) => {
    if (quantidade <= 0) {
      setItens((prev) => prev.filter((p) => getCartKey(p) !== key));
      return;
    }
    setItens((prev) =>
      prev.map((p) => (getCartKey(p) === key ? { ...p, quantidade } : p)),
    );
  }, []);

  const limparCarrinho = useCallback(() => {
    setItens([]);
    try {
      localStorage.removeItem(PIX_PENDENTE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const totalItens = useMemo(() => itens.reduce((acc, it) => acc + it.quantidade, 0), [itens]);
  const subtotal = useMemo(
    () => itens.reduce((acc, it) => acc + Number(it.preco_pix) * it.quantidade, 0),
    [itens],
  );

  const value: CartContextType = {
    itens,
    isOpen,
    abrirCarrinho,
    fecharCarrinho,
    adicionarItem,
    removerItem,
    atualizarQuantidade,
    limparCarrinho,
    totalItens,
    subtotal,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart deve ser usado dentro de CartProvider");
  return ctx;
};
