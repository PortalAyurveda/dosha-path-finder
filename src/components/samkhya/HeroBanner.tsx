import { Link } from "react-router-dom";
import { samkhyaTokens } from "./tokens";

interface HeroBannerProps {
  bannerUrl?: string;
  bannerMobileUrl?: string;
  bannerTitle?: string;
  bannerSubtitle?: string;
}

const DEFAULT_BANNER_DESKTOP =
  "https://fwezkasjfguarjmjxifh.supabase.co/storage/v1/object/public/portal_images/banner-principal.svg";
const DEFAULT_BANNER_MOBILE =
  "https://fwezkasjfguarjmjxifh.supabase.co/storage/v1/object/public/portal_images/banner-principal.svg";

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
    </Link>
  );
};

export default HeroBanner;
