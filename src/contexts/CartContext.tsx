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
};

type CartContextType = {
  itens: CartItem[];
  isOpen: boolean;
  abrirCarrinho: () => void;
  fecharCarrinho: () => void;
  adicionarItem: (item: Omit<CartItem, "quantidade"> & { quantidade?: number }) => void;
  removerItem: (slug: string, tipo: CartItem["tipo"]) => void;
  atualizarQuantidade: (slug: string, tipo: CartItem["tipo"], quantidade: number) => void;
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
    setItens((prev) => {
      const idx = prev.findIndex((p) => p.slug === item.slug && p.tipo === item.tipo);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantidade: next[idx].quantidade + qty };
        return next;
      }
      return [...prev, { ...item, quantidade: qty }];
    });
  }, []);

  const removerItem: CartContextType["removerItem"] = useCallback((slug, tipo) => {
    setItens((prev) => prev.filter((p) => !(p.slug === slug && p.tipo === tipo)));
  }, []);

  const atualizarQuantidade: CartContextType["atualizarQuantidade"] = useCallback((slug, tipo, quantidade) => {
    if (quantidade <= 0) {
      setItens((prev) => prev.filter((p) => !(p.slug === slug && p.tipo === tipo)));
      return;
    }
    setItens((prev) =>
      prev.map((p) => (p.slug === slug && p.tipo === tipo ? { ...p, quantidade } : p)),
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
