import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";

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

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(itens));
    } catch {
      /* ignore */
    }
  }, [itens]);

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

  const limparCarrinho = useCallback(() => setItens([]), []);

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
