import { NavLink, useLocation } from "react-router-dom";
import { samkhyaTokens } from "./tokens";

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
      <div className="mx-auto max-w-6xl px-3 md:px-6 py-2">
        <ul className="flex justify-center gap-3 md:gap-5 overflow-x-auto scrollbar-none">
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
                  className="block px-4 md:px-5 py-2 text-sm md:text-base whitespace-nowrap uppercase tracking-wider font-bold transition-opacity hover:opacity-70"
                  style={{
                    color: "#FFFFFF",
                    fontFamily: "Georgia, 'Times New Roman', serif",
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
      </div>
    </nav>
  );
};

export default SamkhyaNavBar;
