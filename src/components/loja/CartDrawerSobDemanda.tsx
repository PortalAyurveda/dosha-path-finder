import { Suspense, lazy, useEffect, useState } from "react";
import { useCart } from "@/contexts/CartContext";

// A sacola só baixa o seu código quando abre pela primeira vez (ou quando entra um produto);
// depois fica montada para guardar a etapa em que a pessoa estava.
const carregar = () => import("./CartDrawer");
const CartDrawer = lazy(carregar);

export default function CartDrawerSobDemanda() {
  const { isOpen, itens } = useCart();
  const [montar, setMontar] = useState(false);
  useEffect(() => { if (isOpen) setMontar(true); }, [isOpen]);
  useEffect(() => { if (itens.length) void carregar(); }, [itens.length]);
  if (!montar) return null;
  return <Suspense fallback={null}><CartDrawer /></Suspense>;
}
