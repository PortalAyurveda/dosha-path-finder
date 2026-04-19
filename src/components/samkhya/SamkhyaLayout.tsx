import { ReactNode } from "react";
import SamkhyaNavBar from "./SamkhyaNavBar";
import { samkhyaTokens } from "./tokens";

interface SamkhyaLayoutProps {
  children: ReactNode;
}

/**
 * Wrapper for all /samkhya/* routes.
 * The global portal Header (already adapted in /samkhya/*) sits above.
 * We add only the category nav bar — the loja-specific banner/logo lives in
 * the global Header to keep a single sticky element on top.
 */
const SamkhyaLayout = ({ children }: SamkhyaLayoutProps) => {
  return (
    <div style={{ background: samkhyaTokens.fundo, color: samkhyaTokens.texto }}>
      <SamkhyaNavBar />
      <main className="mx-auto max-w-6xl px-4 py-8 md:py-12">{children}</main>
    </div>
  );
};

export default SamkhyaLayout;
