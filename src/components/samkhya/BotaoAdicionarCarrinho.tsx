import { ShoppingBag } from "lucide-react";
import { useCart, type CartItem } from "@/contexts/CartContext";
import { samkhyaTokens } from "@/components/samkhya/tokens";

interface Props {
  item: Omit<CartItem, "quantidade">;
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  disabled?: boolean;
}

const BotaoAdicionarCarrinho = ({ item, size = "md", fullWidth = false }: Props) => {
  const { adicionarItem, abrirCarrinho } = useCart();

  const padding =
    size === "lg" ? "px-5 py-3 text-sm" : size === "sm" ? "px-3 py-2 text-xs" : "px-4 py-2.5 text-sm";

  return (
    <button
      type="button"
      onClick={() => {
        adicionarItem(item);
        abrirCarrinho();
      }}
      className={`inline-flex items-center justify-center gap-2 rounded-md font-medium text-white transition-opacity hover:opacity-90 ${padding} ${fullWidth ? "w-full" : ""}`}
      style={{ background: samkhyaTokens.ouro }}
    >
      <ShoppingBag className="h-4 w-4" />
      Adicionar ao carrinho
    </button>
  );
};

export default BotaoAdicionarCarrinho;
