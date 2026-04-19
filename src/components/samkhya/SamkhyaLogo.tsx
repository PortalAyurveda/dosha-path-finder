import { samkhyaTokens } from "./tokens";

interface SamkhyaLogoProps {
  logoUrl?: string;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: "text-2xl",
  md: "text-4xl md:text-5xl",
  lg: "text-5xl md:text-6xl",
};

const SamkhyaLogo = ({ logoUrl, size = "md" }: SamkhyaLogoProps) => {
  if (logoUrl) {
    const heightMap = { sm: "h-8", md: "h-12 md:h-16", lg: "h-16 md:h-20" };
    return <img src={logoUrl} alt="samkhya" className={`${heightMap[size]} w-auto`} />;
  }
  return (
    <span
      className={`${sizeMap[size]} font-light lowercase tracking-wide`}
      style={{ color: samkhyaTokens.roxo, fontFamily: "Georgia, 'Times New Roman', serif" }}
    >
      samkhya
    </span>
  );
};

export default SamkhyaLogo;
