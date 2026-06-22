import { createContext, useContext, useState, type ReactNode } from "react";

export type QtdProduzir = Record<number, number>; // produto_id -> unidades

interface Ctx {
  qtdProduzir: QtdProduzir;
  setQtd: (produtoId: number, unidades: number) => void;
  resetQtd: () => void;
  setTab: (tab: string) => void;
}

const EstoqueCtx = createContext<Ctx | null>(null);

export function EstoqueProvider({
  children,
  setTab,
}: {
  children: ReactNode;
  setTab: (tab: string) => void;
}) {
  const [qtdProduzir, setQtdProduzir] = useState<QtdProduzir>({});
  const setQtd = (produtoId: number, unidades: number) =>
    setQtdProduzir((s) => ({ ...s, [produtoId]: unidades }));
  const resetQtd = () => setQtdProduzir({});
  return (
    <EstoqueCtx.Provider value={{ qtdProduzir, setQtd, resetQtd, setTab }}>
      {children}
    </EstoqueCtx.Provider>
  );
}

export function useEstoqueCtx() {
  const ctx = useContext(EstoqueCtx);
  if (!ctx) throw new Error("useEstoqueCtx fora do EstoqueProvider");
  return ctx;
}
