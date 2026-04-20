import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { CourseFinalCTAData, CourseBranding } from "@/data/courses/courseTypes";

interface FinalCTASectionProps {
  data: CourseFinalCTAData;
  branding: CourseBranding;
  onCtaClick: () => void;
}

const FinalCTASection = ({ data, branding, onCtaClick }: FinalCTASectionProps) => {
  return (
    <section
      className="py-16 md:py-28 relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, #0F1419 0%, ${branding.darkColor} 60%, ${branding.primaryColor} 100%)`,
      }}
    >
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.4) 0%, transparent 40%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.3) 0%, transparent 40%)",
        }}
      />

      <div className="relative max-w-4xl mx-auto px-6 text-center text-white">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="font-serif italic font-bold text-3xl md:text-5xl lg:text-6xl mb-6 leading-tight drop-shadow-lg"
        >
          {data.headline}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="text-base md:text-xl text-white/90 max-w-3xl mx-auto mb-10 leading-relaxed"
        >
          {data.subheadline}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="inline-flex flex-col items-center gap-2 mb-8"
        >
          <p className="font-serif font-bold text-4xl md:text-6xl">{data.priceNew}</p>
          <p className="text-base md:text-lg text-white/80">ou {data.installments}</p>
          <p className="text-sm md:text-base text-white/70 italic mt-2 max-w-md">
            {data.highlight}
          </p>
        </motion.div>

        <motion.button
          onClick={onCtaClick}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="group inline-flex items-center gap-3 font-bold text-base md:text-xl uppercase tracking-wide px-10 md:px-16 py-5 md:py-7 bg-white shadow-2xl rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm w-full md:w-auto md:max-w-md justify-center"
          style={{ color: branding.darkColor }}
        >
          {data.ctaText}
          <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
        </motion.button>
      </div>
    </section>
  );
};

export default FinalCTASection;
