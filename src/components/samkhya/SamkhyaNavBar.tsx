import { useCallback, useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
  const scrollRef = useRef<HTMLUListElement>(null);
  const [podeEsq, setPodeEsq] = useState(false);
  const [podeDir, setPodeDir] = useState(false);

  // Active state derived from URL: /samkhya/categoria/:slug or /samkhya/kits
  const match = location.pathname.match(/^\/samkhya\/categoria\/([^/]+)/);
  const isKitsPage = location.pathname === "/samkhya/kits";
  const isTodosPage = location.pathname === "/samkhya/todos";
  const activeCat = isKitsPage
    ? "kits"
    : isTodosPage
    ? "todos"
    : match?.[1] ?? "";

  const atualizarSetas = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setPodeEsq(el.scrollLeft > 4);
    setPodeDir(max > 4 && el.scrollLeft < max - 4);
  }, []);

  useEffect(() => {
    atualizarSetas();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", atualizarSetas, { passive: true });
    window.addEventListener("resize", atualizarSetas);
    return () => {
      el.removeEventListener("scroll", atualizarSetas);
      window.removeEventListener("resize", atualizarSetas);
    };
  }, [atualizarSetas]);

  const rolar = (dir: -1 | 1) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.max(160, el.clientWidth * 0.7), behavior: "smooth" });
  };

  const setaEstilo =
    "shrink-0 p-1 text-white transition-opacity disabled:opacity-0 disabled:pointer-events-none hover:opacity-70";

  return (
    <nav
      className="w-full sticky top-16 z-40"
      style={{ background: samkhyaTokens.roxo }}
      aria-label="Categorias da Loja Samkhya"
    >
      <div className="mx-auto max-w-6xl px-2 md:px-6 py-1 flex items-center gap-1">
        <button
          type="button"
          onClick={() => rolar(-1)}
          disabled={!podeEsq}
          aria-label="Ver categorias anteriores"
          className={setaEstilo}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <ul
          ref={scrollRef}
          className="flex-1 flex justify-start md:justify-center gap-3 md:gap-5 overflow-x-auto scrollbar-hide"
        >
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
                  className="block px-3 md:px-5 py-1.5 text-sm md:text-base whitespace-nowrap uppercase tracking-wider font-normal transition-opacity hover:opacity-70"
                  style={{
                    color: "#FFFFFF",
                    fontFamily: samkhyaTokens.fonteCorpo,
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
          onClick={() => rolar(1)}
          disabled={!podeDir}
          aria-label="Ver mais categorias"
          className={setaEstilo}
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </nav>
  );
};

export default SamkhyaNavBar;
