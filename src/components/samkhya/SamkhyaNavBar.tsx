import { NavLink, useLocation } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import { samkhyaTokens } from "./tokens";
import { useCart } from "@/contexts/CartContext";

const ITEMS = [
  { slug: "vata", label: "Vata" },
  { slug: "pitta", label: "Pitta" },
  { slug: "kapha", label: "Kapha" },
  { slug: "detox", label: "Detox" },
  { slug: "rejuvenescimento", label: "Rejuvenescimento" },
  { slug: "gold", label: "Gold" },
  { slug: "kits", label: "Kits" },
  { slug: "todos", label: "Todos" },
];

const SamkhyaNavBar = () => {
  const { totalItens, abrirCarrinho } = useCart();
  const location = useLocation();
  // Active state derived from URL: /samkhya/categoria/:slug or /samkhya/kits
  const match = location.pathname.match(/^\/samkhya\/categoria\/([^/]+)/);
  const isKitsPage = location.pathname === "/samkhya/kits";
  const isTodosPage = location.pathname === "/samkhya/todos";
  const activeCat = isKitsPage
    ? "kits"
    : isTodosPage
    ? "todos"
    : match?.[1] ?? "";

  return (
    <nav
      className="w-full sticky top-16 z-40"
      style={{ background: "#73465F" }}
      aria-label="Categorias da Loja Samkhya"
    >
      <div className="mx-auto max-w-6xl px-3 md:px-6 py-1 flex items-center gap-3">
        <ul className="flex-1 flex justify-center gap-3 md:gap-5 overflow-x-auto scrollbar-none">
          {ITEMS.map((item) => {
            const to =
              item.slug === "kits"
                ? "/samkhya/kits"
                : item.slug === "todos"
                ? "/samkhya/todos"
                : `/samkhya/categoria/${item.slug}`;
            const isActive = activeCat === item.slug;
            return (
              <li key={item.slug}>
                <NavLink
                  to={to}
                  className="block px-4 md:px-5 py-1.5 text-sm md:text-base whitespace-nowrap uppercase tracking-wider font-normal transition-opacity hover:opacity-70"
                  style={{
                    color: "#FFFFFF",
                    fontFamily: "Helvetica, Arial, sans-serif",
                    opacity: isActive ? 1 : 0.85,
                    textDecoration: isActive ? "underline" : "none",
                    textUnderlineOffset: "4px",
                  }}
                >
                  {item.label}
                </NavLink>
              </li>
            );
          })}
        </ul>
        <button
          type="button"
          onClick={abrirCarrinho}
          aria-label={`Abrir carrinho (${totalItens} itens)`}
          className="relative shrink-0 p-2 text-white hover:opacity-80 transition-opacity"
        >
          <ShoppingBag className="h-5 w-5" />
          {totalItens > 0 && (
            <span
              className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full text-[10px] font-bold flex items-center justify-center px-1"
              style={{ background: samkhyaTokens.ouro, color: "#fff" }}
            >
              {totalItens}
            </span>
          )}
        </button>
      </div>
    </nav>
  );
};

export default SamkhyaNavBar;
