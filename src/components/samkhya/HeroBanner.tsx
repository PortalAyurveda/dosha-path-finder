import { Link } from "react-router-dom";
import { samkhyaTokens } from "./tokens";

interface HeroBannerProps {
  bannerUrl?: string;
  bannerMobileUrl?: string;
  bannerTitle?: string;
  bannerSubtitle?: string;
}

const DEFAULT_BANNER_DESKTOP =
  "https://fwezkasjfguarjmjxifh.supabase.co/storage/v1/object/public/portal_images/banner-samkhya-portal.jpg";
const DEFAULT_BANNER_MOBILE =
  "https://fwezkasjfguarjmjxifh.supabase.co/storage/v1/object/public/portal_images/bananer-smk-portal-mobile.jpg";

/**
 * Banner Hero da Loja Samkhya — elefante / frete grátis com texto sobreposto.
 * Renderizado entre o Header global e a SamkhyaNavBar.
 */
const HeroBanner = ({
  bannerUrl = DEFAULT_BANNER_DESKTOP,
  bannerMobileUrl = DEFAULT_BANNER_MOBILE,
  bannerTitle = "FRETE GRÁTIS",
  bannerSubtitle = "em compras a partir de R$350,00",
}: HeroBannerProps) => {
  return (
    <Link
      to="/samkhya"
      aria-label="Ir para a Loja Samkhya"
      className="relative block w-full"
    >
      <img
        src={bannerUrl}
        alt="Banner Samkhya"
        className="hidden md:block w-full h-auto"
      />
      <img
        src={bannerMobileUrl}
        alt="Banner Samkhya"
        className="block md:hidden w-full h-auto"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = bannerUrl;
        }}
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
    </Link>
  );
};

export default HeroBanner;
