/**
 * Banner Hero da Loja Samkhya — elefante / frete grátis.
 * Renderizado entre o Header global e a SamkhyaNavBar.
 */
const HeroBanner = () => {
  return (
    <div className="relative w-full">
      <img
        src="https://fwezkasjfguarjmjxifh.supabase.co/storage/v1/object/public/portal_images/banner-samkhya-portal.jpg"
        alt="Banner Samkhya — Frete grátis"
        className="hidden md:block w-full h-auto"
      />
      <img
        src="https://fwezkasjfguarjmjxifh.supabase.co/storage/v1/object/public/portal_images/banner-samkhya-mobile.jpg"
        alt="Banner Samkhya — Frete grátis"
        className="block md:hidden w-full h-auto"
        onError={(e) => {
          // fallback: usa o desktop se mobile não existir
          (e.currentTarget as HTMLImageElement).src =
            "https://fwezkasjfguarjmjxifh.supabase.co/storage/v1/object/public/portal_images/banner-samkhya-portal.jpg";
        }}
      />
    </div>
  );
};

export default HeroBanner;
