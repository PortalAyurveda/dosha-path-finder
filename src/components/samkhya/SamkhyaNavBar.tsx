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
];

const SamkhyaNavBar = () => {
  const location = useLocation();
  // Active state derived from URL: /samkhya/categoria/:slug or hash
  const match = location.pathname.match(/^\/samkhya\/categoria\/([^/]+)/);
  const activeCat = match?.[1] ?? "";

  return (
    <nav
      className="w-full sticky top-16 z-40 shadow-sm"
      style={{ background: samkhyaTokens.roxo }}
      aria-label="Categorias da Loja Samkhya"
    >
      <div className="mx-auto max-w-6xl px-2 md:px-4">
        <ul className="flex justify-center gap-1 overflow-x-auto scrollbar-none">
          {ITEMS.map((item) => {
            const to =
              item.slug === "kits"
                ? "/samkhya#kits"
                : `/samkhya/categoria/${item.slug}`;
            const isActive = activeCat === item.slug;
            return (
              <li key={item.slug}>
                <NavLink
                  to={to}
                  className="block px-3 md:px-4 py-3 text-sm md:text-base whitespace-nowrap transition-colors hover:bg-[#5c3249]"
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
