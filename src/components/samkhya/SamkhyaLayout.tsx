import { ReactNode } from "react";
import SamkhyaHeader from "./SamkhyaHeader";
import SamkhyaNavBar from "./SamkhyaNavBar";
import { samkhyaTokens } from "./tokens";

interface SamkhyaLayoutProps {
  children: ReactNode;
  bannerUrl?: string;
}

/**
 * Wrapper for all /samkhya/* routes.
 * Renders inside the global <Layout /> (portal Header still on top),
 * applies the warm off-white background and adds the loja-specific header + nav.
 */
const SamkhyaLayout = ({ children, bannerUrl }: SamkhyaLayoutProps) => {
  return (
    <div style={{ background: samkhyaTokens.fundo, color: samkhyaTokens.texto }}>
      <SamkhyaHeader bannerUrl={bannerUrl} />
      <SamkhyaNavBar />
      <main className="mx-auto max-w-6xl px-4 py-8 md:py-12">{children}</main>
    </div>
  );
};

export default SamkhyaLayout;
