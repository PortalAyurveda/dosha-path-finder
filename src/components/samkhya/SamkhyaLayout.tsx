import { ReactNode } from "react";
import SamkhyaNavBar from "./SamkhyaNavBar";
import HeroBanner from "./HeroBanner";
import { samkhyaTokens } from "./tokens";

interface SamkhyaLayoutProps {
  children: ReactNode;
}

/**
 * Wrapper for all /samkhya/* routes.
 * Order: global Header (sticky) → HeroBanner (elephant) → SamkhyaNavBar (sticky) → main.
 */
const SamkhyaLayout = ({ children }: SamkhyaLayoutProps) => {
  return (
    <div style={{ background: samkhyaTokens.fundo, color: samkhyaTokens.texto }}>
      <HeroBanner />
      <SamkhyaNavBar />
      <main className="mx-auto max-w-6xl px-4 py-6 md:py-8">{children}</main>
    </div>
  );
};

export default SamkhyaLayout;
