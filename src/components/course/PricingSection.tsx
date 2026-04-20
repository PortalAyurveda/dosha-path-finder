import { motion } from "framer-motion";
import { ShieldCheck, ArrowRight } from "lucide-react";
import type { CoursePricingData, CourseBranding } from "@/data/courses/courseTypes";

interface PricingSectionProps {
  data: CoursePricingData;
  branding: CourseBranding;
  onCtaClick: () => void;
}

const PricingSection = ({ data, branding, onCtaClick }: PricingSectionProps) => {
  return (
    <section className="py-16 md:py-24 bg-[#0F1419] text-white relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 30% 20%, ${branding.primaryColor} 0%, transparent 50%), radial-gradient(circle at 70% 80%, ${branding.darkColor} 0%, transparent 50%)`,
        }}
      />

      <div className="relative max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
        >
          <span className="text-sm md:text-base uppercase tracking-widest text-white/60 font-bold">
            Investimento
          </span>

          <p className="text-xl md:text-2xl line-through text-white/40 mt-6 mb-2">
            {data.priceOld}
          </p>

          <p
            className="font-serif font-bold text-5xl md:text-7xl lg:text-8xl mb-3 leading-none"
            style={{ color: branding.primaryColor }}
          >
            {data.priceNew}
          </p>

          <p className="text-lg md:text-2xl text-white/90 mb-2">
            ou <span className="font-bold">{data.installments}</span>
          </p>

          <p className="text-base md:text-lg text-white/70 max-w-xl mx-auto mb-10 italic">
            {data.highlight}
          </p>

          <motion.button
            onClick={onCtaClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="group inline-flex items-center gap-3 font-bold text-base md:text-xl uppercase tracking-wide px-10 md:px-14 py-5 md:py-7 shadow-2xl transition-all rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm w-full md:w-auto justify-center animate-pulse hover:animate-none"
            style={{
              background: branding.primaryColor,
              color: "#0F1419",
              boxShadow: `0 20px 60px ${branding.primaryColor}66`,
            }}
          >
            {data.ctaText}
            <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
          </motion.button>

          <div
            className="mt-10 inline-flex items-start gap-4 p-5 md:p-6 max-w-2xl mx-auto bg-white/5 border border-white/10 rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm text-left"
          >
            <span
              className="shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
              style={{ background: branding.primaryColor }}
            >
              <ShieldCheck className="h-6 w-6 text-[#0F1419]" />
            </span>
            <p className="text-sm md:text-base text-white/85 leading-relaxed">
              {data.guarantee}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingSection;
