import SamkhyaLogo from "./SamkhyaLogo";
import { samkhyaTokens } from "./tokens";
import { Link } from "react-router-dom";

interface SamkhyaHeaderProps {
  bannerUrl?: string;
}

const SamkhyaHeader = ({ bannerUrl }: SamkhyaHeaderProps) => {
  return (
    <header className="border-b" style={{ borderColor: samkhyaTokens.cardBorder, background: samkhyaTokens.cardBg }}>
      <div className="mx-auto max-w-6xl px-4 py-8 md:py-10 flex flex-col items-center gap-6">
        <Link to="/samkhya" aria-label="Loja Samkhya — início">
          <SamkhyaLogo size="md" />
        </Link>

        {/* Banner do elefante (frete grátis) — placeholder até o asset chegar */}
        <div className="w-full">
          {bannerUrl ? (
            <img src={bannerUrl} alt="Frete grátis a partir de R$ 200" className="w-full h-auto" />
          ) : (
            <div
              className="w-full rounded-md flex items-center justify-center text-sm"
              style={{
                background: samkhyaTokens.roxoLight,
                color: samkhyaTokens.textoSec,
                minHeight: "96px",
                border: `1px dashed ${samkhyaTokens.cardBorder}`,
              }}
            >
              Banner em breve
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default SamkhyaHeader;
