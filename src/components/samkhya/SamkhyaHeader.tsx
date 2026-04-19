import SamkhyaLogo from "./SamkhyaLogo";
import { samkhyaTokens } from "./tokens";
import { Link } from "react-router-dom";

interface SamkhyaHeaderProps {
  /** Override desktop banner image (defaults to Supabase storage banner) */
  bannerUrl?: string;
  /** Override mobile banner image */
  bannerMobileUrl?: string;
  /** Title overlay (defaults to "FRETE GRÁTIS") */
  bannerTitle?: string;
  /** Subtitle overlay (defaults to "em compras a partir de R$350,00") */
  bannerSubtitle?: string;
}

const DEFAULT_BANNER_DESKTOP =
  "https://fwezkasjfguarjmjxifh.supabase.co/storage/v1/object/public/portal_images/banner-samkhya-portal.jpg";
const DEFAULT_BANNER_MOBILE =
  "https://fwezkasjfguarjmjxifh.supabase.co/storage/v1/object/public/portal_images/bananer-smk-portal-mobile.jpg";

const SamkhyaHeader = ({
  bannerUrl = DEFAULT_BANNER_DESKTOP,
  bannerMobileUrl = DEFAULT_BANNER_MOBILE,
  bannerTitle = "FRETE GRÁTIS",
  bannerSubtitle = "em compras a partir de R$350,00",
}: SamkhyaHeaderProps) => {
  return (
    <header style={{ background: samkhyaTokens.cardBg }}>
      <div className="mx-auto max-w-6xl px-4 py-6 md:py-8 flex justify-center">
        <Link to="/samkhya" aria-label="Loja Samkhya — início">
          <SamkhyaLogo size="md" />
        </Link>
      </div>

      {/* Banner hero com texto sobreposto */}
      <div className="relative w-full">
        <img
          src={bannerUrl}
          alt="Banner Samkhya"
          className="hidden md:block w-full h-auto"
        />
        <img
          src={bannerMobileUrl}
          alt="Banner Samkhya"
          className="block md:hidden w-full h-auto"
        />

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <h2
            className="text-4xl md:text-5xl mb-2 font-light tracking-wide"
            style={{
              color: samkhyaTokens.roxo,
              fontFamily: "Georgia, 'Times New Roman', serif",
            }}
          >
            {bannerTitle}
          </h2>
          <p
            className="text-base md:text-xl"
            style={{ color: samkhyaTokens.textoSec }}
          >
            {bannerSubtitle}
          </p>
        </div>
      </div>
    </header>
  );
};

export default SamkhyaHeader;
