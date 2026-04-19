import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { samkhyaTokens } from "./tokens";

interface CarouselSectionProps {
  title: string;
  to?: string;
  children: ReactNode;
}

const CarouselSection = ({ title, to, children }: CarouselSectionProps) => {
  const titleNode = (
    <h2
      className="text-2xl md:text-3xl italic font-light tracking-wide hover:opacity-80 transition-opacity"
      style={{
        color: samkhyaTokens.roxo,
        fontFamily: "Georgia, 'Times New Roman', serif",
      }}
    >
      ✦ {title} ✦
    </h2>
  );

  return (
    <section className="py-5 md:py-7">
      <div className="text-center mb-5">
        {to ? <Link to={to}>{titleNode}</Link> : titleNode}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {children}
      </div>
    </section>
  );
};

export default CarouselSection;
