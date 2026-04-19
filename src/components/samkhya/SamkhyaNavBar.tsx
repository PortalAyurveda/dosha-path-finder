import { NavLink, useLocation } from "react-router-dom";
import { samkhyaTokens } from "./tokens";

const ITEMS = [
  { slug: "todos", label: "Todos os Produtos" },
  { slug: "vata", label: "Vata" },
  { slug: "pitta", label: "Pitta" },
  { slug: "kapha", label: "Kapha" },
  { slug: "kits", label: "Kits" },
];

const SamkhyaNavBar = () => {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const activeCat = params.get("cat") ?? "todos";

  return (
    <nav
      className="w-full sticky top-0 z-30"
      style={{ background: samkhyaTokens.roxo }}
      aria-label="Categorias da Loja Samkhya"
    >
      <div className="mx-auto max-w-6xl px-2 md:px-4">
        <ul className="flex gap-1 overflow-x-auto scrollbar-none">
          {ITEMS.map((item) => {
            const isKits = item.slug === "kits";
            const to = isKits ? "/samkhya?cat=kits#kits" : `/samkhya?cat=${item.slug}`;
            const isActive = isKits ? activeCat === "kits" : activeCat === item.slug;
            return (
              <li key={item.slug}>
                <NavLink
                  to={to}
                  className="block px-4 py-3 text-sm md:text-base whitespace-nowrap transition-colors"
                  style={{
                    color: "#fff",
                    background: isActive ? samkhyaTokens.roxoDark : "transparent",
                    fontWeight: isActive ? 600 : 400,
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
