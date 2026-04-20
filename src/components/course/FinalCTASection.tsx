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
    <section className="py-14 md:py-20" style={{ background: "#352F54" }}>
      <div className="max-w-3xl mx-auto px-6 text-center text-white">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="font-serif italic font-bold text-3xl md:text-4xl mb-5 leading-tight"
        >
          {data.headline}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-base md:text-lg text-white/85 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          {data.subheadline}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="inline-flex flex-col items-center gap-1 mb-8"
        >
          <p className="font-serif font-bold text-4xl md:text-5xl">{data.priceNew}</p>
          <p className="text-sm md:text-base text-white/80">ou {data.installments}</p>
          <p className="text-xs md:text-sm text-white/70 italic mt-2 max-w-md">
            {data.highlight}
          </p>
        </motion.div>

        <motion.button
          onClick={onCtaClick}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="group inline-flex items-center gap-3 font-bold text-sm md:text-base uppercase tracking-wide px-8 md:px-12 py-4 md:py-5 shadow-lg hover:shadow-xl rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm w-full md:w-auto md:max-w-md justify-center"
          style={{ background: branding.darkColor, color: "#FFFFFF" }}
        >
          {data.ctaText}
          <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
        </motion.button>
      </div>
    </section>
  );
};

export default FinalCTASection;
