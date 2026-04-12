import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Scrolls to top on route changes, EXCEPT when navigating
 * within /biblioteca sub-routes (tabs/submenu).
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Don't scroll to top when switching within biblioteca sub-pages
    const isBibliotecaSub = pathname.startsWith("/biblioteca/");
    if (!isBibliotecaSub) {
      window.scrollTo({ top: 0, left: 0 });
    }
  }, [pathname]);

  return null;
};

export default ScrollToTop;
