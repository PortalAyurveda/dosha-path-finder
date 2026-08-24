import { Link } from "react-router-dom";
import BannerSlot from "@/components/banners/BannerSlot";

interface HeroBannerProps {
  bannerUrl?: string;
  bannerMobileUrl?: string;
  bannerTitle?: string;
  bannerSubtitle?: string;
}

const DEFAULT_BANNER_DESKTOP =
  "https://api.portalayurveda.com/storage/v1/object/public/portal_images/banner-principal-samkhya-2.gif";
const DEFAULT_BANNER_MOBILE =
  "https://api.portalayurveda.com/storage/v1/object/public/portal_images/banner-principal-samkhya-2.gif";

/**
 * Banner Hero da Loja Samkhya — vem do CMS (slot `samkhya_hero`).
 * A arte fixa antiga continua como conteúdo de reserva.
 */
const HeroBanner = ({
  bannerUrl = DEFAULT_BANNER_DESKTOP,
  bannerMobileUrl = DEFAULT_BANNER_MOBILE,
  bannerTitle = "FRETE GRÁTIS",
  bannerSubtitle = "em compras a partir de R$350,00",
}: HeroBannerProps) => {
  const fallback = (
    <Link
      to="/samkhya"
      aria-label="Ir para a Loja Samkhya"
      className="relative block w-full"
    >
      <img
        src={bannerUrl}
        alt="Banner Samkhya"
        width={1920}
        height={550}
        className="hidden md:block w-full h-auto"
        loading="eager"
        fetchPriority="high"
        decoding="async"
      />
      <img
        src={bannerMobileUrl}
        alt="Banner Samkhya"
        width={1920}
        height={550}
        className="block md:hidden w-full h-auto"
        loading="eager"
        fetchPriority="high"
        decoding="async"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = bannerUrl;
        }}
      />
    </Link>
  );

  return (
    <div style={{ aspectRatio: "1600 / 459" }} className="w-full">
      <BannerSlot
        slot="samkhya_hero"
        rotacao="pageview"
        className="block w-full [&_img]:w-full [&_img]:h-auto [&_img]:block"
        fallback={fallback}
      />
    </div>
  );
};

export default HeroBanner;

