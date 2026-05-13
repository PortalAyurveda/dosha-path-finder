import { ReactNode } from "react";
import SamkhyaNavBar from "./SamkhyaNavBar";
import HeroBanner from "./HeroBanner";
import { samkhyaTokens } from "./tokens";

interface SamkhyaLayoutProps {
  children: ReactNode;
  showHero?: boolean;
}

/**
 * Wrapper for all /samkhya/* routes.
 * Order: global Header (sticky) → HeroBanner (elephant, index only) → SamkhyaNavBar (sticky) → main.
 */
const SamkhyaLayout = ({ children, showHero = false }: SamkhyaLayoutProps) => {
  return (
    <div style={{ background: samkhyaTokens.fundo, color: samkhyaTokens.texto, fontFamily: "Helvetica, 'Helvetica Neue', Arial, sans-serif" }}>
      {showHero && <HeroBanner />}
      <SamkhyaNavBar />
      <main className="mx-auto max-w-6xl px-4 py-6 md:py-8">{children}</main>
    </div>
  );
};

export default SamkhyaLayout;
